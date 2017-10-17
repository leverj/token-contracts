
pragma solidity ^0.4.11;

import "tokens/HumanStandardToken.sol";
import "./Disbursement.sol";
import "./SafeMath.sol";

contract Sale {

    /*
     * Events
     */

    event TransferredFoundersTokens(address indexed beneficiary, address disburser, uint amount);
     event TransferredPartnersTokens(address indexed beneficiary, address disburser, uint amount);
    event TransferredLiquidityTokens(address liquidityWallet, uint liquidityTokens);
    event TransferredPreSaleTokens(address indexed beneficiary, address disburser, uint amount);
    event PurchasedTokens(address indexed purchaser, uint amount);
    event LockUnsoldTokens(uint numTokensLocked, address disburser);

    /*
     * Storage
     */

    address public owner;
    address public wallet;
    bool walletConfiguredFlag = false;

    HumanStandardToken public token;
    uint public price;

    uint public freezeBlock;
    uint public whitelistSaleStartBlock;
    uint public publicSaleStartBlock;
    uint public endBlock;

    uint public foundersTokenCap = 200000000;
    uint public foundersTokenAllocated = 0;

    uint public liquidityTokenCap = 300000000;
    uint public liquidityTokenAllocated = 0;

    uint public partnersTokenCap = 100000000;
    uint public partnersTokenAllocated = 0;

    uint public preSaleTokenCap = 150000000;
    uint public preSaleTokenAllocated = 0;

    uint public publicSaleTokenCap = 250000000;
    uint public publicTokensSold = 0;

    bool public emergencyFlag = false;

    mapping(address => uint) public whitelistRegistrants;
    bytes32 public termsAndConditionsIPFS;

    /*
     * Public functions
     */

    function Sale(
        address _owner,
        uint _tokenSupply,
        string _tokenName,
        uint8 _tokenDecimals,
        string _tokenSymbol,
        uint _freezeBlock,
        uint _whitelistSaleStartBlock,
        uint _publicSaleStartBlock,
        uint _endBlock,
        uint _price)
        checkBlockNumberInputs(_freezeBlock, _whitelistSaleStartBlock, _publicSaleStartBlock, _endBlock)
        validPrice(_price)
    {
        owner = _owner;

        token = new HumanStandardToken(_tokenSupply, _tokenName, _tokenDecimals, _tokenSymbol, address(this), _endBlock);
        
        freezeBlock = _freezeBlock;
        whitelistSaleStartBlock = _whitelistSaleStartBlock;
        publicSaleStartBlock = _publicSaleStartBlock;
        endBlock = _endBlock;

        price = _price;

        assert(token.balanceOf(this) == token.totalSupply());
        assert(token.balanceOf(this) == _tokenSupply);
    }

    function distributeFoundersTokens(
        address[] _founders,
        uint[] _foundersTokens,
        uint[] _vestingStartDates,
        uint[] _vestingDurations)
        public
        onlyOwner
        notFrozen
    {

        for(uint i = 0; i < _founders.length; i++) {
          if(foundersTokenAllocated + _foundersTokens[i] > foundersTokenCap){ break;}

          address founder = _founders[i];
          uint founderTokens = _foundersTokens[i];

          Disbursement disbursement = new Disbursement(
            founder,
            _vestingDurations[i],
            _vestingStartDates[i]
          );

          disbursement.setup(token);
          token.transfer(disbursement, founderTokens);
          foundersTokenAllocated += founderTokens;
          TransferredFoundersTokens(founder, disbursement, founderTokens);
        }

    }

    function distributeLiquidityTokens(
        address[] _liquidityWallets,
        uint[] _liquidityTokens)
        public
        onlyOwner
        notFrozen
    {

        for(uint i = 0; i < _liquidityWallets.length; i++) {
          if(liquidityTokenAllocated + _liquidityTokens[i] > liquidityTokenCap){ break;}
          token.transfer(_liquidityWallets[i], _liquidityTokens[i]);
          TransferredLiquidityTokens(_liquidityWallets[i], _liquidityTokens[i]);
        }

    }

    function distributePartnersTokens(
        address[] _partners,
        uint[] _partnersTokens,
        uint[] _vestingStartDates,
        uint[] _vestingDurations)
        public
        onlyOwner
        notFrozen
    {

        for(uint i = 0; i < _partners.length; i++) {
          if(partnersTokenAllocated + _partnersTokens[i] > partnersTokenCap){ break;}

          address partner = _partners[i];
          uint partnersTokens = _partnersTokens[i];

          Disbursement disbursement = new Disbursement(
            partner,
            _vestingDurations[i],
            _vestingStartDates[i]
          );

          disbursement.setup(token);
          token.transfer(disbursement, partnersTokens);
          partnersTokenAllocated += partnersTokens;
          TransferredPartnersTokens(partner, disbursement, partnersTokens);
        }

    }

    function distributePreSaleTokens(
        address[] _preSaleBuyers,
        uint[] _preSaleTokens,
        uint[] _vestingStartDates,
        uint[] _vestingDurations)
        public
        onlyOwner
        notFrozen
    {

        for(uint i = 0; i < _preSaleBuyers.length; i++) {
          if(preSaleTokenAllocated + _preSaleTokens[i] > preSaleTokenCap){ break;}

          address preSaleBuyer = _preSaleBuyers[i];
          uint preSaleTokens = _preSaleTokens[i];

          Disbursement disbursement = new Disbursement(
            preSaleBuyer,
            _vestingDurations[i],
            _vestingStartDates[i]
          );

          disbursement.setup(token);
          token.transfer(disbursement, preSaleTokens);
          preSaleTokenAllocated += preSaleTokens;
          TransferredPreSaleTokens(preSaleBuyer, disbursement, preSaleTokens);
        }

    }

    /// @dev purchaseToken(): function that exchanges ETH for tokens (main sale function)
    /// @notice You're about to purchase the equivalent of `msg.value` Wei in tokens
    function purchaseTokens()
        payable
        setupComplete
        notInEmergency
        saleInProgress
        walletConfigured
    {
        /* Calculate whether any of the msg.value needs to be returned to
           the sender. The purchaseAmount is the actual number of tokens which
           will be purchased. */
        uint purchaseAmount = msg.value / price;
        uint excessAmount = msg.value % price;

        // dont need this because it will naturally just cap at whatever is left in sale contracts balance
        /* if(publicTokensSold == 0){
            publicSaleTokenCap = calculateNewPublicSaleCap();
        }*/

        if(block.number < publicSaleStartBlock){
            require(whitelistRegistrants[msg.sender] >= (msg.value - excessAmount));
            whitelistRegistrants[msg.sender] -= (msg.value-excessAmount);
        }

        // Cannot purchase more tokens than this contract has available to sell
        require(purchaseAmount <= token.balanceOf(this));

        // Return any excess msg.value
        if (excessAmount > 0) {
            msg.sender.transfer(excessAmount);
        }

        // Forward received ether minus any excessAmount to the wallet
        wallet.transfer(this.balance);

        publicTokensSold += purchaseAmount;

        // Transfer the sum of tokens tokenPurchase to the msg.sender
        token.transfer(msg.sender, purchaseAmount);
        PurchasedTokens(msg.sender, purchaseAmount);
    }

    // this is made public so that anyone can call it since it's the communicated mechanism for handling unsold tokens
    function lockUnsoldTokens()
        saleEnded
        onlyOwner
        walletConfigured
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
        LockUnsoldTokens(amountToLock, disbursement);
    }

    /*
     * Owner-only functions
     */

    function configureWallet(address _wallet)
        onlyOwner
    {
        wallet = _wallet;
        walletConfiguredFlag = true;
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
        price = _newPrice;
    }

    function changeWhitelistStartBlock(uint _newBlock)
        onlyOwner
        notFrozen
    {
        require(block.number <= _newBlock && _newBlock < publicSaleStartBlock);

        freezeBlock = _newBlock - (whitelistSaleStartBlock - freezeBlock);
        whitelistSaleStartBlock = _newBlock;
    }

    function emergencyToggle()
        onlyOwner
    {
        emergencyFlag = !emergencyFlag;
    }
    
    // not a public function because we will call this based on off-chain data of already registered folks 
    function addWhitelistSignature(address _purchaser, uint _amount, uint8 _v, bytes32 _r, bytes32 _s){
        if(ecrecover(termsAndConditionsIPFS, _v, _r, _s) == _purchaser){
            whitelistRegistrants[_purchaser] = _amount;
        }
    }

    /*
     * Modifiers
     */
    modifier saleNotEnded {
        require(block.number < endBlock);
        _;
    }

    modifier saleEnded {
        require(block.number >= endBlock);
        _;
    }

    modifier saleStarted {
        require(block.number >= whitelistSaleStartBlock);
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

    modifier frozen {
        require(block.number >= freezeBlock);
        _;
    }

    modifier saleInProgress {
        require(block.number >= whitelistSaleStartBlock && block.number < endBlock);
    _;
    }

    modifier setupComplete {
        assert((foundersTokenAllocated == foundersTokenCap) && (preSaleTokenAllocated == preSaleTokenCap));
        _;
    }

    modifier notInEmergency {
        assert(emergencyFlag == false);
        _;
    }

    modifier checkBlockNumberInputs(uint _freeze, uint _whitelistStart, uint _publicStart, uint _end) {
        require(_freeze >= block.number
        && _whitelistStart >= _freeze
        && _publicStart >= _whitelistStart
        && _end >= _publicStart);
    _;
    }

    modifier ownerOrSender(address _recipient){
        require(msg.sender == owner || msg.sender == _recipient);
        _;
    }

    modifier hasTokens(address _investor){
        require(token.balanceOf(_investor) > 0 );
        _;
    }

    modifier validPrice(uint _price){
        require(_price > 0);
        _;
    }

    modifier walletConfigured(){
        require(walletConfiguredFlag);
        _;
    }

}