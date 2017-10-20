
pragma solidity ^0.4.11;

import "./HumanStandardToken.sol";
import "./Disbursement.sol";
import "./Filter.sol";
import "./SafeMath.sol";

contract Sale {

    // EVENTS

    event TransferredVestedTokens(address indexed vault, uint tokens);
    event PurchasedTokens(address indexed purchaser, uint amount);
    event LockedUnsoldTokens(uint numTokensLocked, address disburser);

    // STORAGE

    uint public constant TOTAL_SUPPLY = 1000000000;
    uint public constant MAX_PRIVATE = 750000000;
    uint8 public constant MULTIPLIER = 9;
    string public constant NAME = "Leverj";
    string public constant SYMBOL = "LEV";

    address public owner;
    address public wallet;
    HumanStandardToken public token;
    uint public freezeBlock;
    uint public startBlock;
    uint public endBlock;
    uint public price_in_wei = 333333333333333; //actually

    address[] public filters;

    uint public privateAllocated = 0;
    bool public setupCompleteFlag = false;
    bool public emergencyFlag = false;

    mapping(address => uint) public whitelistRegistrants;

    // PUBLIC FUNCTIONS

    function Sale(
        address _owner,
        uint _freezeBlock,
        uint _startBlock,
        uint _endBlock)
        checkBlockNumberInputs(_freezeBlock, _startBlock, _endBlock)
    {
        owner = _owner;
        uint256 totalSupply = TOTAL_SUPPLY*(10**uint256(MULTIPLIER));
        token = new HumanStandardToken(totalSupply, NAME, MULTIPLIER, SYMBOL, address(this), _endBlock);
        freezeBlock = _freezeBlock;
        startBlock = _startBlock;
        endBlock = _endBlock;
        token.transfer(this, token.totalSupply());
        assert(token.balanceOf(this) == token.totalSupply());
        assert(token.balanceOf(this) == TOTAL_SUPPLY*(10**uint256(MULTIPLIER)));
    }

    function purchaseTokens()
        payable
        setupComplete
        notInEmergency
        saleInProgress
    {
        /* Calculate whether any of the msg.value needs to be returned to
           the sender. The purchaseAmount is the actual number of tokens which
           will be purchased. */
        uint purchaseAmount = msg.value / price_in_wei / 10**uint256(MULTIPLIER);  //TODO: check for overflows
        uint excessAmount = msg.value % (price_in_wei / 10**uint256(MULTIPLIER));  //TODO: check for overflow

        require(whitelistRegistrants[msg.sender] >= (msg.value - excessAmount));
        whitelistRegistrants[msg.sender] -= (msg.value-excessAmount);

        // Cannot purchase more tokens than this contract has available to sell
        require(purchaseAmount <= token.balanceOf(this));

        // Return any excess msg.value
        if (excessAmount > 0) {
            msg.sender.transfer(excessAmount);
        }

        // Forward received ether minus any excessAmount to the wallet
        wallet.transfer(this.balance);

        // Transfer the sum of tokens tokenPurchase to the msg.sender
        token.transfer(msg.sender, purchaseAmount);
        PurchasedTokens(msg.sender, purchaseAmount);
    }

    function lockUnsoldTokens()
        saleEnded
        setupComplete
    {
        //unsoldTokensWallet
        Disbursement disbursement = new Disbursement(
            wallet,
            1*365*24*60*60,
            block.timestamp
        );

        disbursement.setup(token);
        uint amountToLock = token.balanceOf(this);
        token.transfer(disbursement, amountToLock);
        LockedUnsoldTokens(amountToLock, disbursement);
    }

    // OWNER-ONLY FUNCTIONS

    function distributeTimeLockedTokens(
        address[] _beneficiaries,
        uint[] _beneficiaryTokens,
        uint[] _timelocks,
        uint[] _breakdown
    ) 
        public
        onlyOwner
    { 
        assert(!setupCompleteFlag);
        assert(_beneficiaryTokens.length < 51 && _timelocks.length < 51);
        assert(_timelocks.length == _breakdown.length);
        assert(_beneficiaries.length == _beneficiaryTokens.length);

        /* Total number of tokens to be disbursed for a given tranch. Used when
           tokens are transferred to disbursement contracts. */
        uint[] memory tokensPerTranch = new uint[](_timelocks.length);
        
        // Alias of founderTimelocks.length for legibility
        uint tranches = _timelocks.length;
        
        // The number of tokens which may be withdrawn per founder for each tranch
        uint[][] memory beneficiaryTokensPerTranch = new uint[][](_timelocks.length);

        for(uint l = 0; l < beneficiaryTokensPerTranch.length; l++){
            beneficiaryTokensPerTranch[l] = new uint[](_beneficiaryTokens.length);
        }

        uint[] memory remainders = new uint[](_beneficiaries.length);

        // Compute foundersTokensPerTranch and tokensPerTranch
        for(uint i = 0; i < _beneficiaryTokens.length; i++) {
            require(privateAllocated + _beneficiaryTokens[i] <= MAX_PRIVATE);
            remainders[i] = 0;

            // forgive me for this second for loop
            for(uint k = 0; k < _breakdown.length; k++){
                uint tokens = (_beneficiaryTokens[i] * _breakdown[k]) / 100;
                remainders[i] += (_beneficiaryTokens[i] * _breakdown[k]) % 100;
                beneficiaryTokensPerTranch[k][i] = tokens;
                tokensPerTranch[k] = tokensPerTranch[k] + beneficiaryTokensPerTranch[k][i];
            }

            //adding remainders to the last tranch
            beneficiaryTokensPerTranch[_timelocks.length-1][i] += remainders[i];
            tokensPerTranch[_timelocks.length-1] = tokensPerTranch[_timelocks.length-1] + remainders[i];
        }

        /* Deploy disbursement and filter contract pairs, initialize both and store
           filter addresses in filters array. Finally, transfer tokensPerTranch to
           disbursement contracts. */
        for(uint j = 0; j < tranches; j++) {
            Filter filter = new Filter(_beneficiaries, beneficiaryTokensPerTranch[j]);
            filters.push(filter);
            Disbursement vault = new Disbursement(filter, 1, _timelocks[j]);
            // Give the disbursement contract the address of the token it disburses.
            vault.setup(token);             
            /* Give the filter contract the address of the disbursement contract
               it access controls */
            filter.setup(vault);             
            // Transfer to the vault the tokens it is to disburse
            assert(token.transfer(vault, tokensPerTranch[j]));
            TransferredVestedTokens(vault, tokensPerTranch[j]);
        }

        assert(token.balanceOf(this) >= 25 * 10**16);
    }

    function setSetupComplete()
        onlyOwner
    {
        setupCompleteFlag = true;
    }

    function configureWallet(address _wallet)
        onlyOwner
    {
        wallet = _wallet;
    }

    function changeOwner(address _newOwner)
        onlyOwner
    {
        require(_newOwner != 0);
        owner = _newOwner;
    }

    function changePrice(uint _newPrice)
        onlyOwner
        notFrozen
        validPrice(_newPrice)
    {
        price_in_wei = _newPrice;
    }

    function changeStartBlock(uint _newBlock)
        onlyOwner
        notFrozen
    {
        require(block.number <= _newBlock && _newBlock < startBlock);
        freezeBlock = _newBlock - (startBlock - freezeBlock);
        startBlock = _newBlock;
    }

    function emergencyToggle()
        onlyOwner
    {
        emergencyFlag = !emergencyFlag;
    }
    
    function addWhitelist(address[] _purchaser, uint[] _amount)
        onlyOwner
    {
        assert(_purchaser.length < 51 );
        assert(_purchaser.length == _amount.length);
        for(uint i = 0; i < _purchaser.length; i++) {
            whitelistRegistrants[_purchaser[i]] = _amount[i];
        }
    }

    // MODIFIERS

    modifier saleEnded {
        require(block.number >= endBlock);
        _;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier notFrozen {
        require(block.number < freezeBlock);
        _;
    }

    modifier saleInProgress {
        require(block.number >= startBlock && block.number < endBlock);
        _;
    }

    modifier setupComplete {
        assert(setupCompleteFlag);
        _;
    }

    modifier notInEmergency {
        assert(emergencyFlag == false);
        _;
    }

    modifier checkBlockNumberInputs(uint _freeze, uint _start, uint _end) {
        require(_freeze >= block.number
        && _start >= _freeze
        && _end >= _start);
        _;
    }

    modifier validPrice(uint _price){
        require(_price > 0);
        _;
    }

}