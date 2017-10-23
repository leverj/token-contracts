var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var Filter 						= require('../lib/Filter');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('Sale Tests', ()=>{
	
	describe('sale end-to-end test', () => {

		var testSale;
		var owner = web3.eth.accounts[0];
		var freezeBlock = 4500082;
		var startBlock = freezeBlock + 10000;
		var endBlock = startBlock + 170000;

		describe('creation of sale contract with LEV sale parameters', () => {

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

		/*this also needs updating based on reversion of distribute function
		describe('distribute private sale tokens', () => {
			const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2]];
			const tokens = [10000000000000, 50000000000000];
			const timelocks = [1514678400, 1520035200, 1540035200];
			const breakdown = [10, 30, 30];

			it('filters address array should be populated', async () => {
				await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, breakdown);
			}).timeout(300000);

			// next test does more in here!

		}).timeout(3000000);
		*/

		describe('set wallet as ETH beneficiary for the sale', () => {
			const beneficiary = web3.eth.accounts[3];

			it('trying to set the wallet as a non-owner should fail', async () => {
				let txHash = await sale.configureWalletAs(web3.eth.accounts[1], testSale.address, beneficiary);
				let newWallet = await testSale.wallet();
				assert(newWallet === "0x0000000000000000000000000000000000000000", 'wallet should not have been set');
			}).timeout(3000000);

			it('querying the wallet on the contract should give old beneficiary', async () => {
				let configuredWallet = testSale.wallet();
				assert(configuredWallet != beneficiary, 'the wallet should not have been updated but it was');
			}).timeout(3000000);

			it('trying to set the wallet as the owner should finish without errors', async () => {
				let txHash = await sale.configureWallet(testSale.address, beneficiary);
				let newWallet = await testSale.wallet();
				assert(newWallet == beneficiary, 'wallet should have been set properly');
			}).timeout(3000000);

			it('querying the wallet on the contract should give the new beneficiary', async () => {
				let txHash = await sale.configureWallet(testSale.address, beneficiary);
				let configuredWallet = await testSale.wallet();
				assert(configuredWallet === beneficiary, 'the new wallet was not configured successfully');
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
				let txHash = await sale.addWhitelistAs(web3.eth.accounts[1], testSale.address, addresses, amounts);

				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale.whitelistRegistrants(addresses[i]);
					assert(JSON.parse(whitelistedAmount) === 0, 'this address incorrectly has a whitelisted amount');
				}

			}).timeout(3000000);

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale.address, addresses, amounts);
				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale.whitelistRegistrants(addresses[i]);
					assert(JSON.parse(whitelistedAmount) === amounts[i], 'this address amount was not set');
				}
			}).timeout(3000000);

		}).timeout(3000000);

		describe('after all configuration has been done, flag setup complete', () => {

			it('configuration flag be false initially', async ()=> {
				let existingFlag = testSale.setupCompleteFlag();
				assert(!existingFlag, 'the setup complete flag is prematurely set');
			}).timeout(3000000);

			it('updating the setup flag as a non-owner should fail', async ()=> {
				let txHash = await sale.setSetupCompleteAs(web3.eth.accounts[1], testSale.address);
				let newFlag = await testSale.setupCompleteFlag();
				assert(newFlag === false, 'flag should still be false since non-owner tried calling');
			}).timeout(3000000);

			it('updating the setup flag as an owner should go through', async ()=> {
				let txHash = await sale.setSetupComplete(testSale.address);
				let newFlag = testSale.setupCompleteFlag();
				assert(newFlag, 'flag should be set now since an owner called it');
			}).timeout(3000000);

		}).timeout(3000000);

	// since we used the same parameters as for leverj, this suite stops here. another test sale is created in the next section to run a full sale
	}).timeout(3000000);

	describe('sale end-to-end test', () => {

		var blockNumber;
		var saleFrozen = false;
		var saleStarted = false;
		var saleEnded = false;

		var testSale1;
		var owner = web3.eth.accounts[0];
		var freezeBlock = web3.eth.blockNumber + 10;
		var startBlock = freezeBlock + 5;
		var endBlock = startBlock + 20;

		var saleWatcher = web3.eth.filter('latest');
		saleWatcher.watch(function(error, result){
			if (!error){
				blockNumber = web3.eth.getBlock(result).blockNumber;

				switch(result) {
					case freezeBlock:
						saleFrozen = true;
						console.log('sale is now frozen');
						break;
					case startBlock-3:
						console.log('3 blocks before sale start');
						testOnBeforeSaleStart(testSale1);
					case startBlock:
						saleStarted = true;
						console.log('sale has now started');
						testsOnSaleStart(testSale1);
						break;
					case endBlock:
						saleEnded = true;
						console.log('sale has now ended');
					default:

				} 

			}
		});

		function testOnBeforeSaleStart(saleToTest){
			describe('test logic that should occur before the sale starts', ()=>{
				it('should not allow anyone to purchase tokens before the sale starts', async ()=> {
					if(saleToTest.startBlock() > web3.eth.blockNumber){
						var txHash = await sale.purchaseTokens(saleToTest.address, web3.eth.accounts[11], Math.floor((Math.random() * 500) + 1));
						assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');
					}
				}).timeout(300000);
			}).timeout(3000000);
		}

		function testsOnSaleStart(saleToTest){

			describe('conduct purchases during the sale at address ' + saleToTest.address, () => {

				it('should allow whitelisted users to purchase once the start block is hit', async ()=>{

					for(var i=0; i < 100; i++){
						for(var j=10; j<web3.eth.accounts.length; j++){
							if(web3.eth.blockNumber >= startBlock){
								it('should allow whitelisted users to purchase tokens', async ()=> {
									var txHash = await sale.purchaseTokens(testSale.address, web3.eth.accounts[j], Math.floor((Math.random() * 500) + 1));
									assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should have went through');
								}).timeout(300000);
							}

							if(web3.eth.blockNumber >= endBlock){
								it('should not allow any users to purchase tokens after sale is ended', async ()=> {
									var txHash = await sale.purchaseTokens(testSale.address, web3.eth.accounts[j], Math.floor((Math.random() * 500) + 1));
									assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');
								}).timeout(300000);
							}
						}
					}

				}).timeout(300000);

				// TODO: more volumous purchase tests

			}).timeout(300000);

		}

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
				testSale1 = await sale.createSale(owner, freezeBlock, startBlock, endBlock);
				let actualOwner =  testSale1.owner();
				let actualFreezeBlock =  testSale1.freezeBlock();
				let actualStartBlock =  testSale.startBlock();
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

		describe('distribute private time locked tokens', () => {

			/* TODO: update based reversion back to previous version of distribute function
			const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2]];
			const tokens = [100000000000000000, 300000000000000000];
			const currentTimeStamp = Math.floor(Date.now() / 1000);
			const timelocks = [currentTimeStamp + 300, currentTimeStamp + 600, currentTimeStamp + 900];
			const breakdown = [50, 40, 10];
			const expectedCount = timelocks.length;

			it('filters should be created', async () => {
				let privateAllocatedBeforeTimeLock = testSale1.privateAllocated();
				await sale.distributeTimeLockedTokens(testSale1.address, beneficiaries, tokens, timelocks, breakdown);
				let privateAllocatedAfterTimeLock = testSale1.privateAllocated();
				assert(privateAllocatedBeforeTimeLock != privateAllocatedAfterTimeLock, 'private allocated should not be the same after timelock');
			}).timeout(300000);

			it('should have an address for disbursement filters ', async ()=> {
				let filterAddress0 = testSale1.filters(0);
				let filterAddress1 = testSale1.filters(1);
				let filterAddress2 = testSale1.filters(2);
				assert(web3.isAddress(filterAddress0) === true, 'filter contract at index 0 does not have an address');
				assert(web3.isAddress(filterAddress1) === true, 'filter contract at index 1 does not have an address');
				assert(web3.isAddress(filterAddress2) === true, 'filter contract at index 2 does not have an address');
			}).timeout(300000);

			it('should have the correct properties on filters', async ()=> {

				var filterAddress0 = testSale1.filters(0);
				let filter0 = await Filter.at(filterAddress0);
				var disburserAddress0 = filter0.disburser();
				var filterOwner0 = filter0.owner();
				assert(web3.isAddress(disburserAddress0) === true, 'filter contract at index does not have a valid address for its disburser');
				assert(filterOwner0 === testSale1.address, 'the incorrect owner was set for the filter index ');

				var filterAddress1 = testSale1.filters(1);
				let filter1 = await Filter.at(filterAddress1);
				var disburserAddress1 = filter1.disburser();
				var filterOwner1 = filter1.owner();
				assert(web3.isAddress(disburserAddress1) === true, 'filter contract at index does not have a valid address for its disburser');
				assert(filterOwner1 === testSale1.address, 'the incorrect owner was set for the filter index ');

				var filterAddress2 = testSale1.filters(2);
				let filter2 = await Filter.at(filterAddress2);
				var disburserAddress2 = filter2.disburser();
				var filterOwner2 = filter2.owner();
				assert(web3.isAddress(disburserAddress2) === true, 'filter contract at index does not have a valid address for its disburser');
				assert(filterOwner2 === testSale1.address, 'the incorrect owner was set for the filter index ');

			}).timeout(300000);

			it('should have the correct information for timelock 0 beneficiary 0 ', async ()=> {
				var filterAddress = testSale1.filters(0);
				let filter = await Filter.at(filterAddress);
				var disburserAddress = filter.disburser();
				assert(web3.isAddress(disburserAddress) === true, 'filter does not have valid address for disburser');
				var filterOwner = filter.owner();
				assert(filterOwner === testSale1.address, 'the incorrect owner was set for the filter index ');
				var info = filter.getBeneficiaryInfo(beneficiaries[0]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[0]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);

			it('should have the correct information for timelock 0 beneficiary 1 ', async ()=> {
				var filterAddress = testSale1.filters(0);
				let filter = await Filter.at(filterAddress);
				var disburserAddress = filter.disburser();
				assert(web3.isAddress(disburserAddress) === true, 'filter does not have valid address for disburser');
				var filterOwner = filter.owner();
				assert(filterOwner === testSale1.address, 'the incorrect owner was set for the filter index ');
				var info = filter.getBeneficiaryInfo(beneficiaries[1]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);

			it('should have the correct information for timelock 1 beneficiary 0 ', async ()=> {
				var filterAddress = testSale1.filters(1);
				let filter = await Filter.at(filterAddress);
				var disburserAddress = filter.disburser();
				assert(web3.isAddress(disburserAddress) === true, 'filter does not have valid address for disburser');
				var filterOwner = filter.owner();
				assert(filterOwner === testSale1.address, 'the incorrect owner was set for the filter index ');
				var info = filter.getBeneficiaryInfo(beneficiaries[0]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[0]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);

			it('should have the correct information for timelock 1 beneficiary 1 ', async ()=> {
				var filterAddress = testSale1.filters(1);
				let filter = await Filter.at(filterAddress);
				var disburserAddress = filter.disburser();
				assert(web3.isAddress(disburserAddress) === true, 'filter does not have valid address for disburser');
				var filterOwner = filter.owner();
				assert(filterOwner === testSale1.address, 'the incorrect owner was set for the filter index ');
				var info = filter.getBeneficiaryInfo(beneficiaries[1]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);

			it('should have the correct information for timelock 2 beneficiary 0 ', async ()=> {
				var filterAddress = testSale1.filters(2);
				let filter = await Filter.at(filterAddress);
				var disburserAddress = filter.disburser();
				assert(web3.isAddress(disburserAddress) === true, 'filter does not have valid address for disburser');
				var filterOwner = filter.owner();
				assert(filterOwner === testSale1.address, 'the incorrect owner was set for the filter index ');
				var info = filter.getBeneficiaryInfo(beneficiaries[0]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[0]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);

			it('should have the correct information for timelock 2 beneficiary 1 ', async ()=> {
				var filterAddress = testSale1.filters(2);
				let filter = await Filter.at(filterAddress);
				var disburserAddress = filter.disburser();
				assert(web3.isAddress(disburserAddress) === true, 'filter does not have valid address for disburser');
				var filterOwner = filter.owner();
				assert(filterOwner === testSale1.address, 'the incorrect owner was set for the filter index ');
				var info = filter.getBeneficiaryInfo(beneficiaries[1]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);


			it('it should not allow the beneficiary 0 to withdraw from filter 0', async ()=> {
				var filterAddress = testSale1.filters(0);
				let filter = await Filter.at(filterAddress);
				await Filter.claim(filterAddress, beneficiaries[0]);
				var info = filter.getBeneficiaryInfo(beneficiaries[0]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[0]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);


			it('it should not allow the beneficiary 1 to withdraw from filter 0', async ()=> {
				var filterAddress = testSale1.filters(0);
				let filter = await Filter.at(filterAddress);
				await Filter.claim(filterAddress, beneficiaries[1]);
				var info = filter.getBeneficiaryInfo(beneficiaries[1]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);

			it('it should not allow the beneficiary 0 to withdraw from filter 1', async ()=> {
				var filterAddress = testSale1.filters(1);
				let filter = await Filter.at(filterAddress);
				await Filter.claim(filterAddress, beneficiaries[0]);
				var info = filter.getBeneficiaryInfo(beneficiaries[0]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[0]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);


			it('it should not allow the beneficiary 1 to withdraw from filter 1', async ()=> {
				var filterAddress = testSale1.filters(1);
				let filter = await Filter.at(filterAddress);
				await Filter.claim(filterAddress, beneficiaries[1]);
				var info = filter.getBeneficiaryInfo(beneficiaries[1]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);


			it('it should not allow the beneficiary 0 to withdraw from filter 2', async ()=> {
				var filterAddress = testSale1.filters(2);
				let filter = await Filter.at(filterAddress);
				await Filter.claim(filterAddress, beneficiaries[0]);
				var info = filter.getBeneficiaryInfo(beneficiaries[0]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[0]);
				assert(info[1] === false, 'claimed flag is incorrect for ' + beneficiaries[0]);
			}).timeout(300000);


			it('it should not allow the beneficiary 1 to withdraw from filter 2', async ()=> {
				var filterAddress = testSale1.filters(2);
				let filter = await Filter.at(filterAddress);
				await Filter.claim(filterAddress, beneficiaries[1]);
				var info = filter.getBeneficiaryInfo(beneficiaries[1]);
				assert(info[0] != 0, 'claim amount is incorrect for ' + beneficiaries[1]);
				assert(info[1] != false, 'claimed flag is incorrect for ' + beneficiaries[1]);
			}).timeout(300000);


			//TODO: wait for the vesting time and then retry the withdrawals

		*/
		}).timeout(3000000);

		//TODO: add presale functions

		
		describe('set wallet as ETH beneficiary for the sale', () => {
			const beneficiary = web3.eth.accounts[3];

			it('trying to set the wallet as a non-owner should fail', async () => {
				let txHash = await sale.configureWalletAs(web3.eth.accounts[1], testSale1.address, beneficiary);
				let newWallet = await testSale1.wallet();
				console.log('newWallet: ' + newWallet);
				assert(newWallet === "0x0000000000000000000000000000000000000000", 'wallet should not have been set');
			}).timeout(3000000);

			it('querying the wallet on the contract should give old beneficiary', async () => {
				let configuredWallet = testSale1.wallet();
				assert(configuredWallet != beneficiary, 'the wallet should not have been updated but it was');
			}).timeout(3000000);

			it('trying to set the wallet as the owner should finish without errors', async () => {
				let txHash = await sale.configureWallet(testSale1.address, beneficiary);
				let newWallet = await testSale1.wallet();
				assert(newWallet == beneficiary, 'wallet should have been set properly');
			}).timeout(3000000);

			it('querying the wallet on the contract should give the new beneficiary', async () => {
				let txHash = await sale.configureWallet(testSale1.address, beneficiary);
				let configuredWallet = await testSale1.wallet();
				assert(configuredWallet === beneficiary, 'the new wallet was not configured successfully');
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
					assert(JSON.parse(whitelistedAmount) === 0, 'this address incorrectly has a whitelisted amount');
				}

			}).timeout(3000000);

			it('whitelist entry should be processed without failure', async () => {
				let txHash = await sale.addWhitelist(testSale1.address, addresses, amounts);
				for(var i = 0; i < addresses.length; i++){
					let whitelistedAmount = await testSale1.whitelistRegistrants(addresses[i]);
					assert(JSON.parse(whitelistedAmount) === amounts[i], 'this address amount was not set');
				}
			}).timeout(3000000);

		}).timeout(3000000);

		describe('after all configuration has been done, flag setup complete', () => {

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
				assert(newFlag, 'flag should be set now since an owner called it');
			}).timeout(3000000);

		}).timeout(3000000);

		//TODO: test lock removal and reversal from the Sale contract

	});

	describe('sale unit tests', () => {

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

		}).timeout(300000);

	}).timeout(300000);
	
}).timeout(300000);
