var disbursement              = require('../lib/Disbursement');
var HumanStandardToken        = require('../lib/HumanStandardToken');
var token                     = require('../lib/Token');
var assert                    = require('assert');
var Web3                      = require('web3');
var web3                      = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


describe('Disbursement', () => {
	describe('Disbursement deployment', () => {
		it('Verifying that the Disbursement contract can be initialized, and all initial variables are set', async () => {
                  let contract = await disbursement.deployDisbursement(web3.eth.accounts[1], 100, 1508347537);

                  const receiver = contract.receiver();
                  const period = contract.disbursementPeriod();
                  const start = contract.startDate();
                  const result = [await receiver, await period, await start ];

                  assert(receiver === web3.eth.accounts[1], "Disbursement receiver not being set properly");
                  assert(JSON.parse(period) === 100, "Disbursement disbursementPeriod not being set properly");
                  assert(JSON.parse(start) === 1508347537, "Disbursement disbursementPeriod not being set properly");
		}).timeout(300000);
      });
      describe('Disbursement Token setup', () => {
            it('Making sure that the token sale contract can be linked to this contract', async () => {
                  const disbursementContract = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const humanContract = await HumanStandardToken.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);

                  let transfer = HumanStandardToken.transferHumanStandardToken(humanContract, disbursementContract.address, 40);
                  let setup = disbursement.setupDisbursement(disbursementContract, humanContract.address, web3.eth.accounts[0]);
                  const result = [ await transfer, await setup ];

                  let maxwithdraw = disbursementContract.calcMaxWithdraw();
                  let balance  = humanContract.balanceOf(disbursementContract.address);
                  const result1 = [ await maxwithdraw, await balance ];

                  assert(JSON.parse(maxwithdraw) === 100);
                  assert(JSON.parse(balance) === 40);
            }).timeout(300000);
      });
      describe('Disbursement withdraw function', () => {
            it('Making sure that the Disbursement contract withdraw function is working correctly', async () => {
                  const disbursementContract = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const humanContract = await HumanStandardToken.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);

                  let transfer = HumanStandardToken.transferHumanStandardToken(humanContract, disbursementContract.address, 40);
                  let setup = disbursement.setupDisbursement(disbursementContract, humanContract.address, web3.eth.accounts[0]);
                  const result = [ await transfer, await setup ];
                  await disbursement.withdrawDisbursement(disbursementContract, web3.eth.accounts[2], web3.eth.accounts[1], 30);
                  
                  let balance0  = humanContract.balanceOf(web3.eth.accounts[0]);
                  let balance1  = humanContract.balanceOf(web3.eth.accounts[1]);
                  let balance2  = humanContract.balanceOf(web3.eth.accounts[2]);
                  let balanceC  = humanContract.balanceOf(disbursementContract.address);
                  let withdrawn = disbursementContract.withdrawnTokens();
                  const balances = [ await balance0, await balance1, await balanceC, await withdrawn ];

                  assert(JSON.parse(balance0) === 60, "Account 0 not transfering funds properly");
                  assert(JSON.parse(balance1) === 0, "Account is being sent funds when it shouldnt be");
                  assert(JSON.parse(balance2) === 30, "Account is not withdrawing tokens correctly");
                  assert(JSON.parse(withdrawn) === 30, "Only withdrawing once to the correct account");
                  assert(JSON.parse(balanceC) === 10, "Contract is not disbursing funds correctly");
            }).timeout(300000);
      });

      describe('Disbursement setup function (invalid params)', () => {
            it('Ensuring the onlyOwner modifier is working along with an address being passed in', async () => {
                  const disbursementContract = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const disbursementContract2 = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const humanContract = await HumanStandardToken.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);

                  await disbursement.setupDisbursement(disbursementContract, humanContract.address, web3.eth.accounts[1]);
                  const tokenAddr1 = await disbursementContract.token();

                  await disbursement.setupDisbursement(disbursementContract2, '', web3.eth.accounts[0]);
                  const tokenAddr2 = await disbursementContract.token();

                  assert('0x0000000000000000000000000000000000000000' === tokenAddr1, "Token address is being set when it should not be")
                  assert('0x0000000000000000000000000000000000000000' === tokenAddr2, "Token address is being set when it should not be")                  
            }).timeout(300000);
      });

      describe('Disbursement withdraw function (invalid params)', () => {
            it('Ensuring the modifiers are working', async () => {
                  const disbursementContract = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const disbursementContract2 = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const disbursementContract3 = await disbursement.deployDisbursement(web3.eth.accounts[1], 1000, 1508347537);
                  const humanContract = await HumanStandardToken.deployHumanStandardToken(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20);

                  //Checking the isSetup modifier
                  let withdraw = disbursement.withdrawDisbursement(disbursementContract, web3.eth.accounts[2], web3.eth.accounts[1], 30);                  

                  //Checking the isReceiver modifier
                  let transfer = HumanStandardToken.transferHumanStandardToken(humanContract, disbursementContract2.address, 40);
                  let setup = disbursement.setupDisbursement(disbursementContract2, humanContract.address, web3.eth.accounts[0]);
                  const result1 = [ await transfer, await setup, await withdraw ];
                  await disbursement.withdrawDisbursement(disbursementContract2, web3.eth.accounts[2], web3.eth.accounts[0], 30);
                  
                  const withdrawn1 = disbursementContract.withdrawnTokens();
                  const withdrawn2 = disbursementContract2.withdrawnTokens();
                  const result2 = [ await withdrawn1, await withdrawn2 ];
                  
                  assert(JSON.parse(withdrawn1) === 0, "isSetup modifier not working properly");
                  assert(JSON.parse(withdrawn2) === 0, "isReceiver modifier not working properly");                  
            }).timeout(300000);
      });
});