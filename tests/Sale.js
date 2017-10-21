var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('sale end-to-end test', () => {

	var testSale;
	var owner = web3.eth.accounts[0];
	var freezeBlock = 4500082;
	var startBlock = freezeBlock + 10000;
	var endblock = startBlock + 170000;

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
			testSale = await sale.createSale(owner, freezeBlock, startBlock, endblock);

			var events = testSale.allEvents(function(error, log){
				if (!error)
					console.log(log);
			});

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
			assert(endblock === JSON.parse(actualEndBlock), "endBlock not saved properly");
			assert(expectedTOTAL_SUPPLY === JSON.parse(actualTOTAL_SUPPLY), "sale total supply not saved properly");
			assert(expectedMAX_PRIVATE === JSON.parse(actualMAX_PRIVATE), "max private not saved properly");
			assert(expectedDECIMALS === JSON.parse(actualDECIMALS), "DECIMALS not saved properly");
			assert(expectedNAME === actualNAME, "name not saved properly");
			assert(expectedSYMBOL === actualSYMBOL, "symbol not saved properly");
			assert(expectedprice_inwei === JSON.parse(actualprice_inwei), "price in wei not saved properly");
			assert(expectedprivateAllocated === JSON.parse(actualprivateAllocated), "private allocated not set properly");
			assert(expectedSetupCompleteFlag === JSON.parse(actualSetupCompleteFlag), "setupcompleteflag block not saved properly");
			assert(expectedEmergencyFlag === JSON.parse(actualEmergencyFlag), "emergency flag not saved properly");
		}).timeout(300000);

		it('underlying token should have the correct parameters saved', async () => {
			let tokenAddress = await testSale.token();
            let token = await HumanStandardToken.at(tokenAddress);
			const expectedVersion = 'H0.1';
			const expectedTotalSupply = expectedTOTAL_SUPPLY;
			const expectedBalanceOfSale = 1000000000000000000;
			const expectedSaleAddress = testSale.address;
			const expectedEndBlock = endblock;

			let actualName = token.name();
            let actualDecimal = token.decimals();
            let actualSymbol = token.symbol();
            let actualVersion = token.version();
            let actualTotalSupply = token.totalSupply();
            let actualBalanceOfSale = token.balanceOf(testSale.address);
            let actualSaleAddress = token.sale();
            let actualEndBlock = token.endBlock();
			
			assert(expectedNAME === actualName, "name not saved properly");
			assert(expectedDECIMALS === JSON.parse(actualDecimal), "decimal not saved properly");
			assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
			assert(expectedVersion === actualVersion, "version not saved properly");
			assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "token total supply not saved properly");
			assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
			assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
			assert(expectedEndBlock === JSON.parse(actualEndBlock), "end block not saved properly");

		}).timeout(300000);

	});

	describe('distribute private sale tokens', () => {
		const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2]];
		const tokens = [10000000000000, 50000000000000];
		const timelocks = [1514678400, 1520035200, 1540035200];
		const breakdown = [10, 30, 30];

		it('filters address array should be populated', async () => {
			await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, breakdown);
			const expectedCount = timelocks.length;
			// TODO: check results on contract (event logs look good)
		}).timeout(300000);

		// TODO: NEEDS WAY MORE IN HERE

	});

	describe('set wallet as ETH beneficiary for the sale', () => {
		const beneficiary = web3.eth.accounts[3];

		it('trying to set the wallet as a non-owner should fail', async () => {
			var txHash = await sale.configureWalletAs(web3.eth.accounts[1], testSale.address, beneficiary);
			assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');
		});

		it('querying the wallet on the contract should give old beneficiary', async () => {
			var configuredWallet = testSale.wallet();
			assert(configuredWallet != beneficiary, 'the wallet should not have been updated but it was');
		});

		it('trying to set the wallet as the owner should finish without errors', async () => {
			var txHash = await sale.configureWallet(testSale.address, beneficiary);
			assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should not have went through');

			it('querying the wallet on the contract should give the new beneficiary', async () => {
				var configuredWallet = testSale.wallet();
				console.log("configured wallet: " + configuredWallet);
				assert(configuredWallet === beneficiary, 'the new wallet was not configured successfully');
			});
		});

	});

	describe('add whitelist entries', () => {
		var addresses = [];
		var amounts = [];

		for(var i = 10; i < web3.eth.accounts.length; i++){
			addresses.push(web3.eth.accounts[i]);
			amounts.push(Math.floor((Math.random() * 600001000000000) + 150000000000000));
		}

		it('whitelist entry should NOT be processed if called by a non-owner', async () => {
			var txHash = await sale.addWhitelistAs(web3.eth.accounts[1], testSale.address, addresses, amounts);
			assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');

			for(var i = 0; i < addresses.length; i++){

				it('address ' + addresses[i] + ' should not be in the whitelist entry', async () => {
					var whitelistedAmount = testSale.whitelistRegistrants(addresses[i]);
					assert(whitelistedAmount != 0, 'this address incorrectly has a whitelisted amount');
				});

			}

		});

		it('whitelist entry should be processed without failure', async () => {
			var txHash = await sale.addWhitelist(testSale.address, addresses, amounts);
			assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should have went through');

			for(var i = 0; i < addresses.length; i++){

				it('address ' + addresses[i] + ' should not be in the whitelist entry', async () => {
					var whitelistedAmount = testSale.whitelistRegistrants(addresses[i]);
					assert(whitelistedAmount === 0, 'this address amount was not set');

				});

			}
		});

	});

	describe('after all configuration has been done, flag setup complete', () => {

		it('configuration flag be false initially', async ()=> {
			var existingFlag = testSale.setupCompleteFlag();
			assert(!existingFlag, 'the setup complete flag is prematurely set');
		});

		it('updating the setup flag as a non-owner should fail', async ()=> {

			var txHash = await sale.setSetupCompleteFlagAs(web3.eth.accounts[1], testSale.address);
			assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');

			it('configuration flag shound not be set', async ()=> {
				var currentFlag = testSale.setupCompleteFlag();
				assert(!currentFlag, 'a non-owner was incorrectly able to set the setup flag');
			});

		});

		it('updating the setup flag as an owner should go through', async ()=> {

			var txHash = await sale.setSetupCompleteFlag(testSale.address);
			assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should have went through');

			it('configuration flag shound not be set', async ()=> {
				var currentFlag = testSale.setupCompleteFlag();
				assert(!currentFlag, 'a non-owner was incorrectly able to set the setup flag');
			});

		});

	});

	// since we used the same parameters as for leverj, this suite stops here. another test sale is created in the next section to run a full sale

});

