var sale 	        			= require('../lib/Sale');
var HumanStandardToken 	        = require('../lib/HumanStandardToken');
var assert          			= require('assert');
var Web3            			= require('web3');
var web3            			= new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('Sale tests', () => {
	describe('Sale very simple happy path', ()  =>{
		it('Verifying that the sale can be initialized, and all initial variables are set', async () => {

			var owner = web3.eth.accounts[0];
			var supply = 1000000000;
			var name = "leverj";
			var decimals = 9;
			var symbol = "LEV";
			var freezeBlock = web3.eth.blockNumber + 10;
			var startBlock = freezeBlock + 1;
			var endblock = startBlock + 1000000000000000;
			var price = 333333333333333; //price in wei

            let testSale = await sale.createSale(owner, supply, name, decimals, symbol, freezeBlock, startBlock, endblock, price);
 
            const actualStartBlock = await testSale.startBlock();
            assert(startBlock === JSON.parse(actualStartBlock), "start block not saved properly");
            // TODO: check all remaining parameters

            let tokenAddress = await testSale.token();
            let token = await HumanStandardToken.at(tokenAddress);
            let saleBalance = await token.balanceOf(testSale.address);
            assert(supply === JSON.parse(saleBalance), "sale contracts initial balance is NOT  token supply");

            
            let arr1 = [];
            let t1 = sale.distributeFoundersTokens(testSale.address, arr1, arr1, arr1, arr1);
            let t2 = sale.distributeLiquidityTokens(testSale.address, arr1, arr1);
            let t3 = sale.distributePartnersTokens(testSale.address, arr1, arr1, arr1, arr1);
            let t4 = sale.distributePresaleTokens(testSale.address, arr1, arr1, arr1, arr1);
            let t5 = sale.configureWallet(testSale.address, web3.eth.accounts[2]); 
            let results = [await t1, await t2, await t3, await t4, await t5];

            let actualWallet = testSale.wallet();
            assert(actualWallet === web3.eth.accounts[2], "wallet configuration is not correct");

            // TODO: replace this with an event watcher :)
            while(web3.eth.blockNumber < startBlock){}

            let t6 = await sale.purchase(testSale.address, web3.eth.accounts[3], 333333333333333);
            let newtokenBalance = await token.balanceOf(web3.eth.accounts[3]);
            assert(JSON.parse(newtokenBalance) === 1, "incorrect amount of token balance for purchaser");
            
            /* not yet ...
            const amountToTransfer = 50000;
            await HumanStandardToken.transferHumanStandardToken(token, web3.eth.accounts[1], amountToTransfer);
            let anotherBalance = await token.balanceOf(web3.eth.accounts[1]);
            console.log("token address: " + token.address);
            saleBalance = await token.balanceOf(testSale.address);
            console.log("new balance: " + JSON.parse(saleBalance));
            assert(JSON.parse(anotherBalance) === amountToTransfer, "transferred amount didn't show up on recipients balance");
            assert(JSON.parse(saleBalance) === (supply - amountToTransfe), "transferred amount didn't deduct from sale contracts balance");
            */

		}).timeout(300000);
    });

})
