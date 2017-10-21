# Unit Tests

## Sale

### Creation
`function Sale(address _owner, uint _freezeBlock, uint _startBlock, uint _endBlock)`
- create with "real" inputs
- create with owner=0
- create with owner invalid
- create with freezeBlock=0
- create with freezeblock < block.number
- create with freezeblock > startblock
- create with freezeblock > endblock
- create with freezeblock = startblock
- create with freezeblock = endblock
- create with underflow freezeblock
- create with overflow freezeblock
- create with low freezeblock
- create with high freezeblock
- create with startBlock=0
- create with startblock < block.number
- create with startblock > endblock
- create with startblock = endblock
- create with negative startblock
- create with underflow startblock
- create with overflow startblock
- create with low startblock
- create with high startblock
- create with endBlock=0
- create with endblock < block.number
- create with underflow startblock
- create with overflow startblock
- create with low endblock
- create with high endblock
- create with negative endblock


### Distribute Time Locks
`function distributeTimeLockedTokens(address[] _beneficiaries, uint[] _beneficiaryTokens, uint[] _timelocks, uint[] _breakdown)`
- call with "real" founder inputs
- call with "real" partner inputs
- call as non-owner
- call with "real" liquidity inputs
- call with "real" presale inputs
- call with no beneficiaries
- call with no beneficiaryTokes
- call with no timelocks
- call with no breakdown
- call with beneficiaries.length > 50
- call with beneficiaryTokess.length > 50
- call with timelocks.length > 50
- call with breakdown.length > 50
- call with beneficiary.length != tokens.length
- call with timelock.length != breakdown.length
- call until max is hit
- call in parallel
- call after setup complete
- call with single tranch
- call with multiple tranch
- call with even breakdowns
- call with lobsided breakdowns
- call with overflow beneficiarytokens
- call with underflow beneficiarytokens
- call with overflow timelocks
- call with underflow timelocks
- call with overflow breakdowns
- call with underflow breakdowns

### Configure Wallet
`function configureWallet(address _wallet)`
- call as owner
- call as non-owner
- call with address 0
- call with valid address


### Add Whitelist    
`function addWhitelist(address[] _purchaser, uint[] _amount)`
- call as owner
- call as non-owner
- call with address 0
- call with array lengths not equal
- call with amount 0
- call with amount under 1eth worth
- call with amount over 500eth worh
- call with underflow amount
- call with overflow amount
- call with purchaser.length > 50
- call with amount.length > 50

### Setup Complete
`function setSetupComplete()`

### Change Owner
 `function changeOwner(address _newOwner)`
- call with same owner
- call with owner 0
- call with new owner

### Change Price
`function changePrice(uint _newPrice)`
- call with price 0
- call with low price
- call with high price

### Change Start Block
`function changeStartBlock(uint _newBlock)`
- create with newBlock=0
- create with newBlock < block.number
- create with newBlock > endblock
- create with newBlock = endblock
- create with negative newBlock

### Toggle Emergency
`function emergencyToggle()`
- call before frozen
- call on frozen block
- call after frozen before start
- call after start before end
- call after end

### Purchase
`purchase()`
- call before setup complete
- call without emergency
- call with emergency
- call before frozen
- call on frozen block
- call after frozen before start
- call after start before end
- call after end

- call without ether
- call with even amount
- call with uneven amount

### Lock Unsold
`lockUnsold()`
- call before setup complete
- call after setup complete
- call before sale ends
- call before sale ends

## Token
`HumanStandardToken()`
- call with correct parameters

`Transfer()`
- call with correct parameters
- call with incorrect parameters

`approve()`
- call with correct parameters
- call with incorrect parameters

`allowance()`
- call with correct parameters
- call with incorrect parameters

`transferFrom()`
- call with correct parameters
- call with incorrect parameters


## Multisig
`MultiSigWallet()`
- call with correct parameters

`addOwner()`
- call with correct parameters
- call with incorrect parameters

`removeOwner()`
- call with correct parameters
- call with incorrect parameters

`replaceOwner()`
- call with correct parameters
- call with incorrect parameters

`confirmTransaction()`
- call with correct parameters
- call with incorrect paramters


## Filter
TBC


## Disbursement
`Disbursement()`
- call with correct parameters

`setup()`
- call with correct parameters
- call with incorrect parameters

`withdraw()`
- call with correct paramters
- call with incorrect parameters