describe('sale end-to-end test', () => {

	var testSale;
	var owner = web3.eth.accounts[0];
	var freezeBlock = web3.eth.blockNumber + 10;
	var startBlock = freezeBlock + 5;
	var endblock = startBlock + 20;

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
			testSale = await sale.createSale(owner, freezeBlock, startBlock, endblock);

			var events = testSale.allEvents(function(error, log){
				if (!error)
					console.log(log);
			});

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
			assert(endblock === JSON.parse(actualEndBlock), "endBlock not saved properly");
			assert(expectedTOTAL_SUPPLY === JSON.parse(actualTOTAL_SUPPLY), "sale total supply not saved properly");
			assert(expectedMAX_PRIVATE === JSON.parse(actualMAX_PRIVATE), "max private not saved properly");
			assert(expectedDECIMALS === JSON.parse(actualDECIMALS), "DECIMALS not saved properly");
			assert(expectedNAME === actualNAME, "name not saved properly");
			assert(expectedSYMBOL === actualSYMBOL, "symbol not saved properly");
			assert(expectedprice_inwei === JSON.parse(actualprice_inwei), "price in wei not saved properly");
			assert(expectedprivateAllocated === JSON.parse(actualprivateAllocated), "private allocated not set properly");
			assert(expectedSetupCompleteFlag === JSON.parse(actualSetupCompleteFlag), "setupcompleteflag block not saved properly");
			assert(expectedEmergencyFlag === JSON.parse(actualEmergencyFlag), "emergency flag not saved properly");
		}).timeout(300000);

		it('underlying token should have the correct parameters saved', async () => {
			let tokenAddress = await testSale.token();
            let token = await HumanStandardToken.at(tokenAddress);
			const expectedVersion = 'H0.1';
			const expectedTotalSupply = expectedTOTAL_SUPPLY;
			const expectedBalanceOfSale = 1000000000000000000;
			const expectedSaleAddress = testSale.address;
			const expectedEndBlock = endblock;

			let actualName = token.name();
            let actualDecimal = token.decimals();
            let actualSymbol = token.symbol();
            let actualVersion = token.version();
            let actualTotalSupply = token.totalSupply();
            let actualBalanceOfSale = token.balanceOf(testSale.address);
            let actualSaleAddress = token.sale();
            let actualEndBlock = token.endBlock();
			
			assert(expectedNAME === actualName, "name not saved properly");
			assert(expectedDECIMALS === JSON.parse(actualDecimal), "decimal not saved properly");
			assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
			assert(expectedVersion === actualVersion, "version not saved properly");
			assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "token total supply not saved properly");
			assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
			assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
			assert(expectedEndBlock === JSON.parse(actualEndBlock), "end block not saved properly");

		}).timeout(300000);

	});

	describe('distribute private sale tokens', () => {
		const beneficiaries = [web3.eth.accounts[1], web3.eth.accounts[2]];
		const tokens = [10000000000000, 50000000000000];
		const timelocks = [1514678400, 1520035200, 1540035200];
		const breakdown = [10, 30, 30];

		it('filters address array should be populated', async () => {
			await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, breakdown);
			const expectedCount = timelocks.length;
			// TODO: check results on contract (event logs look good)
		}).timeout(300000);

		// TODO: NEEDS WAY MORE IN HERE

	});

	describe('set wallet as ETH beneficiary for the sale', () => {
		const beneficiary = web3.eth.accounts[3];

		it('trying to set the wallet as a non-owner should fail', async () => {
			var txHash = await sale.configureWalletAs(web3.eth.accounts[1], testSale.address, beneficiary);
			assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');

			it('querying the wallet on the contract should give old beneficiary', async () => {
				var configuredWallet = testSale.wallet();
				assert(configuredWallet != beneficiary, 'the wallet should not have been updated but it was');
			});

		});


		it('trying to set the wallet as the owner should finish without errors', async () => {
			var txHash = await sale.configureWallet(testSale.address, beneficiary);
			assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction was supposed to go through');

			it('querying the wallet on the contract should give the new beneficiary', async () => {
				var configuredWallet = testSale.wallet();
				assert(configuredWallet === beneficiary, 'the new wallet was not configured successfully');
			});

		});

	});

	describe('add whitelist entries', () => {
		var addresses = [];
		var amounts = [];

		for(var i = 10; i < web3.eth.accounts.length; i++){
			addresses.push(web3.eth.accounts[i]);
			amounts.push(Math.floor((Math.random() * 600001000000000) + 150000000000000));
		}

		it('whitelist entry should NOT be processed if called by a non-owner', async () => {
			var txHash = await sale.addWhitelistAs(web3.eth.accounts[1], testSale.address, addresses, amounts);
			assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');

			for(var i = 0; i < addresses.length; i++){

				it('address ' + addresses[i] + ' should not be in the whitelist entry', async () => {
					var whitelistedAmount = testSale.whitelistRegistrants(addresses[i]);
					assert(whitelistedAmount != 0, 'this address incorrectly has a whitelisted amount');

				});

			}

		});

		it('whitelist entry should be processed without failure', async () => {
			var txHash = await sale.addWhitelist(testSale.address, addresses, amounts);
			assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should have went through');

			for(var i = 0; i < addresses.length; i++){

				it('address ' + addresses[i] + ' should not be in the whitelist entry', async () => {
					var whitelistedAmount = testSale.whitelistRegistrants(addresses[i]);
					assert(whitelistedAmount === 0, 'this address amount was not set');
				});

			}
		});

	});

	describe('after all configuration has been done, flag setup complete', () => {

		it('configuration flag be false initially', async ()=> {
			var existingFlag = testSale.setupCompleteFlag();
			assert(!existingFlag, 'the setup complete flag is prematurely set');
		});

		it('updating the setup flag as a non-owner should fail', async ()=> {

			var txHash = await sale.setSetupCompleteFlagAs(web3.eth.accounts[1], testSale.address);
			assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');

			it('configuration flag shound not be set', async ()=> {
				var currentFlag = testSale.setupCompleteFlag();
				assert(!currentFlag, 'a non-owner was incorrectly able to set the setup flag');
			});

		});

		it('updating the setup flag as an owner should go through', async ()=> {

			var txHash = await sale.setSetupCompleteFlag(testSale.address);
			assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should have went through');

			it('configuration flag shound not be set', async ()=> {
				var currentFlag = testSale.setupCompleteFlag();
				assert(!currentFlag, 'a non-owner was incorrectly able to set the setup flag');
			});

		});

	});

	describe('conduct purchases during the sale', () => {

		it('should not allow anyone to purchase tokens', async ()=> {
			if(testSale.startBlock() > web3.eth.blockNumber){
				var txHash = await sale.purchaseTokens(testSale.address, web3.eth.accounts[11], Math.floor((Math.random() * 500) + 1));
				assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');
			}
		});

		it('should allow whitelisted users to purchase once the start block is hit', async ()=>{

			var startBlock = testSale.startBlock();
			var endBlock = testSale.endBlock();
			console.log('waiting for sale start block ...');
			while(web3.eth.blockNumber < startBlock){
			}

			for(var i=0; i < 100; i++){
				for(var j=10; j<web3.eth.accounts.length; j++){
					if(web3.eth.blockNumber >= startBlock){
						it('should allow whitelisted users to purchase tokens', async ()=> {
							var txHash = await sale.purchaseTokens(testSale.address, web3.eth.accounts[j], Math.floor((Math.random() * 500) + 1));
							assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should have went through');
						});
					}

					if(web3.eth.blockNumber >= endBlock){
						it('should not allow any users to purchase tokens after sale is ended', async ()=> {
							var txHash = await sale.purchaseTokens(testSale.address, web3.eth.accounts[j], Math.floor((Math.random() * 500) + 1));
							assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');
						});
					}
				}
			}

		});

		// TODO: more volumous purchase tests

	});

	describe('lock unsold tokens after the sale', () => {

		it('should not allow anyone to lock unsold before the sale finishes', async ()=> {
			if(testSale.endBlock() > web3.eth.blockNumber){
				let wallet = testSale.wallet();
				let tokenAddress = await testSale.token();
				let token = await HumanStandardToken.at(tokenAddress);
				var previousBalance = token.balanceOf(wallet);

				var txHash = await sale.lockUnsoldTokens(web3.eth.accounts[0], testSale.address);
				assert(!web3.eth.getTransaction(txHash).blockNumber, 'this transaction should not have went through');

				it('should not have updated the token balance of the wallet address', async ()=> {
					var newBalance = token.balanceOf(wallet);
					assert(newBalance === previousBalance, 'tokens were erroneously locked')
				})
			}
		});

		it('should allow someone to unlock unsold tokens', async ()=> {

			var endBlock = testSale.endBlock();
			console.log('waiting for end block ...');
			while(web3.eth.blockNumber < endBlock){
			}

			it('should allow anyone to lock unsold after the sale finishes', async ()=> {
				let tokenAddress = await testSale.token();
				let token = await HumanStandardToken.at(tokenAddress);
				let amountToLock = token.balanceOf(testSale.address);
				var txHash = await sale.lockUnsoldTokens(web3.eth.accounts[7], testSale.address);
				assert(web3.eth.getTransaction(txHash).blockNumber > 0, 'this transaction should not have went through');

				it('should have updated the token balance of the wallet address', async ()=> {
					var newBalance = token.balanceOf(wallet);
					assert(newBalance = previousBalance + amountToLock, 'tokens were erroneously locked');
				});

			});

		});

	});

});

