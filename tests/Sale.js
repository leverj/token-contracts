var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var Disbursement 				= require('../lib/Disbursement');
var BN 							= require('bn.js');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// make sure that if presale finishes with less, you can purchase more than the original allocation for the public sale
// remainders

describe('sale tests', ()=>{
	
	describe('sale end-to-end test', () => {

			var testSale;
			var owner = web3.eth.accounts[0];
			var freezeBlock = 4471830;
			var startBlock = 4483800;
			var endBlock = 4656150;

	        const expectedTOTAL_SUPPLY = 1000000000000000000;
			const expectedMAX_PRIVATE = 750000000000000000;
		    const expectedDECIMALS = 9;
		    const expectedNAME = "Leverj";
		    const expectedSYMBOL = "LEV";
		    const expectedprice_inwei = 333333;
		    const expectedprivateAllocated = 0;
		    const expectedSetupCompleteFlag = false;
		    const expectedEmergencyFlag = false;

		describe('creation of sale contract with LEV sale parameters', () => {

			it('sale should have the correct parameters saved', async () => {
				testSale = await sale.createSale(owner, freezeBlock, startBlock, endBlock);

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
				assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
				assert(expectedTransferLock === JSON.parse(actualTransferLock), "transfer lock not saved properly");

			}).timeout(3000000);

		}).timeout(3000000);

		describe('setupcomplete flag shouldnt be allowed to get updated before any private allocations have been made', ()=> {

			it('should not let even the sale owner set the setupcomplete flag if any private allocations have not been set', async () => {
				const privateAllocations = testSale.privateAllocated();
				assert(parseInt(JSON.parse(privateAllocations)) === 0, 'otherwise this test cannot proceed since setSetupComplete call will be allowed');
				const existingFlag = testSale.setupCompleteFlag();
				assert(JSON.parse(existingFlag) === false, 'this test cannot be ran if the flag is already set to true');
				let txHash = await sale.setSetupComplete(testSale.address);
				const newFlag = testSale.setupCompleteFlag();
				assert(JSON.parse(newFlag) === false, 'this should still be true false because no preallocation has been set yet');
			}).timeout(300000);

		}).timeout(300000);;


		describe('distribute private sale tokens', () => {
			const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
			const tokens = [10000000000000, 5000000000000000, 5000000000000000];
			const tooMuchTokens = [expectedMAX_PRIVATE, 5000];
			const timeNow = Math.floor(Date.now() / 1000);
			const timelocks = [timeNow, timeNow+1, timeNow + 144000];
			const durations = [1, 5000, 1000000];
			const badArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
			const anotherBadArray = [0,1,2,3,4];

			it('should not allow you to allocate time locked tokens if you are not an owner', async () => {
				let privateAllocatedBeforeTimeLock =  testSale.privateAllocated();
				await sale.distributeTimeLockedTokensAs(web3.eth.accounts[1], testSale.address, beneficiaries, tokens, timelocks, durations);
				let privateAllocatedAfterTimeLock =  testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'timelock tokens are not supposed to be allocated by a non-owner');
			}).timeout(300000);

			it('should not allow you to allocate time locked tokens if you pass in arrays bigger than 10', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, badArray, tokens, timelocks, durations);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'shouldnt be able to allocate if any array is bigger than 10');
			}).timeout(300000);

			it('should not allow you to allocate time locked tokens if you pass in arrays bigger than 10', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, badArray, timelocks, durations);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'shouldnt be able to allocate if any array is bigger than 10');
			}).timeout(300000);

			it('should not allow you to allocate time locked tokens if you pass in arrays bigger than 10', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, badArray, durations);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'shouldnt be able to allocate if any array is bigger than 10');
			}).timeout(300000);

			it('should not allow you to allocate time locked tokens if you pass in arrays bigger than 10', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, badArray);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'shouldnt be able to allocate if any array is bigger than 10');
			}).timeout(300000);

			it('should not allow you pass in arrays of different size', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, anotherBadArray, tokens, anotherBadArray, badArray);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'shouldnt be able to allocate if any array is bigger than 10');
			}).timeout(300000);

			it('should not allow you to allocate more than max_private', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tooMuchTokens, timelocks, durations);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), 'shouldnt be able to allocate if any array is bigger than 10');
			}).timeout(300000);

			it('should create disbursements and make sure private allocated is accurate', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, durations);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock)  + tokens[0] + tokens[1] + tokens[2], 'private allocated should not be the same after timelock');
			}).timeout(300000);

			it('should create disbursements and make sure private allocated is accurate', async () => {
				let privateAllocatedBeforeTimeLock = testSale.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, durations);
				let privateAllocatedAfterTimeLock = testSale.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock) + tokens[0] + tokens[1] + tokens[2], 'private allocated should not be the same after timelock');
			}).timeout(300000);


			it('should have an address for disbursements ', async ()=> {
				let disbursement1= testSale.disbursements(0);
				let disbursement2 = testSale.disbursements(1);
				let disbursement3 = testSale.disbursements(2);
				assert(JSON.parse(web3.isAddress(disbursement1)) === true, 'disbursement contract at index 0 does not have an address');
				assert(JSON.parse(web3.isAddress(disbursement2)) === true, 'disbursement contract at index 1 does not have an address');
				assert(JSON.parse(web3.isAddress(disbursement3)) === true, 'disbursement contract at index 2 does not have an address');
			}).timeout(300000);

			it('should have the correct properties on disbursements', async ()=> {

				let disbursementAddress1 = testSale.disbursements(0);
				let disbursement1 = await Disbursement.at(disbursementAddress1);
				let setOwner1 = 	disbursement1.owner();
				let	receiver1 = disbursement1.receiver();
				let	disbursementPeriod1 = disbursement1.disbursementPeriod();
				let	startDate1 = disbursement1.startDate();
				let	withdrawnTokens1 = disbursement1.withdrawnTokens();
				let token1 =	disbursement1.token();
				assert(setOwner1 === testSale.address, 'disbursement does not have the right owner');
				assert(receiver1 === beneficiaries[0], 'disbursement does not have the right owner');
				assert(JSON.parse(disbursementPeriod1) === durations[0], 'disbursement does not have the right owner');
				assert(JSON.parse(startDate1) === timelocks[0], 'disbursement does not have the right owner');
				assert(JSON.parse(withdrawnTokens1) === 0, 'disbursement does not have the right owner');
				assert(token1 === testSale.token(), 'disbursement does not have the right owner');

				let disbursementAddress2 = testSale.disbursements(1);
				let disbursement2 = await Disbursement.at(disbursementAddress2);
				let setOwner2 = 	disbursement2.owner();
				let	receiver2 = disbursement2.receiver();
				let	disbursementPeriod2 = disbursement2.disbursementPeriod();
				let	startDate2 = disbursement2.startDate();
				let	withdrawnTokens2 = disbursement2.withdrawnTokens();
				let token2 =	disbursement2.token();
				assert(setOwner2 === testSale.address, 'disbursement does not have the right owner');
				assert(receiver2 === beneficiaries[1], 'disbursement does not have the right owner');
				assert(JSON.parse(disbursementPeriod2) === durations[1], 'disbursement does not have the right owner');
				assert(JSON.parse(startDate2) === timelocks[1], 'disbursement does not have the right owner');
				assert(JSON.parse(withdrawnTokens2) === 0, 'disbursement does not have the right owner');
				assert(token2 === testSale.token(), 'disbursement does not have the right owner');

			}).timeout(300000);

			it('player one should be able to withdraw all of their tokens by now', async ()=> {
				let tx = await sale.removeTransferLock(testSale.address);
				let disbursementAddress1 = testSale.disbursements(0);
				let disbursement1 = await Disbursement.at(disbursementAddress1);
				let txHash = await Disbursement.withdrawDisbursement(disbursement1, beneficiaries[0], beneficiaries[0], tokens[0]);
				let withdrawnTokens1 = await disbursement1.withdrawnTokens();
				assert(JSON.parse(withdrawnTokens1) === tokens[0], 'claim amount is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);

			it('player 2 should be able to withdraw some of their tokens by now', async ()=> {
				let disbursementAddress2 = testSale.disbursements(1);
				let disbursement2 = await Disbursement.at(disbursementAddress2);
				let max = await disbursement2.calcMaxWithdraw();
				const timeAgain = Math.floor(Date.now() / 1000);
				let txHash = await Disbursement.withdrawDisbursement(disbursement2, beneficiaries[1], beneficiaries[1], 24000000);
				let withdrawnTokens2 = await disbursement2.withdrawnTokens();
				assert(JSON.parse(withdrawnTokens2) < tokens[1], 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(JSON.parse(withdrawnTokens2) > 0, 'claim amount is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);

			it('player 3 should not be able to withdraw any of their tokens by now', async ()=> {
				let disbursementAddress3 = testSale.disbursements(2);
				let disbursement3 = await Disbursement.at(disbursementAddress3);
				let txHash = await Disbursement.withdrawDisbursement(disbursement3, beneficiaries[2], beneficiaries[2], tokens[2]);
				let withdrawnTokens3 = await disbursement3.withdrawnTokens();
				assert(JSON.parse(withdrawnTokens3) === 0, 'claim amount is incorrect for ' + beneficiaries[2]);
			}).timeout(300000);

		}).timeout(3000000);

	// since we used the same parameters as for leverj, this suite stops here. another test sale is created in the next section to run a full sale

	}).timeout(3000000);

	describe('sale end-to-end test', () => {

		var blockNumber;
		var saleFrozen = false;
		var saleStarted = false;
		var saleEnded = false;

		var testSale1;
		var owner1; //= web3.eth.accounts[0];
		var freezeBlock1; //= web3.eth.blockNumber + 30;
		var startBlock1; //= freezeBlock1 + 20;
		var endBlock1; //= startBlock1 + 20;

		describe('creation of sale contract with block windows for testing full process', () => {

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
				owner1 = web3.eth.accounts[0];
				freezeBlock1 = web3.eth.blockNumber + 60;
				startBlock1 = freezeBlock1 + 20;
				endBlock1 = startBlock1 + 40;
				console.log("starting sale with ...");
				console.log("freezeBlock: " + freezeBlock1);
				console.log("startBlock: " + startBlock1);
				console.log("endBlock: " + endBlock1);
				testSale1 = await sale.createSale(owner1, freezeBlock1, startBlock1, endBlock1);
				let actualOwner =  testSale1.owner();
				let actualFreezeBlock =  testSale1.freezeBlock();
				let actualStartBlock =  testSale1.startBlock();
				let actualEndBlock =  testSale1.endBlock();
				let actualTOTAL_SUPPLY =  testSale1.TOTAL_SUPPLY();
				let actualMAX_PRIVATE =  testSale1.MAX_PRIVATE();
				let actualDECIMALS =  testSale1.DECIMALS();
				let actualNAME =  testSale1.NAME();
				let actualSYMBOL =  testSale1.SYMBOL();
				let actualprice_inwei =  testSale1.price_in_wei();
				let actualprivateAllocated =  testSale1.privateAllocated();
				let actualSetupCompleteFlag =  testSale1.setupCompleteFlag();
				let actualEmergencyFlag =  testSale1.emergencyFlag();
				assert(owner1 === actualOwner, "owner not saved properly");
				assert(freezeBlock1 === JSON.parse(actualFreezeBlock), "freezeBlock not saved properly");
				assert(startBlock1 === JSON.parse(actualStartBlock), "starBlock not saved properly");
				assert(endBlock1 === JSON.parse(actualEndBlock), "endBlock not saved properly");
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
				let tokenAddress = await testSale1.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const expectedVersion = 'H0.1';
				const expectedTotalSupply = expectedTOTAL_SUPPLY;
				const expectedBalanceOfSale = 1000000000000000000;
				const expectedSaleAddress = testSale1.address;
				const expectedTransferLock = false;

				let actualName = token.name();
	            let actualDecimal = token.decimals();
	            let actualSymbol = token.symbol();
	            let actualVersion = token.version();
	            let actualTotalSupply = token.totalSupply();
	            let actualBalanceOfSale = token.balanceOf(testSale1.address);
	            let actualSaleAddress = token.sale();
	            let actualTransferLock = token.transfersAllowed();
				
				assert(expectedNAME === actualName, "name not saved properly");
				assert(expectedDECIMALS === JSON.parse(actualDecimal), "decimal not saved properly");
				assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
				assert(expectedVersion === actualVersion, "version not saved properly");
				assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "token total supply not saved properly");
				assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
				assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
				assert(expectedTransferLock === JSON.parse(actualTransferLock), "transfer lock not saved properly");

			}).timeout(3000000);

		});

		describe('test change start block logic', ()=>{

			it('should not allow a non-owner to change the start block', async ()=>{
				let existingStartBlock = testSale1.startBlock();
				let blockToSet = startBlock1 + 1;
				let txHash = await sale.changeStartBlockAs(web3.eth.accounts[1], testSale1.address, blockToSet);
				let newStartBlock = testSale1.startBlock();
				assert(JSON.parse(existingStartBlock) === JSON.parse(newStartBlock), 'non-owner should not be able to change the start block');
			}).timeout(3000000);

			it('should not allow setting a new start block less than the existing block',async  ()=>{
				let existingStartBlock = testSale1.startBlock();
				let blockToSet = web3.eth.blockNumber - 10;
				let txHash = await sale.changeStartBlock(testSale1.address, blockToSet);
				let newStartBlock = testSale1.startBlock();
				assert(JSON.parse(existingStartBlock) === JSON.parse(newStartBlock), 'new start block must be a valid start  block');
			}).timeout(3000000);

			it('should not allow setting a new start block later than the existing start block', async ()=>{
				let existingStartBlock = testSale1.startBlock();
				let blockToSet = startBlock1 + 1;
				let txHash = await sale.changeStartBlockAs(web3.eth.accounts[1], testSale1.address, blockToSet);
				let newStartBlock = testSale1.startBlock();
				assert(JSON.parse(existingStartBlock) === JSON.parse(newStartBlock), 'new start block must be a valid start  block');
			}).timeout(3000000);

			it('should not allow an owner to change the start block to something later than the existing start block', async ()=>{
				let existingStartBlock = testSale1.startBlock();
				console.log("existing startblock: " + JSON.parse(existingStartBlock));
				let blockToSet = JSON.parse(existingStartBlock) + 1;
				console.log("startblock to set: " + JSON.parse(blockToSet));
				let txHash = await sale.changeStartBlock(testSale1.address, blockToSet);
				let newStartBlock = testSale1.startBlock();
				console.log("new startblock: " + JSON.parse(newStartBlock));
				assert(JSON.parse(existingStartBlock) === JSON.parse(newStartBlock), 'owner should not be able to change the start block to something later than the existing start block');
			}).timeout(3000000);

			it('should allow an owner to change the start block', async ()=>{
				let existingStartBlock = testSale1.startBlock();
				console.log("existing startblock: " + JSON.parse(existingStartBlock));
				let blockToSet = JSON.parse(existingStartBlock) - 1;
				console.log("startblock to set: " + JSON.parse(blockToSet));
				let txHash = await sale.changeStartBlock(testSale1.address, blockToSet);
				let newStartBlock = testSale1.startBlock();
				console.log("new startblock: " + JSON.parse(newStartBlock));
				assert(JSON.parse(existingStartBlock) - 1 === JSON.parse(newStartBlock), 'owner should be able to change the start block to something earlier than the existing start block');
			}).timeout(3000000);

		}).timeout(3000000);

		describe('test change owner logic', ()=>{

			it('should not allow a non-owner to change owner',async  ()=>{
				let existingOwner = testSale1.owner();
				let txHash = await sale.changeOwnerAs(web3.eth.accounts[1], testSale1.address, web3.eth.accounts[2]);
				let newOwner = testSale1.owner();
				assert(existingOwner === newOwner, 'non-owner should not be able to change the owner');
			}).timeout(3000000);

			it('should not allow a the owner to be set to 0', async ()=>{
				let existingOwner = testSale1.owner();
				let txHash = await sale.changeOwner(testSale1.address, 0);
				let newOwner = testSale1.owner();
				assert(existingOwner === newOwner, 'it should not allow setting owner to 0');
			}).timeout(3000000);

			it('should allow a valid update to the owner', async ()=>{
				let existingOwner = testSale1.owner();
				console.log("old owner: " + existingOwner);	
				let txHash = await sale.changeOwner(testSale1.address, web3.eth.accounts[1]);
				let newOwner = testSale1.owner();
				console.log("new owner: " + newOwner);	
				assert(newOwner === web3.eth.accounts[1], 'it should allow setting the new owner');
			}).timeout(3000000);
		

			it('should change the owner back for the sake of remaining tests lol', async ()=>{
				let existingOwner = testSale1.owner();
				console.log("old owner: " + existingOwner);	
				let txHash = await sale.changeOwnerAs(web3.eth.accounts[1], testSale1.address, web3.eth.accounts[0]);
				let newOwner = testSale1.owner();
				console.log("new owner: " + newOwner);	
				assert(newOwner === web3.eth.accounts[0], 'it should allow setting the new owner');
			}).timeout(3000000);

		}).timeout(3000000);

		describe('change price logic', ()=>{

			it('should not allow a non-owner to change price', async ()=>{
				let existingPrice = testSale1.price_in_wei();
				console.log("old price: " + existingPrice)
				let txHash = await sale.changePriceAs(web3.eth.accounts[1], testSale1.address, 222222);
				let newPrice = testSale1.price_in_wei();
				console.log("new price: " + newPrice)
				assert(JSON.parse(existingPrice) === JSON.parse(newPrice), 'non-owner should not be able to change the price');
			}).timeout(30000);

			it('anyone should not be allowed to change the price to 0',async ()=>{
				let existingPrice = testSale1.price_in_wei();
				let txHash = await sale.changePrice(testSale1.address, 0);
				let newPrice = testSale1.price_in_wei();
				assert(JSON.parse(existingPrice) === JSON.parse(newPrice), 'non-owner should not be able to change the price');
			}).timeout(300000);

			it('valid price change shoud reflect successfully',async  ()=>{
				let existingPrice = testSale1.price_in_wei();
				console.log("old price: " + existingPrice);	
				let txHash = await sale.changePrice(testSale1.address, 4444444);
				let newPrice = testSale1.price_in_wei();
				console.log("new price: " + newPrice);	
				assert(4444444 === JSON.parse(newPrice), 'owner should be able to change price successfully');
			}).timeout(3000000);

			it('should change the price back to the original one',async  ()=>{
				let existingPrice = testSale1.price_in_wei();
				console.log("old price: " + existingPrice);	
				let txHash = await sale.changePrice(testSale1.address, 333333);
				let newPrice = testSale1.price_in_wei();
				console.log("new price: " + newPrice);	
				assert(333333 === JSON.parse(newPrice), 'price should be set back to original');
			}).timeout(3000000);

		}).timeout(3000000);

		describe('distribute presale tokens', async () => {
			const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
			const tokens = [100000000000, 50000000000, 5000000000];
			const tooMuchTokens = [750000000000000000, 5000];
			const badArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
			const anotherBadArray = [0,1,2,3,4];

			it('should not allow you to call presale allocation if you are not an owner', async ()=>{
				let tokenAddress = await testSale1.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
				const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
				const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
				console.log("balance0before: " + balanceBefore0);
				console.log("balance1before: " + balanceBefore1);
				console.log("balance2before: " + balanceBefore2);
				let txHash = await sale.distributePresaleTokensAs(web3.eth.accounts[1], testSale1.address, beneficiaries, tokens);
				const balanceAfter0 = await token.balanceOf(beneficiaries[0]);
				const balanceAfter1 = await token.balanceOf(beneficiaries[1]);
				const balanceAfter2 = await token.balanceOf(beneficiaries[2]);
				console.log("balance0after: " + balanceAfter0);
				console.log("balance1after: " + balanceAfter1);
				console.log("balance2after: " + balanceAfter2);
				assert(JSON.parse(balanceBefore0) === JSON.parse(balanceAfter0), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore1) === JSON.parse(balanceAfter1), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore2) === JSON.parse(balanceAfter2), 'non owners are not able to allocate presale');
			}).timeout(3000000);

			it('should not allow you to call presale allocation if arrays are not equal',async ()=>{
				let tokenAddress = await testSale1.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
				const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
				const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
				let txHash = await sale.distributePresaleTokens(testSale1.address, beneficiaries, anotherBadArray);
				const balanceAfter0 = await token.balanceOf(beneficiaries[0]);
				const balanceAfter1 = await token.balanceOf(beneficiaries[1]);
				const balanceAfter2 = await token.balanceOf(beneficiaries[2]);
				assert(JSON.parse(balanceBefore0) === JSON.parse(balanceAfter0), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore1) === JSON.parse(balanceAfter1), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore2) === JSON.parse(balanceAfter2), 'non owners are not able to allocate presale');
			}).timeout(3000000);

			it('should not allow you to call presale allocation if any array is above 10',async ()=>{
				let tokenAddress = await testSale1.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
				const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
				const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
				let txHash = await sale.distributePresaleTokens(testSale1.address, beneficiaries, badArray);
				const balanceAfter0 = await token.balanceOf(beneficiaries[0]);
				const balanceAfter1 = await token.balanceOf(beneficiaries[1]);
				const balanceAfter2 = await token.balanceOf(beneficiaries[2]);
				assert(JSON.parse(balanceBefore0) === JSON.parse(balanceAfter0), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore1) === JSON.parse(balanceAfter1), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore2) === JSON.parse(balanceAfter2), 'non owners are not able to allocate presale');

			}).timeout(3000000);

			it('should allow proper allocatiosn to go through', async()=>{
				let tokenAddress = await testSale1.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
				const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
				const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
				let txHash = await sale.distributePresaleTokens(testSale1.address, beneficiaries, tokens);
				const balanceAfter0 = await token.balanceOf(beneficiaries[0]);
				const balanceAfter1 = await token.balanceOf(beneficiaries[1]);
				const balanceAfter2 = await token.balanceOf(beneficiaries[2]);
				assert(JSON.parse(balanceBefore0) + tokens[0] === JSON.parse(balanceAfter0), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore1) + tokens[1] === JSON.parse(balanceAfter1), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore2) + tokens[2] === JSON.parse(balanceAfter2), 'non owners are not able to allocate presale');
			}).timeout(3000000);

			it('should not allow you to allocate more than max_private', async()=>{
				let tokenAddress = await testSale1.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const balanceBefore0 = await token.balanceOf(beneficiaries[0]);
				const balanceBefore1 = await token.balanceOf(beneficiaries[1]);
				const balanceBefore2 = await token.balanceOf(beneficiaries[2]);
				let txHash = await sale.distributePresaleTokens(testSale1.address, beneficiaries, tooMuchTokens);
				const balanceAfter0 = await token.balanceOf(beneficiaries[0]);
				const balanceAfter1 = await token.balanceOf(beneficiaries[1]);
				const balanceAfter2 = await token.balanceOf(beneficiaries[2]);
				assert(JSON.parse(balanceBefore0) === JSON.parse(balanceAfter0), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore1) === JSON.parse(balanceAfter1), 'non owners are not able to allocate presale');
				assert(JSON.parse(balanceBefore2) === JSON.parse(balanceAfter2), 'non owners are not able to allocate presale');
			}).timeout(3000000);

		}).timeout(3000000);

		describe('setupcomplete flag shouldnt be allowed to get updated before the wallet is set', ()=> {

			it('should not let even the sale owner set the setupcomplete flag if the wallet has not been set', async () => {
				const existingFlag = testSale1.setupCompleteFlag();
				assert(existingFlag === false, 'this test cannot be ran if the flag is already set to true');
				let txHash = await sale.setSetupComplete(testSale1.address);
				const newFlag = testSale1.setupCompleteFlag();
				assert(newFlag === false, 'this should still be true false because the wallet has not been set yet');
			}).timeout(300000);

		}).timeout(3000000);

		
		describe('set wallet as ETH beneficiary for the sale',async () => {
			const beneficiary = web3.eth.accounts[3];

			it('trying to set the wallet as a non-owner should fail', async () => {
				let txHash = await sale.configureWalletAs(web3.eth.accounts[1], testSale1.address, beneficiary);
				let newWallet = await testSale1.wallet();
				console.log('newWallet: ' + newWallet);
				assert(newWallet === "0x0000000000000000000000000000000000000000", 'wallet should not have been set');
			}).timeout(3000000);

			it('trying to set the wallet as the owner should finish without errors', async () => {
				let txHash = await sale.configureWallet(testSale1.address, beneficiary);
				let newWallet = await testSale1.wallet();
				assert(newWallet == beneficiary, 'wallet should have been set properly');
			}).timeout(3000000);

			it('trying to set the wallet to 0 should fail', async () => {
				let txHash = await sale.configureWalletAs(web3.eth.accounts[1], testSale1.address, "0x0000000000000000000000000000000000000000");
				let newWallet = await testSale1.wallet();
				console.log('newWallet: ' + newWallet);
				assert(newWallet === beneficiary, 'wallet should still be the previously set wallet');
			}).timeout(3000000);

		}).timeout(3000000);

		describe('add whitelist entries', () => {
			let addresses = [];
			let amounts = [];

			for(var i = 10; i < web3.eth.accounts.length; i++){
				addresses.push(web3.eth.accounts[i]);
				amounts.push(Math.floor((Math.random() * 600001000000000) + 150000000000000));
			}

			it('whitelist entry should NOT be processed if called by a non-owner', async () => {
				let txHash = await sale.addWhitelistAs(web3.eth.accounts[1], testSale1.address, addresses, amounts);

				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale1.whitelistRegistrants(addresses[i]);	
					console.log("whitelist amount for: " + addresses[i] + " is: " + JSON.parse(whitelistedAmount));
					assert(JSON.parse(whitelistedAmount) === 0, 'this address incorrectly has a whitelisted amount');
				}

			}).timeout(3000000);

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale1.address, addresses, amounts);
				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale1.whitelistRegistrants(addresses[i]);
					console.log("whitelist amount for: " + addresses[i] + " is: " + JSON.parse(whitelistedAmount));
					assert(JSON.parse(whitelistedAmount) === amounts[i], 'this address amount was not set');
				}
			}).timeout(3000000);

		}).timeout(3000000);

		describe('after all configuration has been done, flag setup complete', () => {

			//make sure you cant buy if setup is not complete

			it('configuration flag be false initially', async ()=> {
				let existingFlag = testSale1.setupCompleteFlag();
				assert(!existingFlag, 'the setup complete flag is prematurely set');
			}).timeout(3000000);

			it('updating the setup flag as a non-owner should fail', async ()=> {
				let txHash = await sale.setSetupCompleteAs(web3.eth.accounts[1], testSale1.address);
				let newFlag = await testSale1.setupCompleteFlag();
				assert(newFlag === false, 'flag should still be false since non-owner tried calling');
			}).timeout(3000000);

			it('updating the setup flag as an owner should go through', async ()=> {
				let txHash = await sale.setSetupComplete(testSale1.address);
				let newFlag = testSale1.setupCompleteFlag();
				assert(JSON.parse(newFlag), 'flag should be set now since an owner called it');
			}).timeout(3000000);

			it('now the setup complete is set, we shouldnt be able to allocate presale tokens anymore', async () => {
				const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
				const tokens = [10000, 500000, 5000000];
				const tooMuchTokens = [75000000000000000, 5000];
				const timeNow = Math.floor(Date.now() / 1000);
				const timelocks = [timeNow, timeNow, timeNow + 144000];
				const durations = [1, 500, 1000000];
				const badArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
				const anotherBadArray = [0,1,2,3,4];
				let privateAllocatedBeforeTimeLock = testSale1.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale1.address, beneficiaries, tokens, timelocks, durations);
				let privateAllocatedAfterTimeLock = testSale1.privateAllocated();
				assert(JSON.parse(privateAllocatedAfterTimeLock) === JSON.parse(privateAllocatedBeforeTimeLock), '');
			}).timeout(300000);

		}).timeout(3000000);

	});

	describe('misc sale unit tests', () => {

		describe('constructor', () => {

			var testSale;
			var owner = web3.eth.accounts[0];
			var freezeBlock = 4500082;
			var startBlock = freezeBlock + 10000;
			var endBlock = startBlock + 170000;

			describe('creation of sale contract with valid parameters', () => {

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
					testSale = await sale.createSale(owner, freezeBlock, startBlock, endBlock);
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

					assert(owner === actualOwner, "owner not saved properly");
					assert(freezeBlock === JSON.parse(actualFreezeBlock), "freezeBlock not saved properly");
					assert(startBlock === JSON.parse(actualStartBlock), "starBlock not saved properly");
					assert(endBlock === JSON.parse(actualEndBlock), "endBlock not saved properly");
					assert(expectedTOTAL_SUPPLY === JSON.parse(actualTOTAL_SUPPLY), "total supply not saved properly");
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
					assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "total supply not saved properly");
					assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
					assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
					assert(expectedTransferLock === JSON.parse(actualTransferLock), "end block not saved properly");

				}).timeout(3000000);

			}).timeout(300000);

			describe('creation of sale contract with bad parameters', () => {

				it('should not allow you to create a sale with end block earlier than start block', async () => {
					var testSale;
					var owner = web3.eth.accounts[0];
					var freezeBlock = 4500082;
					var startBlock = freezeBlock + 10000;
					var endBlock = startBlock - 5;

		            const expectedTOTAL_SUPPLY = 1000000000000000000;
		    		const expectedMAX_PRIVATE = 750000000000000000;
				    const expectedDECIMALS = 9;
				    const expectedNAME = "Leverj";
				    const expectedSYMBOL = "LEV";
				    const expectedprice_inwei = 333333;
				    const expectedprivateAllocated = 0;
				    const expectedSetupCompleteFlag = false;
				    const expectedEmergencyFlag = false;

					testSale = await sale.createSaleResolveError(owner, freezeBlock, startBlock, endBlock);
					assert(!web3.isAddress(testSale.address), 'testSale should not be populated');				
				}).timeout(300000);

				it('should not allow you to create sale with freeze block earlier than current block', async () => {
					var testSale;
					var owner = web3.eth.accounts[0];
					var freezeBlock = web3.eth.blockNumber -5;
					var startBlock = freezeBlock + 10000;
					var endBlock = startBlock + 5;

		            const expectedTOTAL_SUPPLY = 1000000000000000000;
		    		const expectedMAX_PRIVATE = 750000000000000000;
				    const expectedDECIMALS = 9;
				    const expectedNAME = "Leverj";
				    const expectedSYMBOL = "LEV";
				    const expectedprice_inwei = 333333;
				    const expectedprivateAllocated = 0;
				    const expectedSetupCompleteFlag = false;
				    const expectedEmergencyFlag = false;

					testSale = await sale.createSaleResolveError(owner, freezeBlock, startBlock, endBlock);
					assert(!web3.isAddress(testSale.address), 'testSale should not be populated');				
				}).timeout(300000);

				it('should not allow you to create a sale with freeze block later than start block', async () => {
					var testSale;
					var owner = web3.eth.accounts[0];
					var freezeBlock = 4500082;
					var startBlock = freezeBlock - 10;
					var endBlock = startBlock + 500;

		            const expectedTOTAL_SUPPLY = 1000000000000000000;
		    		const expectedMAX_PRIVATE = 750000000000000000;
				    const expectedDECIMALS = 9;
				    const expectedNAME = "Leverj";
				    const expectedSYMBOL = "LEV";
				    const expectedprice_inwei = 333333;
				    const expectedprivateAllocated = 0;
				    const expectedSetupCompleteFlag = false;
				    const expectedEmergencyFlag = false;

					testSale = await sale.createSaleResolveError(owner, freezeBlock, startBlock, endBlock);
					assert(!web3.isAddress(testSale.address), 'testSale should not be populated');				
				}).timeout(300000);

			}).timeout(300000);

		}).timeout(300000);

	}).timeout(300000);

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
				var weiToSend = Math.floor((Math.random() * 50000000000000000000000) + 10000000000000000000000);
				var txHash = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[randomBuyerIndex], weiToSend);
				let buyerBalanceAfter = token.balanceOf(web3.eth.accounts[randomBuyerIndex]);
				assert(JSON.parse(buyerBalanceBefore) != JSON.parse(buyerBalanceAfter), 'buyer should have been able to get tokens');
				let newSaleBalance = JSON.parse(token.balanceOf(testSale2.address));
				if(newSaleBalance > weiToTokens(weiToSend - 2000000)){
					//since its close to the end, buy out the rest and bounce
					var txHash2 = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[randomBuyerIndex], (JSON.parse(token.balanceOf(testSale2.address))*333333)+2400000);
					break;
				}
				if(web3.eth.blockNumber == (endBlock - 5)){
					//since its close to the end, buy out the rest and bounce
					var txHash2 = await sale.purchaseTokens(testSale2.address, web3.eth.accounts[randomBuyerIndex], (JSON.parse(token.balanceOf(testSale2.address))*333333)+2400000);
					break;
				}	
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

}).timeout(300000);


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
