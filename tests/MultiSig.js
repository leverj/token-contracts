var multisig            = require('../lib/MultiSig');
var utils               = require('../lib/utils');
var assert              = require('assert');
var Web3                = require('web3');
var web3                = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


describe('MultiSig', () => {
	describe('MultiSig deployment', () => {
		it('Verifying that the Disbursement contract can be initialized, and all initial variables are set', async () => {
            var owners = [ web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3] ];

            let contract = await multisig.deployMultisig(owners, 2);
            var required = await contract.required();

            assert(JSON.parse(required) === 2, "Required variable not being set properly");
            assert(contract.getOwners().length === 3, "Owners not being set properly");
		}).timeout(300000);
    });
	describe('MultiSig addOwner/confirmTransaction', () => {
		it('Verifying that the addOwner function can be initialized, and then confirmed', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.addOwnerMultiSig(contract, web3.eth.accounts[4]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            const length1 = await contract.getOwners().length;

            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const length2 = await contract.getOwners().length;
            assert(length1 === 4, "Number of owners changing before it should");
            assert(length2 === 5, "Number of owners after 3 confirmations not updating properly");
		}).timeout(300000);
    });
})