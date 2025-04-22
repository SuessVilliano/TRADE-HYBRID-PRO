use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use std::convert::TryFrom;

declare_id!("tHCStAk1ng1111111111111111111111111111111");

// THC token mint address
pub const THC_TOKEN_MINT: &str = "4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4";
// Validator identity address
pub const VALIDATOR_IDENTITY: &str = "5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej";

#[program]
pub mod thc_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let staking_authority = &mut ctx.accounts.staking_authority;
        staking_authority.authority = ctx.accounts.authority.key();
        staking_authority.validator = Pubkey::from_str(VALIDATOR_IDENTITY).unwrap();
        staking_authority.token_mint = Pubkey::from_str(THC_TOKEN_MINT).unwrap();
        staking_authority.rewards_pool = ctx.accounts.rewards_pool.key();
        staking_authority.total_staked = 0;
        staking_authority.staker_count = 0;
        staking_authority.bumps = ctx.bumps;
        
        msg!("THC Staking program initialized successfully");
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64, lock_period_days: u16) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        // Calculate APY based on lock period
        let apy = calculate_apy(lock_period_days);
        
        // Get current timestamp
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        
        // Calculate unlock time
        let unlock_timestamp = current_timestamp + (lock_period_days as i64 * 86400); // 86400 seconds = 1 day
        
        // Create a new stake account
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.owner = ctx.accounts.owner.key();
        stake_account.stake_authority = ctx.accounts.staking_authority.key();
        stake_account.token_account = ctx.accounts.token_account.key();
        stake_account.deposit_amount = amount;
        stake_account.start_time = current_timestamp;
        stake_account.unlock_time = unlock_timestamp;
        stake_account.apy = apy;
        stake_account.rewards_claimed = 0;
        stake_account.last_claimed_time = current_timestamp;
        stake_account.is_active = true;
        stake_account.bump = ctx.bumps.stake_account;
        
        // Transfer tokens from user to staking vault
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.token_account.to_account_info(),
            to: ctx.accounts.staking_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_cpi_accounts,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        // Update staking authority
        let staking_authority = &mut ctx.accounts.staking_authority;
        staking_authority.total_staked = staking_authority.total_staked.checked_add(amount).unwrap();
        staking_authority.staker_count = staking_authority.staker_count.checked_add(1).unwrap();
        
        msg!("Staked {} THC tokens for {} days at {}% APY", 
            amount, lock_period_days, apy);
        
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let stake_account = &ctx.accounts.stake_account;
        
        // Check if the stake period has ended
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        
        require!(
            current_timestamp >= stake_account.unlock_time || ctx.accounts.staking_authority.authority == ctx.accounts.owner.key(),
            ErrorCode::StakingPeriodNotEnded
        );
        
        // Calculate accrued rewards
        let rewards = calculate_rewards(
            stake_account.deposit_amount,
            stake_account.apy,
            stake_account.start_time,
            current_timestamp,
            stake_account.rewards_claimed,
        )?;
        
        // Return the staked tokens
        let seeds = &[
            b"staking_authority",
            ctx.accounts.staking_authority.token_mint.as_ref(),
            &[ctx.accounts.staking_authority.bumps.staking_authority],
        ];
        let signer = &[&seeds[..]];
        
        // Transfer staked tokens back to the user
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.staking_vault.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.staking_authority.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_cpi_accounts,
            signer,
        );
        
        token::transfer(cpi_ctx, stake_account.deposit_amount)?;
        
        // If there are rewards, transfer them too
        if rewards > 0 {
            let transfer_rewards_cpi_accounts = Transfer {
                from: ctx.accounts.rewards_pool.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.staking_authority.to_account_info(),
            };
            
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_rewards_cpi_accounts,
                signer,
            );
            
            token::transfer(cpi_ctx, rewards)?;
        }
        
        // Update staking authority
        let staking_authority = &mut ctx.accounts.staking_authority;
        staking_authority.total_staked = staking_authority.total_staked.checked_sub(stake_account.deposit_amount).unwrap();
        staking_authority.staker_count = staking_authority.staker_count.checked_sub(1).unwrap();
        
        // Mark the stake account as inactive
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.is_active = false;
        
        msg!("Unstaked {} THC tokens with {} rewards", 
            stake_account.deposit_amount, rewards);
        
        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &ctx.accounts.stake_account;
        
        // Check if the stake is still active
        require!(stake_account.is_active, ErrorCode::InactiveStake);
        
        // Calculate accrued rewards
        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;
        
        let rewards = calculate_rewards(
            stake_account.deposit_amount,
            stake_account.apy,
            stake_account.last_claimed_time,
            current_timestamp,
            0,
        )?;
        
        // Check if there are rewards to claim
        require!(rewards > 0, ErrorCode::NoRewardsAvailable);
        
        // Transfer rewards to the user
        let seeds = &[
            b"staking_authority",
            ctx.accounts.staking_authority.token_mint.as_ref(),
            &[ctx.accounts.staking_authority.bumps.staking_authority],
        ];
        let signer = &[&seeds[..]];
        
        let transfer_rewards_cpi_accounts = Transfer {
            from: ctx.accounts.rewards_pool.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.staking_authority.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_rewards_cpi_accounts,
            signer,
        );
        
        token::transfer(cpi_ctx, rewards)?;
        
        // Update stake account
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.rewards_claimed = stake_account.rewards_claimed.checked_add(rewards).unwrap();
        stake_account.last_claimed_time = current_timestamp;
        
        msg!("Claimed {} THC tokens as rewards", rewards);
        
        Ok(())
    }
}

