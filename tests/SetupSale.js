var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var Disbursement 				= require('../lib/Disbursement');
var BN 							= require('bn.js');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('setup a sale to test the UI with with web3.eth.accounts[0] as owner AND wallet', async ()=>{

	var testSale;

	// testnet
	//var owner = "0x4552971161afaFDb93BfDAe659cc4a56d607a7d6";
	//var whitelistAdmin = "0x4552971161afaFDb93BfDAe659cc4a56d607a7d6";
	//var freezeBlock = 1186345;
	//var startBlock = 1187345;
	//var endBlock = 1188345;	

	// mainnet
	var owner = '0x036dD047F4e49E20c4F304B061eB14b12d3aE83f';
	var whitelistAdmin = '0x036dD047F4e49E20c4F304B061eB14b12d3aE83f';
	var freezeBlock = 4490904;
	var startBlock = 4491104;
	var endBlock = 4688045;	

	// localhost
	//var owner = web3.eth.accounts[0];
	//var whitelistAdmin = web3.eth.accounts[0];
	//var freezeBlock = web3.eth.blockNumber + 10;
	//var startBlock = freezeBlock + 20;
	//var endBlock = startBlock + 50;	

	describe('sale setup', async ()=>{

		describe('deploy sale contract', ()=>{
			const expectedTOTAL_SUPPLY = 1000000000000000000;
			const expectedMAX_PRIVATE = 750000000000000000;
		    const expectedDECIMALS = 9;
		    const expectedNAME = "Leverj";
		    const expectedSYMBOL = "LEV";
		    const expectedprice_inwei = 333333;
		    const expectedprivateAllocated = 0;
		    const expectedSetupCompleteFlag = false;
		    const expectedEmergencyFlag = false;

			it('sale should have the correct parameters saved', async () => {
				console.log("freeze: " + freezeBlock);
				console.log("start: " + startBlock);
				console.log("end: " + endBlock);
				testSale = await sale.createSale(owner, freezeBlock, startBlock, endBlock, whitelistAdmin);
				let actualOwner =  testSale.owner();
				let actualFreezeBlock =  testSale.freezeBlock();
				let actualStartBlock =  testSale.startBlock();
				let actualEndBlock =  testSale.endBlock();
				let actualTOTAL_SUPPLY =  testSale.TOTAL_SUPPLY();
				let actualMAX_PRIVATE =  testSale.MAX_PRIVATE();
				let actualDECIMALS =  testSale.DECIMALS();
				let actualNAME =  testSale.NAME();
				let actualSYMBOL =  testSale.SYMBOL();
				let actualprice_inwei =  testSale.price_in_wei();
				let actualprivateAllocated =  testSale.privateAllocated();
				let actualSetupCompleteFlag =  testSale.setupCompleteFlag();
				let actualEmergencyFlag =  testSale.emergencyFlag();
				assert(owner.toLowerCase() === actualOwner.toLowerCase(), "owner not saved properly");
				assert(freezeBlock === JSON.parse(actualFreezeBlock), "freezeBlock not saved properly");
				assert(startBlock === JSON.parse(actualStartBlock), "starBlock not saved properly");
				assert(endBlock === JSON.parse(actualEndBlock), "endBlock not saved properly");
				assert(expectedTOTAL_SUPPLY === JSON.parse(actualTOTAL_SUPPLY), "sale total supply not saved properly");
				assert(expectedMAX_PRIVATE === JSON.parse(actualMAX_PRIVATE), "max private not saved properly");
				assert(expectedDECIMALS === JSON.parse(actualDECIMALS), "DECIMALS not saved properly");
				assert(expectedNAME === actualNAME, "name not saved properly");
				assert(expectedSYMBOL === actualSYMBOL, "symbol not saved properly");
				assert(expectedprice_inwei === JSON.parse(actualprice_inwei), "price in wei not saved properly");
				assert(expectedprivateAllocated === JSON.parse(actualprivateAllocated), "private allocated not set properly");
				assert(expectedSetupCompleteFlag === JSON.parse(actualSetupCompleteFlag), "setupcompleteflag block not saved properly");
				assert(expectedEmergencyFlag === JSON.parse(actualEmergencyFlag), "emergency flag not saved properly");
			}).timeout(3000000);

			it('underlying token should have the correct parameters saved', async () => {
				let tokenAddress = await testSale.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const expectedVersion = 'H0.1';
				const expectedTotalSupply = expectedTOTAL_SUPPLY;
				const expectedBalanceOfSale = 1000000000000000000;
				const expectedSaleAddress = testSale.address;
				const expectedTransferLock = false;
				let actualName = token.name();
	            let actualDecimal = token.decimals();
	            let actualSymbol = token.symbol();
	            let actualVersion = token.version();
	            let actualTotalSupply = token.totalSupply();
	            let actualBalanceOfSale = token.balanceOf(testSale.address);
	            let actualSaleAddress = token.sale();
	            let actualTransferLock = token.transfersAllowed();
				assert(expectedNAME === actualName, "name not saved properly");
				assert(expectedDECIMALS === JSON.parse(actualDecimal), "decimal not saved properly");
				assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
				assert(expectedVersion === actualVersion, "version not saved properly");
				assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "token total supply not saved properly");
				assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
				assert(expectedSaleAddress === actualSaleAddress,"sale address not saved properly");
				assert(expectedTransferLock === JSON.parse(actualTransferLock), "transfer lock not saved properly");
			}).timeout(3000000);

		}).timeout(30000); // it deploy contract

		// just doign this because setup complete expects SOME private allocations
		describe('distribute presale tokens', async () => {
				const beneficiaries = [web3.eth.accounts[4], web3.eth.accounts[5], web3.eth.accounts[6]];
				const tokens = [50000000000000000, 50000000000000000, 50000000000000000];

				it('should allow proper allocatiosn to go through', async()=>{
					let tokenAddress = await testSale.token();
		            let token = await HumanStandardToken.at(tokenAddress);
					const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
					const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
					const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
					let txHash = await sale.distributePresaleTokens(testSale.address, beneficiaries, tokens);
					const balanceAfter0 = await token.balanceOf(beneficiaries[0]);
					const balanceAfter1 = await token.balanceOf(beneficiaries[1]);
					const balanceAfter2 = await token.balanceOf(beneficiaries[2]);
					assert(JSON.parse(balanceBefore0) + tokens[0] === JSON.parse(balanceAfter0), 'non owners are not able to allocate presale');
					assert(JSON.parse(balanceBefore1) + tokens[1] === JSON.parse(balanceAfter1), 'non owners are not able to allocate presale');
					assert(JSON.parse(balanceBefore2) + tokens[2] === JSON.parse(balanceAfter2), 'non owners are not able to allocate presale');
				}).timeout(3000000);

		}).timeout(3000000);

		describe('set wallet', ()=> {
			it('trying to set the wallet as the owner should finish without errors', async () => {
				let txHash = await sale.configureWallet(testSale.address, web3.eth.accounts[0]);
				let newWallet = await testSale.wallet();
				assert(newWallet === web3.eth.accounts[0], 'wallet should have been set properly');
			}).timeout(3000000);
		}).timeout(3000000);

		describe('add whitelist entries', () => {
			let addresses = [];
			let amounts = [];

			for(var i = 10; i < web3.eth.accounts.length; i++){
				addresses.push(web3.eth.accounts[i]);
				amounts.push(150000000000000000);
			}

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelistAs(web3.eth.accounts[0], testSale.address, addresses, amounts);
				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale.whitelistRegistrants(addresses[i]);
					assert(JSON.parse(whitelistedAmount) === amounts[i], 'this address amount was not set');
				}
			}).timeout(3000000);

		}).timeout(3000000);

		describe('mark setup complete', ()=>{

			it('updating the setup flag as an owner should go through', async ()=> {
				let txHash = await sale.setSetupComplete(testSale.address);
				let newFlag = testSale.setupCompleteFlag();
				assert(JSON.parse(newFlag), 'flag should be set now since an owner called it');
			}).timeout(3000000);

			it('should have the right properties before the sale starts', async ()=> {
				let tokenAddress = await testSale.token();
				let token = await HumanStandardToken.at(tokenAddress);
				var totalPrivateSold = testSale.privateAllocated();
				var tokenBalanceOfSale = token.balanceOf(testSale.address);
				var balanceOfWallet = web3.eth.getBalance(testSale.wallet());
				assert(JSON.parse(tokenBalanceOfSale) >= 250000000000000000, 'the full amount for the public sale should have been remaining');
			}).timeout(300000);

		}).timeout(30000);

	}).timeout(30000); // describe sale setup

/*	describe('sale start', async ()=>{

		it('wait for sale start block', async ()=>{
			if(web3.eth.blockNumber <= startBlock){
				let watcher = await waitForBlock(startBlock);
				console.log('**** SALE HAS STARTED, PLEASE PURCHASE THROUGH UI AND METAMASK ****');
				console.log('Please use the following information to configure front end ...');
				console.log('Sale contract address: ' + testSale.address);
				console.log('Sale contract ABI: ' + JSON.stringify(testSale.abi));
			}
		}).timeout(300000);

	}).timeout(3000000);*/

}).timeout(3000000000);

function weiToTokens(wei){
	return Math.floor(wei/333333);
}

function tokensToWei(lev){
	return lev*333333;
}

async function waitForBlock(_blockNumber){
    return new Promise((resolve, reject) => {
		var saleWatcher = web3.eth.filter('latest');
		saleWatcher.watch(function(error, result){
			if (!error){
				//console.log("checking against: " + _blockNumber);
				if(web3.eth.getBlock(result).number >= _blockNumber){
					//console.log("found it");
					saleWatcher.stopWatching();
					resolve(true);
				}
			}
		});
    });
}
