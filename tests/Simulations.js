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
	var freezeBlock = web3.eth.blockNumber + 25;
	var startBlock = freezeBlock + 10;
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
				testSale2 = await sale.createSale(owner, freezeBlock, startBlock, endBlock);
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

		describe('distribute private sale tokens', ()=>{

			const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
			const lastAmount = 750000000000000000 - 200000000000000000 - 100000000000000000 - 150000000000000000;
			const tokens = [200000000000000000, 100000000000000000, lastAmount];
			const timeNow = Math.floor(Date.now() / 1000);
			const timelocks = [timeNow + 240, timeNow + 240, timeNow + 240];
			const durations = [300, 600, 900];

			it('should create disbursements and make sure private allocated is accurate', async () => {
					let privateAllocatedBeforeTimeLock = testSale2.privateAllocated();
					await sale.distributeTimeLockedTokens(testSale2.address, beneficiaries, tokens, timelocks, durations);
					let privateAllocatedAfterTimeLock = testSale2.privateAllocated();
					assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock) + tokens[0] + tokens[1] + tokens[2], 'private allocated should not be the same after timelock');
				}).timeout(300000);


			it('should have an address for disbursements ', async ()=> {
				let disbursement1= testSale2.disbursements(0);
				let disbursement2 = testSale2.disbursements(1);
				let disbursement3 = testSale2.disbursements(2);
				assert(JSON.parse(web3.isAddress(disbursement1)) === true, 'disbursement contract at index 0 does not have an address');
				assert(JSON.parse(web3.isAddress(disbursement2)) === true, 'disbursement contract at index 1 does not have an address');
				assert(JSON.parse(web3.isAddress(disbursement3)) === true, 'disbursement contract at index 2 does not have an address');
			}).timeout(300000);

			it('should have the correct properties on disbursements', async ()=> {

				let disbursementAddress1 = testSale2.disbursements(0);
				let disbursement1 = await Disbursement.at(disbursementAddress1);
				let setOwner1 = 	disbursement1.owner();
				let	receiver1 = disbursement1.receiver();
				let	disbursementPeriod1 = disbursement1.disbursementPeriod();
				let	startDate1 = disbursement1.startDate();
				let	withdrawnTokens1 = disbursement1.withdrawnTokens();
				let token1 =	disbursement1.token();
				assert(setOwner1 === testSale2.address, 'disbursement does not have the right owner');
				assert(receiver1 === beneficiaries[0], 'disbursement does not have the right owner');
				assert(JSON.parse(disbursementPeriod1) === durations[0], 'disbursement does not have the right owner');
				assert(JSON.parse(startDate1) === timelocks[0], 'disbursement does not have the right owner');
				assert(JSON.parse(withdrawnTokens1) === 0, 'disbursement does not have the right owner');
				assert(token1 === testSale2.token(), 'disbursement does not have the right owner');

				let disbursementAddress2 = testSale2.disbursements(1);
				let disbursement2 = await Disbursement.at(disbursementAddress2);
				let setOwner2 = 	disbursement2.owner();
				let	receiver2 = disbursement2.receiver();
				let	disbursementPeriod2 = disbursement2.disbursementPeriod();
				let	startDate2 = disbursement2.startDate();
				let	withdrawnTokens2 = disbursement2.withdrawnTokens();
				let token2 =	disbursement2.token();
				assert(setOwner2 === testSale2.address, 'disbursement does not have the right owner');
				assert(receiver2 === beneficiaries[1], 'disbursement does not have the right owner');
				assert(JSON.parse(disbursementPeriod2) === durations[1], 'disbursement does not have the right owner');
				assert(JSON.parse(startDate2) === timelocks[1], 'disbursement does not have the right owner');
				assert(JSON.parse(withdrawnTokens2) === 0, 'disbursement does not have the right owner');
				assert(token2 === testSale2.token(), 'disbursement does not have the right owner');

			}).timeout(300000);

		}).timeout(30000); // describe allocate private sale tokens

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
				amounts.push(250000000000000000);
			}

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale2.address, addresses, amounts);
				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale2.whitelistRegistrants(addresses[i]);
					assert(JSON.parse(whitelistedAmount) === amounts[i], 'this address amount was not set');
				}
			}).timeout(3000000);

			//do second 8 accounts, the last one will not be whitelisted for negative test cases, second last one will get specific amount
			let addresses2 = [];
			let amounts2 = [];

			for(var i = 10; i < 18; i++){
				addresses2.push(web3.eth.accounts[i]);
				amounts2.push(250000000000000000);
			}

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale2.address, addresses2, amounts2);
				for(var i = 0; i < addresses2.length; i++){
					let whitelistedAmount = await testSale2.whitelistRegistrants(addresses2[i]);
					assert(JSON.parse(whitelistedAmount) === amounts2[i], 'this address amount was not set');
				}
				let newAddresses = [web3.eth.accounts[18]];
				let newAmounts = [10];
				let txHash1 = await sale.addWhitelist(testSale2.address, newAddresses, newAmounts);
				let whitelistedAmount1 = await testSale2.whitelistRegistrants(web3.eth.accounts[18]);
				assert(JSON.parse(whitelistedAmount1) === 10, 'this address amount was not set');
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
				assert(JSON.parse(totalPrivateSold) === 750000000000000000, 'all the private tokens should have been allocated');
				assert(JSON.parse(tokenBalanceOfSale) === 250000000000000000, 'the full amount for the public sale should have been remaining');
			}).timeout(300000);

		}).timeout(30000);

	}).timeout(30000); // describe sale setup

	describe('sale freeze period tests', async ()=>{

		it('wait for sale freeze block', async ()=>{
			if(web3.eth.blockNumber <= freezeBlock){
				let watcher = await waitForBlock(freezeBlock);
			}
		}).timeout(300000);

		it('should not allow anyone to change the start block once the sale is frozen', async ()=>{
			let existingStartBlock = testSale2.startBlock();
			let txHash = await sale.changeStartBlock(testSale2.address, existingStartBlock-1);
			let newStartBlock = testSale2.startBlock();
			assert(JSON.parse(existingStartBlock) === JSON.parse(newStartBlock), 'no startblock change is valid in the freeze period');
		}).timeout(300000);

		it('should not allow a valid change price once the sale is frozen', async ()=>{
			let existingPrice = testSale2.price_in_wei();
			let txHash = await sale.changePrice(testSale2.address, 222222);
			let newPrice = testSale2.price_in_wei();
			assert(JSON.parse(existingPrice) === JSON.parse(newPrice), 'price change is not allowed once the sale is frozen');
		}).timeout(300000);

		it('should not allow anyone to purchase tokens before the sale starts', async ()=> {
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], Math.floor((Math.random() * 500) + 1));
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(buyerBalanceBefore) === JSON.parse(buyerBalanceAfter), 'buyer should not have been able to get tokens during before start');	
		}).timeout(300000);
		
	}).timeout(300000);

	describe('sale start', async ()=>{

		it('wait for sale start block', async ()=>{
			if(web3.eth.blockNumber <= startBlock){
				let watcher = await waitForBlock(startBlock);
			}
		}).timeout(300000);

		it('should allow anyone to purchase tokens now that the sale has started', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var weiToSend = Math.floor((Math.random() * 51234532467654345675) + 51234567654345675);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], weiToSend);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(buyerBalanceBefore) != JSON.parse(buyerBalanceAfter), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should allow anyone to continue purchasing if they havent hit their whitelist cap', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var weiToSend = Math.floor((Math.random() * 512345343467654345675) + 51234567654345675);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], weiToSend);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(buyerBalanceBefore) != JSON.parse(buyerBalanceAfter), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should not allow someone that hasnt been whitelisted to purchase any tickets', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[19]);
			var weiToSend = Math.floor((Math.random() * 51234534367654345675) + 51234567654345675);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[19], weiToSend);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[19]);
			assert(JSON.parse(buyerBalanceBefore) == JSON.parse(buyerBalanceAfter), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should not allow a call to lock unsold before the sale ends', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let oldBalance = token.balanceOf(testSale2.address);
			let txHash = await sale.lockUnsoldTokens(web3.eth.accounts[0], testSale2.address, web3.eth.accounts[19]);
			let newBalance = token.balanceOf(testSale2.address);
			assert(JSON.parse(oldBalance) == JSON.parse(newBalance), 'should not have moved unsold tokens');
		}).timeout(3000000);

		it('should allow anyone to buy their full whitelist cap in one shot', async ()=>{
			let whitelistedAmount1 = await testSale2.whitelistRegistrants(web3.eth.accounts[18]);
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[18]);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[18], 223423429842934723);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[18]);
			assert(JSON.parse(buyerBalanceBefore) != JSON.parse(buyerBalanceAfter), 'buyer should have been able to get tokens');
		}).timeout(300000);

		it('should allow repeated purchases until the cap is hit', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);

			while(JSON.parse(token.balanceOf(testSale2.address) > 5000000000000000 )){
				let randomBuyerIndex = Math.floor(Math.random() * (17 - 0 + 1)) + 0;
				let tokenAddress = await testSale2.token();
				let token = await HumanStandardToken.at(tokenAddress);
				let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[randomBuyerIndex]);
				var weiToSend = Math.floor((Math.random() * 200000000000000000000) + 1000000000000000000);
				
				if(newSaleBalance < weiToTokens(weiToSend - 2000000)){
					//since its close to the end, buy out the rest and bounce
					var txHash2 = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[randomBuyerIndex], (JSON.parse(token.balanceOf(testSale2.address))*333333)+2400000);
					break;
				}
				if(web3.eth.blockNumber == (endBlock - 5)){
					//since its close to the end, buy out the rest and bounce
					var txHash2 = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[randomBuyerIndex], (JSON.parse(token.balanceOf(testSale2.address))*333333)+2400000);
					break;
				}

				var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[randomBuyerIndex], weiToSend);
				let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[randomBuyerIndex]);
				console.log('old token balance: ' + buyerBalanceBefore);
				console.log('txHash:' + txHash);
				console.log('wei sent:' + weiToSend);
				console.log('new token balance: ' + buyerBalanceAfter);
				assert(JSON.parse(buyerBalanceBefore) != JSON.parse(buyerBalanceAfter), 'buyer should have been able to get tokens');
				let newSaleBalance = JSON.parse(token.balanceOf(testSale2.address));	
			}

		}).timeout(300000);

		it('should not let you buy more than whats availabe/sold out', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let saleBalance = JSON.parse(token.balanceOf(testSale2.address));
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var weiToSend = ((saleBalance+1)*333333) + 2400000;
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], weiToSend);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(buyerBalanceBefore) === JSON.parse(buyerBalanceAfter), 'buyer should not have been able to since it is sold out');
		}).timeout(300000);

		it('should not let you buy if the emergency toggle is set', async ()=>{
			let txHash1 = await sale.emergencyToggle(testSale2.address);
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var weiToSend = 10*333333;
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], weiToSend);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(buyerBalanceBefore) === JSON.parse(buyerBalanceAfter), 'buyer should not have been able to buy with emergency on');
			let txHash2 = await sale.emergencyToggle(testSale2.address); //lets turn it back off for remaining tests
		}).timeout(300000);

	}).timeout(3000000);

	describe('sale end', async()=>{

		it('wait for sale end block', async ()=>{
			if(web3.eth.blockNumber <= endBlock){
				let watcher = await waitForBlock(endBlock);
			}
		}).timeout(300000);

		it('should not allow anyone to purchase tokens after sale ends', async ()=> {
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var weiToSend = Math.floor((Math.random() * 512345343467654345675) + 51234567654345675);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], weiToSend);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(buyerBalanceBefore) === JSON.parse(buyerBalanceAfter), 'shouldnt have been able to buy after sale end');
		}).timeout(300000);

		it('should not allow a non-owner to call the reversal function', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			const previousBalance = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(previousBalance) != 0, 'cant do test if old balance is already 0');
			const wei = (JSON.parse(previousBalance) * 333333) + 3000000000000;
			let txHash = await sale.reversePurchaseAs(web3.eth.accounts[1], testSale2.address, web3.eth.accounts[11], wei);
			const newBalance = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(newBalance) === JSON.parse(previousBalance), 'tokens should not have been reversed');
			assert(JSON.parse(newBalance) != 0, 'tokens should not have been reversed');
		}).timeout(3000000);

		it('should not reverse tokens if inadequate ether is sent', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			const previousBalance = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(previousBalance) != 0, 'cant do test if old balance is already 0');
			let txHash = await sale.reversePurchase(testSale2.address, web3.eth.accounts[11], 5000000000000000000);
			const newBalance = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(newBalance) === JSON.parse(previousBalance), 'tokens should not have been reversed');
			assert(JSON.parse(newBalance) != 0, 'tokens should not have been reversed');
		}).timeout(3000000);

		it('should reverse tokens and allocate funds if valid reversal', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			const previousBalance = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(previousBalance) != 0, 'cant do test if old balance is already 0');
			const wei = (JSON.parse(previousBalance) * 333333) + 3000000000000;
			let txHash = await sale.reversePurchase(testSale2.address, web3.eth.accounts[11], wei);
			const newBalance = token.balanceOf(web3.eth.accounts[11]);
			assert(JSON.parse(newBalance) != JSON.parse(previousBalance), 'tokens should have been reversed');
			assert(JSON.parse(newBalance) === 0, 'tokens should have been reversed');
		}).timeout(3000000);

		it('should not allow a non-owner to call the transfer lock removal', async ()=> {
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let txHash = await sale.removeTransferLockAs(web3.eth.accounts[1], testSale2.address);
			const flag = token.transfersAllowed();
			assert(JSON.parse(flag) === false, 'non-owner should not be able to change the transfer lock');
		}).timeout(3000000);

		it('should allow an owner to call the transfer lock removal', async ()=> {
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let txHash = await sale.removeTransferLock(testSale2.address);
			const flag = token.transfersAllowed();
			assert(JSON.parse(flag) === true, 'owner should be able to change the transfer lock');
		}).timeout(3000000);

		it('should not reverse if transfer lock has already been removed', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			const previousBalance = token.balanceOf(web3.eth.accounts[18]);
			assert(JSON.parse(previousBalance) != 0, 'cant do test if old balance is already 0');
			let txHash = await sale.reversePurchase(testSale2.address, web3.eth.accounts[18], 500000000000000000000);
			const newBalance = token.balanceOf(web3.eth.accounts[18]);
			assert(JSON.parse(newBalance) === JSON.parse(previousBalance), 'tokens should not have been reversed');
			assert(JSON.parse(newBalance) != 0, 'tokens should not have been reversed');
		}).timeout(3000000);


		it('should not allow a non-owner to call lock unsold', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let oldBalance = token.balanceOf(testSale2.address);
			let txHash = await sale.lockUnsoldTokens(web3.eth.accounts[1], testSale2.address, web3.eth.accounts[19]);
			let newBalance = token.balanceOf(testSale2.address);
			assert(JSON.parse(oldBalance) === JSON.parse(newBalance), 'should not have moved unsold tokens');
		}).timeout(3000000);

		it('should not allow an invalid address for lock unsold', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let oldBalance = token.balanceOf(testSale2.address);
			let txHash = await sale.lockUnsoldTokens(web3.eth.accounts[0], testSale2.address, 0);
			let newBalance = token.balanceOf(testSale2.address);
			assert(JSON.parse(oldBalance) === JSON.parse(newBalance), 'should not have moved unsold tokens');
		}).timeout(3000000);

		it('a valid address can call lock unsold', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let oldBalance = token.balanceOf(testSale2.address);
			let txHash = await sale.lockUnsoldTokens(web3.eth.accounts[0], testSale2.address, web3.eth.accounts[19]);
			let newBalance = token.balanceOf(testSale2.address);
			assert(JSON.parse(oldBalance) > JSON.parse(newBalance), 'should not have moved unsold tokens');
		}).timeout(3000000);

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