// Calculate APY based on staking period in days
fn calculate_apy(lock_period_days: u16) -> u16 {
    match lock_period_days {
        d if d >= 365 => 15, // 15% APY for 365+ days
        d if d >= 180 => 12, // 12% APY for 180+ days
        d if d >= 90 => 8,   // 8% APY for 90+ days
        _ => 5,              // 5% APY for 30+ days
    }
}

// Calculate rewards
fn calculate_rewards(
    amount: u64,
    apy: u16,
    start_time: i64,
    current_time: i64,
    already_claimed: u64,
) -> Result<u64> {
    // Calculate time difference in seconds
    let time_diff = current_time.checked_sub(start_time).unwrap();
    if time_diff <= 0 {
        return Ok(0);
    }
    
    // Convert time difference to years
    let time_in_years = time_diff as f64 / (365.0 * 86400.0);
    
    // Calculate rewards: principal * APY * time in years
    let rewards = (amount as f64 * (apy as f64 / 100.0) * time_in_years) as u64;
    
    // Subtract already claimed rewards
    let net_rewards = rewards.checked_sub(already_claimed).unwrap_or(0);
    
    Ok(net_rewards)
}

#[account]
pub struct StakingAuthority {
    pub authority: Pubkey,      // Admin authority
    pub validator: Pubkey,      // Validator identity
    pub token_mint: Pubkey,     // THC token mint
    pub rewards_pool: Pubkey,   // Token account holding rewards
    pub total_staked: u64,      // Total tokens staked
    pub staker_count: u64,      // Number of active stakers
    pub bumps: AuthorityBumps,  // PDA bumps
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,              // Owner of this stake account
    pub stake_authority: Pubkey,    // Staking authority PDA
    pub token_account: Pubkey,      // User's THC token account
    pub deposit_amount: u64,        // Amount of THC staked
    pub start_time: i64,            // Timestamp when staking started
    pub unlock_time: i64,           // Timestamp when tokens can be unstaked
    pub apy: u16,                   // Annual Percentage Yield (e.g., 500 = 5.00%)
    pub rewards_claimed: u64,       // Amount of rewards already claimed
    pub last_claimed_time: i64,     // Last time rewards were claimed
    pub is_active: bool,            // Whether the stake is still active
    pub bump: u8,                   // PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct AuthorityBumps {
    pub staking_authority: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid staking amount")]
    InvalidAmount,
    
    #[msg("Staking period has not ended yet")]
    StakingPeriodNotEnded,
    
    #[msg("No rewards available for claiming")]
    NoRewardsAvailable,
    
    #[msg("Stake is not active")]
    InactiveStake,
}

#[derive(Accounts)]
#[instruction()]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<StakingAuthority>(),
        seeds = [b"staking_authority", Pubkey::from_str(THC_TOKEN_MINT).unwrap().as_ref()],
        bump
    )]
    pub staking_authority: Account<'info, StakingAuthority>,
    
    #[account(
        constraint = rewards_pool.mint == Pubkey::from_str(THC_TOKEN_MINT).unwrap(),
        constraint = rewards_pool.owner == staking_authority.key(),
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64, lock_period_days: u16)]
pub struct Stake<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_authority", staking_authority.token_mint.as_ref()],
        bump = staking_authority.bumps.staking_authority,
    )]
    pub staking_authority: Account<'info, StakingAuthority>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + std::mem::size_of::<StakeAccount>(),
        seeds = [b"stake_account", owner.key().as_ref(), staking_authority.token_mint.as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        constraint = token_account.mint == staking_authority.token_mint,
        constraint = token_account.owner == owner.key(),
        constraint = token_account.amount >= amount
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = staking_vault.mint == staking_authority.token_mint,
        constraint = staking_vault.owner == staking_authority.key(),
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking_authority", staking_authority.token_mint.as_ref()],
        bump = staking_authority.bumps.staking_authority,
    )]
    pub staking_authority: Account<'info, StakingAuthority>,
    
    #[account(
        mut,
        seeds = [b"stake_account", owner.key().as_ref(), staking_authority.token_mint.as_ref()],
        bump = stake_account.bump,
        constraint = stake_account.owner == owner.key(),
        constraint = stake_account.is_active == true,
        close = owner
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        constraint = token_account.mint == staking_authority.token_mint,
        constraint = token_account.owner == owner.key(),
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = staking_vault.mint == staking_authority.token_mint,
        constraint = staking_vault.owner == staking_authority.key(),
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = rewards_pool.mint == staking_authority.token_mint,
        constraint = rewards_pool.owner == staking_authority.key(),
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        seeds = [b"staking_authority", staking_authority.token_mint.as_ref()],
        bump = staking_authority.bumps.staking_authority,
    )]
    pub staking_authority: Account<'info, StakingAuthority>,
    
    #[account(
        mut,
        seeds = [b"stake_account", owner.key().as_ref(), staking_authority.token_mint.as_ref()],
        bump = stake_account.bump,
        constraint = stake_account.owner == owner.key(),
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        constraint = token_account.mint == staking_authority.token_mint,
        constraint = token_account.owner == owner.key(),
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = rewards_pool.mint == staking_authority.token_mint,
        constraint = rewards_pool.owner == staking_authority.key(),
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}