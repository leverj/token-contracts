var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var Disbursement 				= require('../lib/Disbursement');
var BN 							= require('bn.js');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('do a full simulation of a sale', async ()=>{

	var testSale2;
	var owner = web3.eth.accounts[0];
	var whitelistAdmin = web3.eth.accounts[0];
	var freezeBlock = web3.eth.blockNumber + 10;
	var startBlock = freezeBlock + 5;
	var endBlock = startBlock + 50;	

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
				testSale2 = await sale.createSale(owner, freezeBlock, startBlock, endBlock, whitelistAdmin);
				let actualOwner =  testSale2.owner();
				let actualFreezeBlock =  testSale2.freezeBlock();
				let actualStartBlock =  testSale2.startBlock();
				let actualEndBlock =  testSale2.endBlock();
				let actualTOTAL_SUPPLY =  testSale2.TOTAL_SUPPLY();
				let actualMAX_PRIVATE =  testSale2.MAX_PRIVATE();
				let actualDECIMALS =  testSale2.DECIMALS();
				let actualNAME =  testSale2.NAME();
				let actualSYMBOL =  testSale2.SYMBOL();
				let actualprice_inwei =  testSale2.price_in_wei();
				let actualprivateAllocated =  testSale2.privateAllocated();
				let actualSetupCompleteFlag =  testSale2.setupCompleteFlag();
				let actualEmergencyFlag =  testSale2.emergencyFlag();
				assert(owner === actualOwner, "owner not saved properly");
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
				let tokenAddress = await testSale2.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const expectedVersion = 'H0.1';
				const expectedTotalSupply = expectedTOTAL_SUPPLY;
				const expectedBalanceOfSale = 1000000000000000000;
				const expectedSaleAddress = testSale2.address;
				const expectedTransferLock = false;
				let actualName = token.name();
	            let actualDecimal = token.decimals();
	            let actualSymbol = token.symbol();
	            let actualVersion = token.version();
	            let actualTotalSupply = token.totalSupply();
	            let actualBalanceOfSale = token.balanceOf(testSale2.address);
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

		describe('distribute presale tokens', async () => {
				const beneficiaries = [web3.eth.accounts[4], web3.eth.accounts[5], web3.eth.accounts[6]];
				const tokens = [50000000000000000, 50000000000000000, 50000000000000000];

				it('should allow proper allocatiosn to go through', async()=>{
					let tokenAddress = await testSale2.token();
		            let token = await HumanStandardToken.at(tokenAddress);
					const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
					const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
					const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
					let txHash = await sale.distributePresaleTokens(testSale2.address, beneficiaries, tokens);
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
				let txHash = await sale.configureWallet(testSale2.address, web3.eth.accounts[7]);
				let newWallet = await testSale2.wallet();
				assert(newWallet == web3.eth.accounts[7], 'wallet should have been set properly');
			}).timeout(3000000);
		}).timeout(3000000);

		describe('add whitelist entries', () => {
			let addresses = [];
			let amounts = [];

			//do first 10 accounts
			for(var i = 0; i < 10; i++){
				addresses.push(web3.eth.accounts[i]);
				amounts.push(5000000000000000);
			}

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale2.address, addresses, amounts);
				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale2.whitelistRegistrants(addresses[i]);
					assert(JSON.parse(whitelistedAmount) === amounts[i], 'this address amount was not set');
				}

				let txHash2 = await sale.addWhitelist(testSale2.address, [web3.eth.accounts[14]], [0]);
			}).timeout(3000000);

		}).timeout(3000000);


		describe('mark setup complete', ()=>{

			it('updating the setup flag as an owner should go through', async ()=> {
				let txHash = await sale.setSetupComplete(testSale2.address);
				let newFlag = testSale2.setupCompleteFlag();
				assert(JSON.parse(newFlag), 'flag should be set now since an owner called it');
			}).timeout(3000000);

			it('should have the right properties before the sale starts', async ()=> {
				let tokenAddress = await testSale2.token();
				let token = await HumanStandardToken.at(tokenAddress);
				var totalPrivateSold = testSale2.privateAllocated();
				var tokenBalanceOfSale = token.balanceOf(testSale2.address);
				var balanceOfWallet = web3.eth.getBalance(testSale2.wallet());
				assert(JSON.parse(totalPrivateSold) === 150000000000000000, 'all the private tokens should have been allocated');
				assert(JSON.parse(tokenBalanceOfSale) === 850000000000000000, 'the full amount for the public sale should have been remaining');
			}).timeout(300000);

		}).timeout(30000);

	}).timeout(30000); // describe sale setup

	describe('sale start', async ()=>{

		it('wait for sale start block', async ()=>{
			if(web3.eth.blockNumber <= startBlock){
				let watcher = await waitForBlock(startBlock);
			}
		}).timeout(300000);

		it('should allow anyone to purchase part of their whitelist', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[3]);
			let weiToSend = 2500000000000000*333333;
			let weiToSendBN = new BN(weiToSend.toString(), 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[3], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[3]);
			assert( "2500000000000000" === JSON.parse(buyerBalanceAfter).toString(), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should allow anyone to purchase all of their whitelist', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[8]);
			let weiToSend = 5000000000000000*333333;
			let weiToSendBN = new BN("1666665000000000000000", 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[8], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[8]);
			assert( "5000000000000000" === JSON.parse(buyerBalanceAfter).toString(), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should not allow anyone to purchase more than their whitelist amount before the public sale', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[8]);
			let weiToSend = 2500000000000000*333333;
			let weiToSendBN = new BN(weiToSend.toString(), 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[8], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[8]);
			assert( buyerBalanceBefore.toString(10) === buyerBalanceAfter.toString(10), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should not allow someone that hasnt been whitelisted to purchase any tickets', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[19]);
			var weiToSend = 2500000000000000*333333;
			var weiToSendBN = new BN(weiToSend.toString(), 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[19], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[19]);
			assert( "0" === JSON.parse(buyerBalanceAfter).toString(), 'buyer should have been able to get tokens');
		}).timeout(300000);


		it('should not let non-owner to change the public sale flag', async () => {
			let existingFlag = testSale2.publicSale();
			assert(JSON.parse(existingFlag) === false, 'existing flag should be false');
			let txHash = await sale.startPublicSaleAs(web3.eth.accounts[1], testSale2.address);
			let newFlag = testSale2.publicSale();
			assert(!newFlag, 'public sale flag should not have been set by a non-owner');
		}).timeout(300000);

		it('should  let owner to change the public sale flag', async () => {
			let existingFlag = testSale2.publicSale();
			assert(JSON.parse(existingFlag) === false, 'existing flag should be false');
			let txHash = await sale.startPublicSaleAs(web3.eth.accounts[0], testSale2.address);
			let newFlag = testSale2.publicSale();
			assert(newFlag, 'public sale flag should not have been set by a non-owner');
		}).timeout(300000);

		it('should make sure if the flag is already set it, stays set and doesnt revert back to false if you call it again', async  () => {
			let existingFlag = testSale2.publicSale();
			assert(JSON.parse(existingFlag), 'existing flag should be true');
			let txHash = await sale.startPublicSaleAs(web3.eth.accounts[0], testSale2.address);
			let newFlag = testSale2.publicSale();
			assert(JSON.parse(newFlag), 'flag should still be true after setting');
		}).timeout(300000);

		it('should make sure if 0 amount is whitelisted, person can still buy', async  () => {
			let whitelistAmount = testSale2.whitelistRegistrants(web3.eth.accounts[14]);
			assert(whitelistAmount.toString(10) === "0", 'whitelist amount should be 0 to do this test');
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[14]);
			let weiToSend = 2500000000000000*333333;
			let weiToSendBN = new BN(weiToSend.toString(), 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[14], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[14]);
			assert( "2500000000000000" === JSON.parse(buyerBalanceAfter).toString(), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should make sure nonwhitelisted person cant buy',  async ()=>{
			let whitelistFlag = testSale2.whitelistRegistrantsFlag(web3.eth.accounts[15]);
			assert(JSON.parse(whitelistFlag) === false, 'user should not be registered');
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[15]);
			let weiToSend = 2500000000000000*333333;
			let weiToSendBN = new BN(weiToSend.toString(), 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[15], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[15]);
			assert( "0" === JSON.parse(buyerBalanceAfter).toString(), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should make sure if whitelist amount remaining, buyer can keep buying past that', async  ()=>{
			let whitelistAmount = testSale2.whitelistRegistrants(web3.eth.accounts[3]);
			assert(whitelistAmount.toString(10) === "2500000000000000", 'whitelist amount should be 0 to do this test');
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[3]);
			let weiToSend = 5000000000000000*333333;
			let weiToSendBN = new BN("1666665000000000000000", 10);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[3], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[3]);
			assert( "7500000000000000" === buyerBalanceAfter.toString(10), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should register new person and make sure that they can buy any amount', async  ()=>{
			let whitelistFlag = testSale2.whitelistRegistrantsFlag(web3.eth.accounts[16]);
			assert(JSON.parse(whitelistFlag) === false, 'user should not be registered');
			let whitelistAmount = testSale2.whitelistRegistrants(web3.eth.accounts[16]);
			assert(whitelistAmount.toString(10) === "0", 'whitelist amount should be 0 to do this test');
			let txHash = await sale.addWhitelist(testSale2.address, [web3.eth.accounts[16]], [500000000]);
			let whitelistFlag2 = testSale2.whitelistRegistrantsFlag(web3.eth.accounts[16]);
			assert(JSON.parse(whitelistFlag2) === true, 'user should be registered');
			let whitelistAmount2 = testSale2.whitelistRegistrants(web3.eth.accounts[16]);
			assert(whitelistAmount2.toString(10) === "500000000", 'whitelist amount should be 500000000');

			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[16]);
			let weiToSend = 5000000000000000*333333;
			let weiToSendBN = new BN("1666665000000000000000", 10);
			var txHash2 = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[16], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[16]);
			assert( "5000000000000000" === buyerBalanceAfter.toString(10), 'buyer should have been able to get tokens');
		}).timeout(300000);

	}).timeout(300000000);

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
