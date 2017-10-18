var token           = require('../lib/HumanStandardToken');
var assert          = require('assert');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('HumanStandardToken', () => {
	describe('HumanStandardToken deployment', ()  =>{
		it('Verifying that the HumanStandardToken can be initialized, and all initial variables are set', async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            const name = contract.name();
            const symbol = contract.symbol();
            const decimals = contract.decimals();
            const endBlock = contract.endBlock();
            const balance  = contract.balanceOf(web3.eth.accounts[0]);
            const result = [await name, await symbol, await decimals, await endBlock, await balance ];
            assert(name === 'ConsenSys', "Token Name not being set properly");
            assert(symbol === 'CS', "Token Symbol not being set properly");
            assert(JSON.parse(decimals) === 10, "Token Decimal not being set properly");
            assert(JSON.parse(endBlock) === 20, "endBlock not being set properly");
            assert(JSON.parse(balance) === 100, "Balances not being set properly");
		}).timeout(300000);
    });

    describe("HumanStandardToken transfer function check", () => {
        it('Verifying that the HumanStandardToken transfer function is working as intended', async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            await token.transferHumanStandardToken(contract, web3.eth.accounts[1], 40);
            const balance0  = contract.balanceOf(web3.eth.accounts[0]);
            const balance1  = contract.balanceOf(web3.eth.accounts[1]);
            const resultB = [ await balance0, await balance1 ];
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
        }).timeout(300000);
    });

    describe("HumanStandardToken approve/allowance function checks", () =>{
        it("Verifying that the HumanStandardToken approve/allowance is working as intended", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            await token.approveHumanStandardToken(contract, web3.eth.accounts[2], 60);
            let amount = await contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
            assert(JSON.parse(amount) === 60, "Correct amount not being approved");
        }).timeout(300000);
    });

    describe("HumanStandardToken approve/transferFrom function checks", () => {
        it("Verifying that the HumanStandardToken approve/transferFrom functions are working properly", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
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
    });

    describe("HumanStandardToken incorrect transfer function call", () => {
        it("Checking to see what happens when incorrect values are submitted to the HumanStandardToken transfer function", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
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
    });

    /////NEED TO TALK ABOUT THIS, NOT CHECKING WHETHER OR NOT THE APPROVER HAS ANY FUNDS
    // describe("HumanStandardToken incorrect approve/allowance function call", () => {
    //     it("Checking to see what happens when incorrect values are submitted to the HumanStandardToken transfer function", async () => {
    //         let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
    //         const approve2 = token.approveHumanStandardToken(contract, web3.eth.accounts[2], 110);
    //         const approve3 = token.approveHumanStandardToken(contract, web3.eth.accounts[3], -10);
    //         const approve4 = token.approveHumanStandardToken(contract, web3.eth.accounts[4], -0);
    //         var resultA = [ await approve2, await approve3, await approve4 ];

    //         const allowance2 = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
    //         const allowance3 = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[3]);
    //         const allowance4 = contract.allowance(web3.eth.accounts[0], web3.eth.accounts[4]);

    //         const resultAl = [ await allowance2, await allowance3, await allowance4 ];
    //         console.log("a2: ", allowance2, " a3: ", allowance3, " a4: ", allowance4);
    //         // assert(JSON.parse(balance0) === 100, "Balances not being transfered properly from account[0]");
    //         // assert(JSON.parse(balance1) === 0, "Balances not being transfered properly from account[1]");
    //         // assert(JSON.parse(balance2) === 0, "Balances not being transfered properly from account[2]");
    //         // assert(JSON.parse(balance3) === 0, "Balances not being transfered properly from account[3]");
    //     }).timeout(300000);
    // });
})
