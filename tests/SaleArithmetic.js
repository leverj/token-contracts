var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var Disbursement 				= require('../lib/Disbursement');
var BN 							= require('bn.js');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('setup a sale to do arithmetic verification', async ()=>{

	var testSale2;
	var owner = web3.eth.accounts[0];
	var freezeBlock = web3.eth.blockNumber + 10;
	var startBlock = freezeBlock + 5;
	var endBlock = startBlock + 30;	

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

			//do second 7 accounts, the last one will not be whitelisted for negative test cases, second last one will get specific amount
			let addresses2 = [];
			let amounts2 = [];

			for(var i = 10; i < 17; i++){
				addresses2.push(web3.eth.accounts[i]);
				amounts2.push(250000000000000000);
			}

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale2.address, addresses2, amounts2);
				for(var i = 0; i < addresses2.length; i++){
					let whitelistedAmount = await testSale2.whitelistRegistrants(addresses2[i]);
					console.log("whitelist amount for index " + (10+i) +  ": " + whitelistedAmount);
					assert(JSON.parse(whitelistedAmount) === amounts2[i], 'this address amount was not set');
				}
				let newAddresses = [web3.eth.accounts[17]];
				let newAmounts = [1000000000000000];
				let txHash1 = await sale.addWhitelist(testSale2.address, newAddresses, newAmounts);
				let whitelistedAmount1 = await testSale2.whitelistRegistrants(web3.eth.accounts[17]);
				console.log("account 17 whitelist amount: " + whitelistedAmount1);
				assert(JSON.parse(whitelistedAmount1) === 1000000000000000, 'this address amount was not set');
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

	describe('sale start', async ()=>{

		it('wait for sale start block', async ()=>{
			if(web3.eth.blockNumber <= startBlock){
				let watcher = await waitForBlock(startBlock);
			}
		}).timeout(300000);

		it('test arithmetic on purchasing less than whitelist amount', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[11]);
			var weiToSend = Math.floor((Math.random() * 51234532467345675) + 51234567345675);
			var weiToSendBN = new BN(weiToSend.toString(), 10);
			console.log("wei to send: " + weiToSend);
			console.log("wei to sendBN: " + weiToSendBN.toString(10));
			var oldEth = web3.eth.getBalance(web3.eth.accounts[11]);

			var oldWhitelist = await testSale2.whitelistRegistrants(web3.eth.accounts[11]);

			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[11], weiToSend);

			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[11]);
			var txCost = web3.eth.getTransactionReceipt(txHash).cumulativeGasUsed * web3.eth.getTransaction(txHash).gasPrice;
			
			var expectedBuyerBalanceAfter = weiToSendBN.div(new BN("333333", 10));
			var expectedRefund = weiToSendBN.mod(new BN("333333", 10));
			var actualRefund = web3.eth.getBalance(web3.eth.accounts[11]).sub(oldEth.sub(weiToSendBN).sub(new BN(txCost.toString(), 10))).toString(10);

			console.log("actual new token balance: " + buyerBalanceAfter.toString(10));
			console.log("expected new token balance: " + expectedBuyerBalanceAfter.toString(10));
			console.log("expected refund: " + expectedRefund.toString(10));
			console.log("actual refund: " + actualRefund.toString(10));
			assert(buyerBalanceAfter.toString(10) === expectedBuyerBalanceAfter.toString(), 'the tokens allocated should match conversion rate');
			assert(expectedRefund.toString(10) === actualRefund.toString(10), 'the refunded amound should match the purchase amount modulo price');

			var actualRemainingWhitelist = await testSale2.whitelistRegistrants(web3.eth.accounts[11]);
			var expectedRemainingWhitelist = oldWhitelist - expectedBuyerBalanceAfter;
			assert(JSON.parse(actualRemainingWhitelist) === expectedRemainingWhitelist);
		}).timeout(300000);

		it('test arithmetic on purchasing more than whitelist amount', async ()=>{
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			let buyerBalanceBefore = token.balanceOf(web3.eth.accounts[17]);
			var weiToSendBN = new BN("666666000000000000000", 10);
			var oldEth = web3.eth.getBalance(web3.eth.accounts[17]);
			var oldWhitelist = await testSale2.whitelistRegistrants(web3.eth.accounts[17]);
			var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[17], weiToSendBN);
			let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[17]);
			var txCost = web3.eth.getTransactionReceipt(txHash).cumulativeGasUsed * web3.eth.getTransaction(txHash).gasPrice;
			
			var usableWeiForTokens = new BN((333333*1000000000000000).toString(), 10);

			var expectedBuyerBalanceAfter = 1000000000000000;
			var expectedRefund = weiToSendBN.sub(usableWeiForTokens);
			var actualRefund = web3.eth.getBalance(web3.eth.accounts[17]).sub(oldEth.sub(weiToSendBN).sub(new BN(txCost.toString(),10))).toString(10);

			console.log("expected refund: " + expectedRefund.toString(10));
			console.log("actual refund: " + actualRefund.toString(10));

			assert(buyerBalanceAfter.toString(10) === expectedBuyerBalanceAfter.toString(), 'the tokens allocated should match conversion rate');
			assert(expectedRefund.toString(10) === actualRefund.toString(10), 'the refunded amound should match the purchase amount modulo price');

			// check whitelist remainder after partial buy
			var actualRemainingWhitelist = await testSale2.whitelistRegistrants(web3.eth.accounts[17]);
			console.log("remaining whitelist: " + actualRemainingWhitelist);
			var expectedRemainingWhitelist = oldWhitelist - expectedBuyerBalanceAfter;
			assert(JSON.parse(actualRemainingWhitelist) === expectedRemainingWhitelist, 'accurate whitelist amount should remain');
		}).timeout(300000);

		it('should reverse tokens and allocate funds if valid reversal', async ()=>{

			var contract = await sale.at(testSale2.address)
			contract.allEvents(function(err, log){
				if (!err){
		    		console.log(log);

		    		if(log.event === 'ExtraAmountTransferred'){
						console.log("event extra amount transferred: " + log.args.excessAmount.toString(10));
					}

					if(log.event === 'RefundedToUser'){
						console.log("event refunded to user: " + log.args.refund.toString(10));
					}
				}
			});	

			let adminOldEth = web3.eth.getBalance(web3.eth.accounts[0]);
			console.log("admin eth balance before: " + web3.eth.getBalance(web3.eth.accounts[0]).toString(10));
			console.log("buyer eth balance before: " + web3.eth.getBalance(web3.eth.accounts[11]).toString(10));
			let tokenAddress = await testSale2.token();
			let token = await HumanStandardToken.at(tokenAddress);
			const previousBalance = token.balanceOf(web3.eth.accounts[11]);
			console.log("old token balance: " + previousBalance);

			assert(JSON.parse(previousBalance) != 0, 'cant do test if old balance is already 0');
			
			const wei = (JSON.parse(previousBalance) * 333333)+300000000000000;
			console.log("wei to send: " + wei);
			console.log("contract balance before: " + web3.eth.getBalance(testSale2.address).toString(10));
			let txHash = await sale.reversePurchase(testSale2.address, web3.eth.accounts[11], wei);
			console.log("contract balance before: " + web3.eth.getBalance(testSale2.address).toString(10));
			var txCost = web3.eth.getTransactionReceipt(txHash).cumulativeGasUsed * web3.eth.getTransaction(txHash).gasPrice;
			console.log("tx value amount: " + web3.eth.getTransaction(txHash).value.toString(10));
			const newBalance = token.balanceOf(web3.eth.accounts[11]);
			console.log("new token balance: " + newBalance.toString(10));
			console.log("admin eth balance after: " + web3.eth.getBalance(web3.eth.accounts[0]).toString(10));
			console.log("buyer eth balance after: " + web3.eth.getBalance(web3.eth.accounts[11]).toString(10));
			
			let expectedAdminEthBalance = adminOldEth.sub(previousBalance.mul(new BN("333333", 10))).sub(new BN(txCost.toString(), 10));
			console.log('expected admin eth: ' + expectedAdminEthBalance.toString(10));
			assert(expectedAdminEthBalance.toString(10) === web3.eth.getBalance(web3.eth.accounts[0]).toString(10), 'admin eth balance should have got  a little return amount');
			assert(JSON.parse(newBalance) === 0, 'tokens should have been reversed');
		}).timeout(3000000);

	}).timeout(3000000);

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
