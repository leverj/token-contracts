//const HumanStandardToken = artifacts.require("../contracts/HumanStandardToken");
var token           = require('../lib/HumanStandardToken');
var assert          = require('assert');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('HumanStandardToken', function () {
	describe('HumanStandardToken deployment', function () {
		it('Verifying that the HumanStandardToken can be initialized, and all initial variables are set', async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            let name = await contract.name();
            let symbol = await contract.symbol();
            let decimals = await contract.decimals();
            let endBlock = await contract.endBlock();
            let balance  = await contract.balanceOf(web3.eth.accounts[0]);
            assert(name === 'ConsenSys', "Token Name not being set properly");
            assert(symbol === 'CS', "Token Symbol not being set properly");
            assert(JSON.parse(decimals) === 10, "Token Decimal not being set properly");
            assert(JSON.parse(endBlock) === 20, "endBlock not being set properly");
            assert(JSON.parse(balance) === 100, "Balances not being set properly");
		}).timeout(300000);
    });

    describe("HumanStandardToken transfer function check", function (){
        it('Verifying that the HumanStandardToken transfer function is working as intended', async () => {
            let deploy = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            let transfer = await token.transferHumanStandardToken(deploy, web3.eth.accounts[1], 40);
            let balance0  = await deploy.balanceOf(web3.eth.accounts[0]);
            let balance1  = await deploy.balanceOf(web3.eth.accounts[1]);
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
        }).timeout(300000);
    })

    describe("HumanStandardToken approve/allowance function checks", function(){
        it("Verifying that the HumanStandardToken approve/allowance is working as intended", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            let approve = await token.approveHumanStandardToken(contract, web3.eth.accounts[2], 60);
            let amount = await contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
            assert(JSON.parse(amount) === 60, "Correct amount not being approved");
        }).timeout(300000);
    })

    describe("HumanStandardToken approve/transferFrom function checks", function(){
        it("Verifying that the HumanStandardToken approve/transferFrom functions are working properly", async () => {
            let contract = await token.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);
            let approve = await token.approveHumanStandardToken(contract, web3.eth.accounts[2], 60);
            let transferFrom = await token.transferFromHumanStandardToken(contract, web3.eth.accounts[0], web3.eth.accounts[1], 60, web3.eth.accounts[2]);
            let postAmount = await contract.allowance(web3.eth.accounts[0], web3.eth.accounts[2]);
            let postBalance1 = await contract.balanceOf(web3.eth.accounts[1]);
            let postBalance0 = await contract.balanceOf(web3.eth.accounts[0]);
            assert(JSON.parse(postAmount) === 0);
            assert(JSON.parse(postBalance1) === 60);
            assert(JSON.parse(postBalance0) === 40)
        }).timeout(300000);
    })
})
