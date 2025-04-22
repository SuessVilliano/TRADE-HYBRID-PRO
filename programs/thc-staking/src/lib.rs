use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer};
use anchor_lang::solana_program::clock::Clock;

declare_id!("tHCStAk1ng1111111111111111111111111111111");

#[program]
pub mod thc_staking {
    use super::*;

    // Initialize the staking program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let staking_authority = &mut ctx.accounts.staking_authority;
        
        // Set up authority account
        staking_authority.authority = ctx.accounts.authority.key();
        staking_authority.validator = Pubkey::from_str("5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej").unwrap();
        staking_authority.token_mint = Pubkey::from_str("4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4").unwrap();
        staking_authority.rewards_pool = ctx.accounts.rewards_pool.key();
        staking_authority.total_staked = 0;
        staking_authority.staker_count = 0;
        
        // Initialize bumps
        staking_authority.bumps = AuthorityBumps {
            staking_authority: *ctx.bumps.get("staking_authority").unwrap(),
        };
        
        Ok(())
    }

    // Stake THC tokens
    pub fn stake(ctx: Context<Stake>, amount: u64, lock_period_days: u16) -> Result<()> {
        if amount == 0 {
            return err!(StakingError::InvalidAmount);
        }

        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        
        // Calculate unlock time based on lock period
        let lock_period_seconds = (lock_period_days as i64) * 86400; // 86400 seconds = 1 day
        let unlock_time = current_time + lock_period_seconds;
        
        // Determine APY based on lock period
        let apy = match lock_period_days {
            d if d >= 365 => 1500, // 15.00%
            d if d >= 180 => 1200, // 12.00%
            d if d >= 90 => 800,   // 8.00%
            _ => 500,              // 5.00% default
        };
        
        // Initialize stake account
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.owner = ctx.accounts.owner.key();
        stake_account.stake_authority = ctx.accounts.staking_authority.key();
        stake_account.token_account = ctx.accounts.token_account.key();
        stake_account.deposit_amount = amount;
        stake_account.start_time = current_time;
        stake_account.unlock_time = unlock_time;
        stake_account.apy = apy;
        stake_account.rewards_claimed = 0;
        stake_account.last_claimed_time = current_time;
        stake_account.is_active = true;
        stake_account.bump = *ctx.bumps.get("stake_account").unwrap();
        
        // Transfer tokens from user to staking vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.staking_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;
        
        // Update staking stats
        let staking_authority = &mut ctx.accounts.staking_authority;
        staking_authority.total_staked = staking_authority.total_staked.checked_add(amount).unwrap();
        staking_authority.staker_count = staking_authority.staker_count.checked_add(1).unwrap();
        
        Ok(())
    }

    // Unstake THC tokens
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        
        // Check if staking period has ended
        let stake_account = &mut ctx.accounts.stake_account;
        if current_time < stake_account.unlock_time {
            return err!(StakingError::StakingPeriodNotEnded);
        }
        
        // Check if stake is active
        if !stake_account.is_active {
            return err!(StakingError::InactiveStake);
        }
        
        // Calculate rewards
        let time_staked = current_time - stake_account.last_claimed_time;
        let time_staked_years = time_staked as f64 / (365.0 * 86400.0);
        let apy_decimal = stake_account.apy as f64 / 10000.0;
        let rewards = (stake_account.deposit_amount as f64 * apy_decimal * time_staked_years) as u64;
        
        // Transfer principal back to user
        let staking_authority_seeds = &[
            b"staking_authority".as_ref(),
            ctx.accounts.staking_authority.token_mint.as_ref(),
            &[ctx.accounts.staking_authority.bumps.staking_authority],
        ];
        let staking_authority_signer = &[&staking_authority_seeds[..]];
        
        let transfer_principal_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.staking_vault.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.staking_authority.to_account_info(),
            },
            staking_authority_signer,
        );
        token::transfer(transfer_principal_ctx, stake_account.deposit_amount)?;
        
        // Transfer rewards if any
        if rewards > 0 {
            let transfer_rewards_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_pool.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.staking_authority.to_account_info(),
                },
                staking_authority_signer,
            );
            token::transfer(transfer_rewards_ctx, rewards)?;
        }
        
        // Update stake account
        stake_account.is_active = false;
        stake_account.rewards_claimed = stake_account.rewards_claimed.checked_add(rewards).unwrap();
        
        // Update staking stats
        let staking_authority = &mut ctx.accounts.staking_authority;
        staking_authority.total_staked = staking_authority.total_staked.checked_sub(stake_account.deposit_amount).unwrap();
        staking_authority.staker_count = staking_authority.staker_count.checked_sub(1).unwrap();
        
        Ok(())
    }

    // Claim rewards without unstaking
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;
        
        // Check if stake is active
        let stake_account = &mut ctx.accounts.stake_account;
        if !stake_account.is_active {
            return err!(StakingError::InactiveStake);
        }
        
        // Calculate rewards
        let time_staked = current_time - stake_account.last_claimed_time;
        let time_staked_years = time_staked as f64 / (365.0 * 86400.0);
        let apy_decimal = stake_account.apy as f64 / 10000.0;
        let rewards = (stake_account.deposit_amount as f64 * apy_decimal * time_staked_years) as u64;
        
        // Check if rewards are available
        if rewards == 0 {
            return err!(StakingError::NoRewardsAvailable);
        }
        
        // Transfer rewards to user
        let staking_authority_seeds = &[
            b"staking_authority".as_ref(),
            ctx.accounts.staking_authority.token_mint.as_ref(),
            &[ctx.accounts.staking_authority.bumps.staking_authority],
        ];
        let staking_authority_signer = &[&staking_authority_seeds[..]];
        
        let transfer_rewards_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.rewards_pool.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.staking_authority.to_account_info(),
            },
            staking_authority_signer,
        );
        token::transfer(transfer_rewards_ctx, rewards)?;
        
        // Update stake account
        stake_account.rewards_claimed = stake_account.rewards_claimed.checked_add(rewards).unwrap();
        stake_account.last_claimed_time = current_time;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + StakingAuthority::SIZE,
        seeds = [b"staking_authority", Pubkey::from_str("4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4").unwrap().as_ref()],
        bump,
    )]
    pub staking_authority: Account<'info, StakingAuthority>,
    
    /// CHECK: This account is validated in the instruction
    pub rewards_pool: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
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
        space = 8 + StakeAccount::SIZE,
        seeds = [b"stake_account", owner.key().as_ref(), staking_authority.token_mint.as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        constraint = token_account.owner == owner.key(),
        constraint = token_account.mint == staking_authority.token_mint,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = staking_vault.mint == staking_authority.token_mint,
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
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        constraint = token_account.owner == owner.key(),
        constraint = token_account.mint == staking_authority.token_mint,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = staking_vault.mint == staking_authority.token_mint,
    )]
    pub staking_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = rewards_pool.mint == staking_authority.token_mint,
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
        constraint = token_account.owner == owner.key(),
        constraint = token_account.mint == staking_authority.token_mint,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = rewards_pool.mint == staking_authority.token_mint,
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingAuthority {
    pub authority: Pubkey,           // 32
    pub validator: Pubkey,           // 32
    pub token_mint: Pubkey,          // 32
    pub rewards_pool: Pubkey,        // 32
    pub total_staked: u64,           // 8
    pub staker_count: u64,           // 8
    pub bumps: AuthorityBumps,       // 1
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,               // 32
    pub stake_authority: Pubkey,     // 32
    pub token_account: Pubkey,       // 32
    pub deposit_amount: u64,         // 8
    pub start_time: i64,             // 8
    pub unlock_time: i64,            // 8
    pub apy: u16,                    // 2 (stored as basis points, e.g., 500 = 5.00%)
    pub rewards_claimed: u64,        // 8
    pub last_claimed_time: i64,      // 8
    pub is_active: bool,             // 1
    pub bump: u8,                    // 1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct AuthorityBumps {
    pub staking_authority: u8,
}

#[error_code]
pub enum StakingError {
    #[msg("Invalid staking amount")]
    InvalidAmount,
    
    #[msg("Staking period has not ended yet")]
    StakingPeriodNotEnded,
    
    #[msg("No rewards available for claiming")]
    NoRewardsAvailable,
    
    #[msg("Stake is not active")]
    InactiveStake,
}

// Size constants
impl StakingAuthority {
    pub const SIZE: usize = 32 + 32 + 32 + 32 + 8 + 8 + 1;
}

impl StakeAccount {
    pub const SIZE: usize = 32 + 32 + 32 + 8 + 8 + 8 + 2 + 8 + 8 + 1 + 1;
}