describe('sale unit tests', () => {

	describe('constructor', () => {

		var testSale;
		var owner = web3.eth.accounts[0];
		var freezeBlock = 4500082;
		var startBlock = freezeBlock + 10000;
		var endblock = startBlock + 170000;

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
				testSale = await sale.createSale(owner, freezeBlock, startBlock, endblock);
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
				assert(endblock === JSON.parse(actualEndBlock), "endBlock not saved properly");
				assert(expectedTOTAL_SUPPLY === JSON.parse(actualTOTAL_SUPPLY), "total supply not saved properly");
				assert(expectedMAX_PRIVATE === JSON.parse(actualMAX_PRIVATE), "max private not saved properly");
				assert(expectedDECIMALS === JSON.parse(actualDECIMALS), "DECIMALS not saved properly");
				assert(expectedNAME === actualNAME, "name not saved properly");
				assert(expectedSYMBOL === actualSYMBOL, "symbol not saved properly");
				assert(expectedprice_inwei === JSON.parse(actualprice_inwei), "price in wei not saved properly");
				assert(expectedprivateAllocated === JSON.parse(actualprivateAllocated), "private allocated not set properly");
				assert(expectedSetupCompleteFlag === JSON.parse(actualSetupCompleteFlag), "setupcompleteflag block not saved properly");
				assert(expectedEmergencyFlag === JSON.parse(actualEmergencyFlag), "emergency flag not saved properly");
			}).timeout(300000);

			it('underlying token should have the correct parameters saved', async () => {
				let tokenAddress = await testSale.token();
	            let token = await HumanStandardToken.at(tokenAddress);
				const expectedVersion = 'H0.1';
				const expectedTotalSupply = expectedTOTAL_SUPPLY;
				const expectedBalanceOfSale = 1000000000000000000;
				const expectedSaleAddress = testSale.address;
				const expectedEndBlock = endblock;

				let actualName = token.name();
	            let actualDecimal = token.decimals();
	            let actualSymbol = token.symbol();
	            let actualVersion = token.version();
	            let actualTotalSupply = token.totalSupply();
	            let actualBalanceOfSale = token.balanceOf(testSale.address);
	            let actualSaleAddress = token.sale();
	            let actualEndBlock = token.endBlock();
				
				assert(expectedNAME === actualName, "name not saved properly");
				assert(expectedDECIMALS === JSON.parse(actualDecimal), "decimal not saved properly");
				assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
				assert(expectedVersion === actualVersion, "version not saved properly");
				assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "total supply not saved properly");
				assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
				assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
				assert(expectedEndBlock === JSON.parse(actualEndBlock), "end block not saved properly");

			}).timeout(300000);

		});

	});

});