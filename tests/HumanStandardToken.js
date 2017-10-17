//const HumanStandardToken = artifacts.require("../contracts/HumanStandardToken");
var token           = require('../lib/HumanStandardToken');
var assert          = require('assert');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

describe('HumanStandardToken', function () {
	describe('HumanStandardToken deployment', function () {
		it('Verifying that the HumanStandardToken can be initialized, and all initial variables are set', async () => {
            let contract = await token.deployHumanStandardToken();
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
            let deploy = await token.deployHumanStandardToken();
            let transfer = await token.transferHumanStandardToken(deploy);
            let balance0  = await deploy.balanceOf(web3.eth.accounts[0]);
            let balance1  = await deploy.balanceOf(web3.eth.accounts[1]);
            assert(JSON.parse(balance0) === 60, "Balances not being transfered properly from account[0]");
            assert(JSON.parse(balance1) === 40, "Balances not being transfered properly from account[1]");
        }).timeout(300000)
    })

    // describe("HumanStandardToken approve/allowance function check", function(){
    //     it("Verifying that the HumanStandardToken approve/allowance is working as intended", async () => {
    //         let contract = await token.deployHumanStandardToken();

    //     })
    // })
})


//contract('HumanStandardToken', function(accounts) {

    // it("Verifying the approve/allowance from function works correct", async () => {
    //     let contract = await HumanStandardToken.new(100,'ConsenSys',10,'CS','0x5b1869d9a4c187f2eaa108f3062412ecf0526b24',20);
    //     let approve = await contract.approve(accounts[2], 60);
    //     let amount = await contract.allowance(accounts[0], accounts[2]);
    //     assert(JSON.parse(amount) === 60);
    // })

    // it("Verifying the approve from/ transfer from function works correctly", async () => {
    //     let contract = await HumanStandardToken.new(100,'ConsenSys',10,'CS','0x5b1869d9a4c187f2eaa108f3062412ecf0526b24',20);
    //     let approve = await contract.approve(accounts[2], 60);
    //     let transferFrom = await contract.transferFrom(accounts[0], accounts[1], 60,{ from: accounts[2] });
    //     let postAmount = await contract.allowance(accounts[0], accounts[2]);
    //     let postBalance1 = await contract.balanceOf(accounts[1]);
    //     let postBalance0 = await contract.balanceOf(accounts[0]);
    //     assert(JSON.parse(postAmount) === 0);
    //     assert(JSON.parse(postBalance1) === 60);
    //     assert(JSON.parse(postBalance0) === 40)
    // })


    // it("Checking initial amount uint256 against any size number", async () => {
    //     let contract = await HumanStandardToken.new(-10,'ConsenSys',10,'CS','0x5b1869d9a4c187f2eaa108f3062412ecf0526b24',20);
    //     let balance  = await contract.balanceOf(accounts[0]);
    //     console.log(balance)
    //     //assert(JSON.parse(balance) === 100000000000000000000000000000000000000000000000000000000000000000000000000000, "Balances not being set properly");        
    // })
//})
