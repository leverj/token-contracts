var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('sale unit tests', () => {

	describe('constructor', () => {

		var testSale;
		var owner = web3.eth.accounts[0];
		var freezeBlock = 4500082;
		var startBlock = freezeBlock + 10000;
		var endblock = startBlock + 170000;

		describe('creation of sale contract with valid parameters', () => {

            const expectedTOTAL_SUPPLY = 1000000000;
    		const expectedMAX_PRIVATE = 750000000;
		    const expectedMULTIPLIER = 9;
		    const expectedNAME = "Leverj";
		    const expectedSYMBOL = "LEV";
		    const expectedprice_inwei = 333333333333333;
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
				let actualMULTIPLIER =  testSale.MULTIPLIER();
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
				assert(expectedMULTIPLIER === JSON.parse(actualMULTIPLIER), "multiplier not saved properly");
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
				const expectedTotalSupply = expectedTOTAL_SUPPLY*(Math.pow(10, expectedMULTIPLIER));
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
				assert(expectedMULTIPLIER === JSON.parse(actualDecimal), "decimal not saved properly");
				assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
				assert(expectedVersion === actualVersion, "version not saved properly");
				assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "total supply not saved properly");
				assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
				assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
				assert(expectedEndBlock === JSON.parse(actualEndBlock), "end block not saved properly");

			}).timeout(300000);

		});

		/* remaining describes:
		- create with owner=0
		- create with owner invalid
		- create with freezeBlock=0
		- create with freezeblock < block.number
		- create with freezeblock > startblock
		- create with freezeblock > endblock
		- create with freezeblock = startblock
		- create with freezeblock = endblock
		- create with underflow freezeblock
		- create with overflow freezeblock
		- create with low freezeblock
		- create with high freezeblock
		- create with startBlock=0
		- create with startblock < block.number
		- create with startblock > endblock
		- create with startblock = endblock
		- create with negative startblock
		- create with underflow startblock
		- create with overflow startblock
		- create with low startblock
		- create with high startblock
		- create with endBlock=0
		- create with endblock < block.number
		- create with underflow startblock
		- create with overflow startblock
		- create with low endblock
		- create with high endblock
		- create with negative endblock
		*/

	});

});

describe('sale end-to-end test', () => {

	var testSale;
	var owner = web3.eth.accounts[0];
	var freezeBlock = 4500082;
	var startBlock = freezeBlock + 10000;
	var endblock = startBlock + 170000;

	//create
	describe('creation of sale contract with real LEV parameters', () => {

        const expectedTOTAL_SUPPLY = 1000000000;
		const expectedMAX_PRIVATE = 750000000;
	    const expectedMULTIPLIER = 9;
	    const expectedNAME = "Leverj";
	    const expectedSYMBOL = "LEV";
	    const expectedprice_inwei = 333333333333333;
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
			let actualMULTIPLIER =  testSale.MULTIPLIER();
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
			assert(expectedMULTIPLIER === JSON.parse(actualMULTIPLIER), "multiplier not saved properly");
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
			const expectedTotalSupply = expectedTOTAL_SUPPLY*(Math.pow(10, expectedMULTIPLIER));
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
			assert(expectedMULTIPLIER === JSON.parse(actualDecimal), "decimal not saved properly");
			assert(expectedSYMBOL === actualSymbol, "symbol not saved properly");
			assert(expectedVersion === actualVersion, "version not saved properly");
			assert(expectedTotalSupply === JSON.parse(actualTotalSupply), "total supply not saved properly");
			assert(expectedBalanceOfSale === JSON.parse(actualBalanceOfSale), "balance of sale not set properly");
			assert(expectedSaleAddress === actualSaleAddress, "sale address not saved properly");
			assert(expectedEndBlock === JSON.parse(actualEndBlock), "end block not saved properly");

		}).timeout(300000);

	});

	// distribute
	describe('distribute private sale tokens', () => {
		const beneficiaries = [web3.eth.accounts[18], web3.eth.accounts[19]];
		const tokens = [5000000000, 400000000];
		const timelocks = [1514678400, 1520035200, 1540035200];
		const breakdown = [10, 30, 30];

		it('filters address array should be populated', async () => {
			await sale.distributeTimeLockedTokens(testSale.address, beneficiaries, tokens, timelocks, breakdown);
			const expectedCount = timelocks.length;
			let filter = testSale.filters(0);
			console.log('resulting filter[0] value' + filter);
			assert(expectedCount === filters.length, 'filter addresses were not populated correctly');
		}).timeout(300000);


	});

/*
	// setwallet
	describe('distribute private sale tokens', () => {

		await sale.distributeTimeLockedTokens(testSale.address, [web3.eth.accounts[18], web3.eth.accounts[19]], [5000000000, 400000000], [1514678400, 1520035200, 1540035200], [10, 30,30]);

	})

	//mark setup complete
	describe('distribute private sale tokens', () => {

		await sale.distributeTimeLockedTokens(testSale.address, [web3.eth.accounts[18], web3.eth.accounts[19]], [5000000000, 400000000], [1514678400, 1520035200, 1540035200], [10, 30,30]);

	})

	// add whitelists
	describe('distribute private sale tokens', () => {

		await sale.distributeTimeLockedTokens(testSale.address, [web3.eth.accounts[18], web3.eth.accounts[19]], [5000000000, 400000000], [1514678400, 1520035200, 1540035200], [10, 30,30]);

	})

	// lots of purchases

	describe('distribute private sale tokens', () => {

		await sale.distributeTimeLockedTokens(testSale.address, [web3.eth.accounts[18], web3.eth.accounts[19]], [5000000000, 400000000], [1514678400, 1520035200, 1540035200], [10, 30,30]);

	})

	// lock unsold
	describe('distribute private sale tokens', () => {

		await sale.distributeTimeLockedTokens(testSale.address, [web3.eth.accounts[18], web3.eth.accounts[19]], [5000000000, 400000000], [1514678400, 1520035200, 1540035200], [10, 30,30]);

	})

*/

});