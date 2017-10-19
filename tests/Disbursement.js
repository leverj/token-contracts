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
                  await HumanStandardToken.transferHumanStandardToken(humanContract, disbursementContract.address, 40);
                  const balance1  = await humanContract.balanceOf(disbursementContract.address);
                  assert(JSON.parse(balance1) === 40);
                  let setup = await disbursement.setupDisbursement(disbursementContract, humanContract.address);
                  let maxwithdraw = await disbursementContract.calcMaxWithdraw();
            }).timeout(300000);
      });
});