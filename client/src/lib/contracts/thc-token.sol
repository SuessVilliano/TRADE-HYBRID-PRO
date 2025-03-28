// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TradeHybridCoin
 * @dev ERC20 Token for Trade Hybrid platform that implements fee reduction and staking
 * 
 * Note: This is a simplified Solidity contract for demonstration purposes.
 * In actual implementation, this would be a Solana program written in Rust.
 */
contract TradeHybridCoin {
    string public name = "Trade Hybrid Coin";
    string public symbol = "THC";
    uint8 public decimals = 6;
    uint256 public totalSupply = 1_000_000_000 * 10**6; // 1 billion tokens with 6 decimals
    
    // Internal balances map
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Staking information
    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 duration; // in seconds
        bool active;
    }
    
    mapping(address => StakingInfo) private _stakingInfo;
    
    // Fee reduction tiers
    struct FeeReductionTier {
        uint256 minHolding;
        uint8 reductionPercentage;
    }
    
    FeeReductionTier[] public feeReductionTiers;
    
    // Staking APY tiers
    struct StakingApyTier {
        uint256 minDuration; // in seconds
        uint8 apyPercentage;
    }
    
    StakingApyTier[] public stakingApyTiers;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Stake(address indexed user, uint256 amount, uint256 duration);
    event Unstake(address indexed user, uint256 amount, uint256 reward);
    event FeeReduction(address indexed user, uint256 amount, uint8 reduction);
    
    /**
     * @dev Constructor that initializes the token and sets up tiers
     */
    constructor() {
        // Initialize balance to deployer
        _balances[msg.sender] = totalSupply;
        
        // Set up fee reduction tiers
        feeReductionTiers.push(FeeReductionTier(0, 0));           // 0% reduction with 0 THC
        feeReductionTiers.push(FeeReductionTier(100 * 10**6, 10)); // 10% reduction with 100 THC
        feeReductionTiers.push(FeeReductionTier(1000 * 10**6, 25)); // 25% reduction with 1,000 THC
        feeReductionTiers.push(FeeReductionTier(10000 * 10**6, 40)); // 40% reduction with 10,000 THC
        feeReductionTiers.push(FeeReductionTier(100000 * 10**6, 50)); // 50% reduction with 100,000 THC
        
        // Set up staking APY tiers
        stakingApyTiers.push(StakingApyTier(30 days, 5));  // 5% APY for 30-day staking
        stakingApyTiers.push(StakingApyTier(90 days, 8));  // 8% APY for 90-day staking
        stakingApyTiers.push(StakingApyTier(180 days, 12)); // 12% APY for 180-day staking
        stakingApyTiers.push(StakingApyTier(365 days, 15)); // 15% APY for 365-day staking
        
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev Returns the balance of an account
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Transfers tokens to a recipient
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
    
    /**
     * @dev Returns allowance for spender
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    /**
     * @dev Approves allowance for spender
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(sender != address(0), "Transfer from zero address");
        require(recipient != address(0), "Transfer to zero address");
        require(_balances[sender] >= amount, "Insufficient balance");
        require(_allowances[sender][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _allowances[sender][msg.sender] -= amount;
        
        emit Transfer(sender, recipient, amount);
        return true;
    }
    
    /**
     * @dev Stakes tokens for a specified duration
     */
    function stake(uint256 amount, uint256 durationDays) public returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        require(durationDays >= 30, "Minimum staking period is 30 days");
        require(!_stakingInfo[msg.sender].active, "Already staking");
        
        // Transfer tokens to staking pool
        _balances[msg.sender] -= amount;
        
        // Record staking information
        _stakingInfo[msg.sender] = StakingInfo({
            amount: amount,
            startTime: block.timestamp,
            duration: durationDays * 1 days,
            active: true
        });
        
        emit Stake(msg.sender, amount, durationDays);
        return true;
    }
    
    /**
     * @dev Unstakes tokens and claims rewards
     */
    function unstake() public returns (bool) {
        StakingInfo storage stakingInfo = _stakingInfo[msg.sender];
        require(stakingInfo.active, "No active staking");
        
        uint256 stakingEndTime = stakingInfo.startTime + stakingInfo.duration;
        bool earlyUnstake = block.timestamp < stakingEndTime;
        
        // Calculate rewards based on time staked and APY
        uint256 timeStaked;
        if (earlyUnstake) {
            timeStaked = block.timestamp - stakingInfo.startTime;
        } else {
            timeStaked = stakingInfo.duration;
        }
        
        uint256 reward = calculateStakingReward(stakingInfo.amount, timeStaked);
        
        // Return staked amount plus rewards
        _balances[msg.sender] += stakingInfo.amount;
        
        // Add rewards if not an early unstake
        if (!earlyUnstake) {
            _balances[msg.sender] += reward;
        }
        
        // Clear staking info
        stakingInfo.active = false;
        
        emit Unstake(msg.sender, stakingInfo.amount, earlyUnstake ? 0 : reward);
        return true;
    }
    
    /**
     * @dev Gets APY tier based on staking duration
     */
    function getApyTier(uint256 durationInSeconds) public view returns (uint8) {
        uint8 apy = 0;
        
        for (uint i = 0; i < stakingApyTiers.length; i++) {
            if (durationInSeconds >= stakingApyTiers[i].minDuration) {
                apy = stakingApyTiers[i].apyPercentage;
            } else {
                break;
            }
        }
        
        return apy;
    }
    
    /**
     * @dev Calculate staking reward based on amount, time staked, and APY
     */
    function calculateStakingReward(uint256 amount, uint256 timeStakedInSeconds) public view returns (uint256) {
        // Get APY percentage based on full staking duration
        uint8 apyPercentage = getApyTier(timeStakedInSeconds);
        
        // Calculate reward: amount * APY * (timeStaked / 365 days)
        return amount * apyPercentage * timeStakedInSeconds / (365 days * 100);
    }
    
    /**
     * @dev Gets fee reduction based on THC holdings
     */
    function getFeeReductionPercentage(address user) public view returns (uint8) {
        uint256 balance = _balances[user];
        uint8 reduction = 0;
        
        for (uint i = 0; i < feeReductionTiers.length; i++) {
            if (balance >= feeReductionTiers[i].minHolding) {
                reduction = feeReductionTiers[i].reductionPercentage;
            } else {
                break;
            }
        }
        
        return reduction;
    }
    
    /**
     * @dev Calculates trading fee with THC reduction
     */
    function calculateTradingFee(uint256 tradeAmount, address user, uint256 baseFeePoints) public view returns (uint256) {
        // baseFeePoints is in basis points (0.01%), e.g., 25 = 0.25%
        uint8 reduction = getFeeReductionPercentage(user);
        uint256 reducedFeePoints = baseFeePoints * (100 - reduction) / 100;
        
        return tradeAmount * reducedFeePoints / 10000; // Convert basis points to actual percentage
    }
}