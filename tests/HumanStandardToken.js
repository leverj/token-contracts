var token           = require('../lib/HumanStandardToken');
var assert          = require('assert');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('HumanStandardToken', () => {
    
	describe('HumanStandardToken deployment', ()  =>{
		it('Verifying that the HumanStandardToken can be initialized, and all initial variables are set', async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
            const name = contract.name();
            const symbol = contract.symbol();
            const decimals = contract.decimals();
            const transfersAllowed = contract.transfersAllowed();
            const balance  = contract.balanceOf(web3.eth.accounts[0]);
            const result = [await name, await symbol, await decimals, await transfersAllowed, await balance ];
            assert(name === 'ConsenSys', "Token Name not being set properly");
            assert(symbol === 'CS', "Token Symbol not being set properly");
            assert(JSON.parse(decimals) === 10, "Token Decimal not being set properly");
            assert(JSON.parse(transfersAllowed) === false, "transfer lock is not being set properly");
            assert(JSON.parse(balance) === 100, "Balances not being set properly");
		}).timeout(300000);
    });

    describe("HumanStandardToken transfer function check", () => {

        it('Verifying that the HumanStandardToken transfer function is working as intended', async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            let tx1 = await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[0]);
            let tx2 = await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
        }).timeout(300000);


        it('should allow the sale address to transfer even before the lock is removed', async ()=> {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
        }).timeout(300000);

        it('should prevent transfers from non-sale addresses before removing the transfer lock', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            await token.transferHumanStandardTokenAs(contract, web3.eth.accounts[1], web3.eth.accounts[0], 20);
            const balance2  = contract.balanceOf(web3.eth.accounts[0]);
            const balance3  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance2, await balance3 ];
            assert(JSON.parse(balance2) === 100, "Balances erroneously being transfered from account[0]");
            assert(JSON.parse(balance3) === 0, "Balances erroneously being transfered from account[1]");
        }).timeout(300000);

        it('remove transfer lock and now the transfers should go through', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
            let tx1 = await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 20);
            let tx2 = await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[0]);
            let tx3 = await token.transferHumanStandardTokenAs(contract, web3.eth.accounts[1], web3.eth.accounts[0], 10);
            const balance2  = contract.balanceOf(web3.eth.accounts[0]);
            const balance3  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance2, await balance3 ];
            assert(JSON.parse(balance2) === 90, "Balances not being transfered from account[0]");
            assert(JSON.parse(balance3) === 10, "Balances not being transfered from account[1]");
        }).timeout(300000);

    }).timeout(300000);

    describe("HumanStandardToken approve/allowance function checks", () =>{
        it("Verifying that the HumanStandardToken approve/allowance is working as intended", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            await token.approveHumanStandardToken(contract, web3.eth.accounts[2], 60);
            let amount = await contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
            assert(JSON.parse(amount) === 60, "Correct amount not being approved");
        }).timeout(300000);
    }).timeout(300000);

    describe("HumanStandardToken approve/transferFrom function checks", () => {
        it("Verifying that the HumanStandardToken approve/transferFrom functions are working properly", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[0]);
            await token.approveHumanStandardToken(contract, web3.eth.accounts[2], 60);
            await token.transferFromHumanStandardToken(contract, web3.eth.accounts[0], web3.eth.accounts[1], 60, web3.eth.accounts[2]);
            const postAmount = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
            const postBalance0 = contract.balanceOf(web3.eth.accounts[0]);
            const postBalance1 = contract.balanceOf(web3.eth.accounts[1]);
            const result = [ await postAmount, await postBalance0, await postBalance1 ];
            assert(JSON.parse(postAmount) === 0);
            assert(JSON.parse(postBalance0) === 40);
            assert(JSON.parse(postBalance1) === 60);
        }).timeout(300000);
    }).timeout(300000);

    describe("HumanStandardToken incorrect transfer function call", () => {
        it("Checking to see what happens when incorrect values are submitted to the HumanStandardToken transfer function", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[0]);
            const tokenT1 = token.transferHumanStandardToken(contract, web3.eth.accounts[1], 110);
            const tokenT2 = token.transferHumanStandardToken(contract, web3.eth.accounts[2], -10);
            const tokenT3 = token.transferHumanStandardToken(contract, web3.eth.accounts[3], -0);
            const resultT = [ await tokenT1, await tokenT2, await tokenT3 ];
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const balance2  = contract.balanceOf(web3.eth.accounts[2]);
            const balance3  = contract.balanceOf(web3.eth.accounts[3]);
            const resultB = [ await balance0, await balance1, await balance2, await balance3 ];
            assert(JSON.parse(balance0) === 100, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 0, "Balances not being transfered properly from account[1]");
            assert(JSON.parse(balance2) === 0, "Balances not being transfered properly from account[2]");
            assert(JSON.parse(balance3) === 0, "Balances not being transfered properly from account[3]");
        }).timeout(300000);
    }).timeout(300000);

    describe("HumanStandardToken incorrect approve/allowance function call", () => {
        it("Checking to see what happens when incorrect values are submitted to the HumanStandardToken transfer function", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            const approve2 = token.approveHumanStandardToken(contract, web3.eth.accounts[2], 110);
            const approve3 = token.approveHumanStandardToken(contract, web3.eth.accounts[3], -10);
            const approve4 = token.approveHumanStandardToken(contract, web3.eth.accounts[4], -0);
            var resultA = [ await approve2, await approve3, await approve4 ];

            const allowance2 = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
            const allowance3 = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[3]);
            const allowance4 = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[4]);

            const resultAl = [ await allowance2, await allowance3, await allowance4 ];
            assert(JSON.parse(allowance2) === 0, "Balances not being transfered properly from account[2]");
            assert(JSON.parse(allowance3) === 0, "Balances not being transfered properly from account[3]");
            assert(JSON.parse(allowance4) === 0, "Balances not being transfered properly from account[4]");
        }).timeout(300000);
    }).timeout(300000);
  
    describe('ensure transfer lock related authorization logic is working', ()=> {

        it('should reject removing transfer lock if the sender is not the sale contract', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',web3.eth.accounts[0]);
            await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[1]);
            const transfersAllowed = contract.transfersAllowed(); 
            var results = [await transfersAllowed];
            assert(JSON.parse(transfersAllowed) === false, "non sale address was able to change the transfer allowed flag"); 
        }).timeout(300000);

    }).timeout(300000);


    describe('reversal logic is working', async ()=> {

        it('should allow sale admins to reverse a tokenholders tokens', async ()=>{
                let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
                await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
                const balance0  = contract.balanceOf(web3.eth.accounts[0]);
                const balance1  = contract.balanceOf(web3.eth.accounts[1]);
                const resultB = [ await balance0, await balance1 ];
                assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
                assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
                await token.reversePurchaseHumanStandardToken(contract, web3.eth.accounts[0], web3.eth.accounts[1]);
                const balance2  = contract.balanceOf(web3.eth.accounts[0]);
                const balance3  = contract.balanceOf(web3.eth.accounts[1]);
                const resultC = [ await balance2, await balance3 ];
                assert(JSON.parse(balance2) === 100, "Balances not being reversed properly from account[1]");
                assert(JSON.parse(balance3) === 0, "Balances not being reversed properly from account[1]");
        }).timeout(300000);

        it('it should not error out if the tokenholder happens to have 0', async ()=>{
                let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
                await token.reversePurchaseHumanStandardToken(contract, web3.eth.accounts[0], web3.eth.accounts[1]);
                const balance2  = contract.balanceOf(web3.eth.accounts[0]);
                const balance3  = contract.balanceOf(web3.eth.accounts[1]);
                const resultB = [ await balance2, await balance3 ];
                assert(JSON.parse(balance2) === 100, "Balances not being reversed properly from account[1]");
                assert(JSON.parse(balance3) === 0, "Balances not being reversed properly from account[1]");
        }).timeout(300000);

    }).timeout(300000);


    describe('ensure reversal related authorization logic is working', async ()=> {

        it('should not allow a reversal for sale owner, after lock removal', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
            await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[0]);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
            await token.reversePurchaseHumanStandardToken(contract, web3.eth.accounts[0], web3.eth.accounts[1]);
            const balance2  = contract.balanceOf(web3.eth.accounts[0]);
            const balance3  = contract.balanceOf(web3.eth.accounts[1]);
            const resultC = [ await balance2, await balance3 ];
            assert(JSON.parse(balance2) === 60, "Balances erroneously being reversed properly from account[1]");
            assert(JSON.parse(balance3) === 40, "Balances erroneously being reversed properly from account[1]");
        }).timeout(300000);


        it('should allow a reversal for sale owner, before lock removal', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
            await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
            await token.reversePurchaseHumanStandardToken(contract, web3.eth.accounts[0], web3.eth.accounts[1]);
            const balance2  = contract.balanceOf(web3.eth.accounts[0]);
            const balance3  = contract.balanceOf(web3.eth.accounts[1]);
            const resultC = [ await balance2, await balance3 ];
            assert(JSON.parse(balance2) === 100, "Balances not being reversed properly from account[1]");
            assert(JSON.parse(balance3) === 0, "Balances not being reversed properly from account[1]");
        }).timeout(300000);

        it('should not allow a reversal for non-owner, after lock removal', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
            await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            await token.removeTransferLockHumanStandardToken(contract, web3.eth.accounts[0]);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
            await token.reversePurchaseHumanStandardToken(contract, web3.eth.accounts[1], web3.eth.accounts[1]);
            const balance2  = contract.balanceOf(web3.eth.accounts[0]);
            const balance3  = contract.balanceOf(web3.eth.accounts[1]);
            const resultC = [ await balance2, await balance3 ];
            assert(JSON.parse(balance2) === 60, "Balances erroneously being reversed properly from account[1]");
            assert(JSON.parse(balance3) === 40, "Balances erroneously being reversed properly from account[1]");
        }).timeout(300000);

        it('should not allow a reversal for non-owner, before lock removal', async ()=>{
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS', web3.eth.accounts[0]);
            await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
            await token.reversePurchaseHumanStandardToken(contract, web3.eth.accounts[1], web3.eth.accounts[1]);
            const balance2  = contract.balanceOf(web3.eth.accounts[0]);
            const balance3  = contract.balanceOf(web3.eth.accounts[1]);
            const resultC = [ await balance2, await balance3 ];
            assert(JSON.parse(balance2) === 60, "Balances erroneously being reversed properly from account[1]");
            assert(JSON.parse(balance3) === 40, "Balances erroneously being reversed properly from account[1]");
        }).timeout(300000);

    }).timeout(300000);

});
