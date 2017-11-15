pragma solidity ^0.4.11;
import "./HumanStandardToken.sol";
import "./Disbursement.sol";
import "./SafeMath.sol";

contract Sale {

    // EVENTS
    event TransferredTimelockedTokens(address beneficiary, address disbursement,uint beneficiaryTokens);
    event PurchasedTokens(address indexed purchaser, uint amount);
    event LockedUnsoldTokens(uint numTokensLocked, address disburser);

    // STORAGE
    uint public constant TOTAL_SUPPLY = 1000000000000000000;
    uint public constant MAX_PRIVATE = 750000000000000000;

    uint8 public constant DECIMALS = 9;
    string public constant NAME = "Leverj";
    string public constant SYMBOL = "LEV";
    address public owner;
    address public whitelistAdmin;
    address public wallet;
    HumanStandardToken public token;
    uint public freezeBlock;
    uint public startBlock;
    uint public endBlock;
    uint public price_in_wei = 333333; //wei per 10**-9 of a LEV!
    uint public privateAllocated = 0;
    bool public setupCompleteFlag = false;
    bool public emergencyFlag = false;
    address[] public disbursements;
    mapping(address => uint) public whitelistRegistrants;
    mapping(address => bool) public whitelistRegistrantsFlag;
    bool public publicSale = false;

    // PUBLIC FUNCTIONS
    function Sale(
        address _owner,
        uint _freezeBlock,
        uint _startBlock,
        uint _endBlock,
        address _whitelistAdmin)
        public 
        checkBlockNumberInputs(_freezeBlock, _startBlock, _endBlock)
    {
        owner = _owner;
        whitelistAdmin = _whitelistAdmin;
        token = new HumanStandardToken(TOTAL_SUPPLY, NAME, DECIMALS, SYMBOL, address(this));
        freezeBlock = _freezeBlock;
        startBlock = _startBlock;
        endBlock = _endBlock;
        assert(token.transfer(this, token.totalSupply()));
        assert(token.balanceOf(this) == token.totalSupply());
        assert(token.balanceOf(this) == TOTAL_SUPPLY);
    }

    function purchaseTokens()
        public
        payable
        setupComplete
        notInEmergency
        saleInProgress
    {
        require(whitelistRegistrantsFlag[msg.sender] == true);
        /* Calculate whether any of the msg.value needs to be returned to
           the sender. The purchaseAmount is the actual number of tokens which
           will be purchased. */
        uint purchaseAmount = msg.value / price_in_wei; 
        uint excessAmount = msg.value % price_in_wei;

        if (!publicSale){
            require(whitelistRegistrants[msg.sender] > 0 );
            uint tempWhitelistAmount = whitelistRegistrants[msg.sender];
            if (purchaseAmount > whitelistRegistrants[msg.sender]){
                uint extra = SafeMath.sub(purchaseAmount,whitelistRegistrants[msg.sender]);
                purchaseAmount = whitelistRegistrants[msg.sender];
                excessAmount = SafeMath.add(excessAmount,extra*price_in_wei);
            }
            whitelistRegistrants[msg.sender] = SafeMath.sub(whitelistRegistrants[msg.sender], purchaseAmount);
            assert(whitelistRegistrants[msg.sender] < tempWhitelistAmount);
        }  

        // Cannot purchase more tokens than this contract has available to sell
        require(purchaseAmount <= token.balanceOf(this));
        // Return any excess msg.value
        if (excessAmount > 0){
            msg.sender.transfer(excessAmount);
        }
        // Forward received ether minus any excessAmount to the wallet
        wallet.transfer(this.balance);
        // Transfer the sum of tokens tokenPurchase to the msg.sender
        assert(token.transfer(msg.sender, purchaseAmount));
        PurchasedTokens(msg.sender, purchaseAmount);
    }

    function lockUnsoldTokens(address _unsoldTokensWallet)
        public
        saleEnded
        setupComplete
        onlyOwner
    {
        Disbursement disbursement = new Disbursement(
            _unsoldTokensWallet,
            1*365*24*60*60,
            block.timestamp
        );
        disbursement.setup(token);
        uint amountToLock = token.balanceOf(this);
        disbursements.push(disbursement);
        token.transfer(disbursement, amountToLock);
        LockedUnsoldTokens(amountToLock, disbursement);
    }

    // OWNER-ONLY FUNCTIONS
    function distributeTimelockedTokens(
        address[] _beneficiaries,
        uint[] _beneficiariesTokens,
        uint[] _timelockStarts,
        uint[] _periods
    ) 
        public
        onlyOwner
        saleNotEnded
    { 
        assert(!setupCompleteFlag);
        assert(_beneficiariesTokens.length < 11);
        assert(_beneficiaries.length == _beneficiariesTokens.length);
        assert(_beneficiariesTokens.length == _timelockStarts.length);
        assert(_timelockStarts.length == _periods.length);
        for(uint i = 0; i < _beneficiaries.length; i++) {
            require(privateAllocated + _beneficiariesTokens[i] <= MAX_PRIVATE);
            privateAllocated = SafeMath.add(privateAllocated, _beneficiariesTokens[i]);
            address beneficiary = _beneficiaries[i];
            uint beneficiaryTokens = _beneficiariesTokens[i];
            Disbursement disbursement = new Disbursement(
                beneficiary,
                _periods[i],
                _timelockStarts[i]
            );
            disbursement.setup(token);
            token.transfer(disbursement, beneficiaryTokens);
            disbursements.push(disbursement);
            TransferredTimelockedTokens(beneficiary, disbursement, beneficiaryTokens);
        }
        assert(token.balanceOf(this) >= (SafeMath.sub(TOTAL_SUPPLY, MAX_PRIVATE)));
    }

    function distributePresaleTokens(address[] _buyers, uint[] _amounts)
        public
        onlyOwner
        saleNotEnded
    {
        assert(!setupCompleteFlag);
        require(_buyers.length < 11);
        require(_buyers.length == _amounts.length);
        for(uint i=0; i < _buyers.length; i++){
            require(SafeMath.add(privateAllocated, _amounts[i]) <= MAX_PRIVATE);
            assert(token.transfer(_buyers[i], _amounts[i]));
            privateAllocated = SafeMath.add(privateAllocated, _amounts[i]);
            PurchasedTokens(_buyers[i], _amounts[i]);
        }
        assert(token.balanceOf(this) >= (SafeMath.sub(TOTAL_SUPPLY, MAX_PRIVATE)));
    }

    function removeTransferLock()
        public
        onlyOwner
    {
        token.removeTransferLock();
    }

    function reversePurchase(address _tokenHolder)
        payable
        public
        onlyOwner
    {
        uint refund = SafeMath.mul(token.balanceOf(_tokenHolder),price_in_wei);
        require(msg.value >= refund);
        uint excessAmount = SafeMath.sub(msg.value, refund);
        if (excessAmount > 0) {
            msg.sender.transfer(excessAmount);
        }

        _tokenHolder.transfer(refund);
        token.reversePurchase(_tokenHolder);
    }

    function setSetupComplete()
        public
        onlyOwner
    {
        require(wallet!=0);
        require(privateAllocated!=0);  
        setupCompleteFlag = true;
    }

    function configureWallet(address _wallet)
        public
        onlyOwner
    {
        wallet = _wallet;
    }

    function changeOwner(address _newOwner)
        public
        onlyOwner
    {
        require(_newOwner != 0);
        owner = _newOwner;
    }

    function changeWhitelistAdmin(address _newAdmin)
        public
        onlyOwner
    {
        require(_newAdmin != 0);
        whitelistAdmin = _newAdmin;
    }

    function changePrice(uint _newPrice)
        public
        onlyOwner
        notFrozen
        validPrice(_newPrice)
    {
        price_in_wei = _newPrice;
    }

    function changeStartBlock(uint _newBlock)
        public
        onlyOwner
        notFrozen
    {
        require(block.number <= _newBlock && _newBlock < startBlock);
        freezeBlock = SafeMath.sub(_newBlock , SafeMath.sub(startBlock, freezeBlock));
        startBlock = _newBlock;
    }

    function emergencyToggle()
        public
        onlyOwner
    {
        emergencyFlag = !emergencyFlag;
    }
    
    function addWhitelist(address[] _purchaser, uint[] _amount)
        public
        onlyWhitelistAdmin
        saleNotEnded
    {
        assert(_purchaser.length < 11 );
        assert(_purchaser.length == _amount.length);
        for(uint i = 0; i < _purchaser.length; i++) {
            whitelistRegistrants[_purchaser[i]] = _amount[i];
            whitelistRegistrantsFlag[_purchaser[i]] = true;
            
        }
    }

    function startPublicSale()
        public
        onlyOwner
    {
        if (!publicSale){
            publicSale = true;
        }
    }

    // MODIFIERS
    modifier saleEnded {
        require(block.number >= endBlock);
        _;
    }
    modifier saleNotEnded {
        require(block.number < endBlock);
        _;
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    modifier onlyWhitelistAdmin {
        require(msg.sender == owner || msg.sender == whitelistAdmin);
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