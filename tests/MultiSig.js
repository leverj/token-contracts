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
	describe('MultiSig removeOwner/confirmTransaction', () => {
		it('Verifying that the removeOwner function can be initialized, and then confirmed', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.removeOwnerMultiSig(contract, web3.eth.accounts[2]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            const length1 = contract.getOwners().length;
            const required1 = contract.required();
            const result1 = [ await length1, await required1 ];
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const length2 = contract.getOwners().length;
            const required2 = contract.required();
            const result2 = [ await length2, await required2 ];
            assert(length1 === 3, "Number of owners changing before it should");
            assert(JSON.parse(required1) === 3, "Number of required changing before it should");
            assert(length2 === 2, "Number of owners after 3 confirmations not updating properly");
            assert(JSON.parse(required2) === 2, "Number of required not updating if number of owners decreses below it");
		}).timeout(300000);
    });
    describe('MultiSig replaceOwner/confirmTransaction', () => {
		it('Verifying that the replaceOwner function can be initialized, and then confirmed', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.replaceOwnerMultiSig(contract, web3.eth.accounts[2], web3.eth.accounts[3]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            const owner1 = await contract.getOwners();
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const owner2 = await contract.getOwners();
            assert(owner1[2] === web3.eth.accounts[2], "Owner not being set properly");
            assert(owner2[2] === web3.eth.accounts[3], "Owner not being replaced properly");
		}).timeout(300000);
    });

	describe('MultiSig addOwner/confirmTransaction (invalid inputs)', () => {
		it('Verifying that the addOwner function cannot be initialized', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.addOwnerMultiSig(contract, web3.eth.accounts[3]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const length1 = await contract.getOwners().length;
            assert(JSON.parse(length1) === 4, "Number of accounts is increasing when the transaction should have failed");
		}).timeout(300000);
    });
    describe('MultiSig addOwner/confirmTransaction (invalid inputs)', () => {
		it('Verifying that the addOwner function cannot be initialized', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.addOwnerMultiSig(contract, '');
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const length1 = await contract.getOwners().length;
            assert(JSON.parse(length1) === 4, "Number of accounts is increasing when the transaction should have failed");
		}).timeout(300000);
    });
	describe('MultiSig removeOwner/confirmTransaction (invalid inputs)', () => {
		it('Verifying that the removeOwner function cannot be initialized', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.removeOwnerMultiSig(contract, web3.eth.accounts[3]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const length = contract.getOwners().length;
            const required = contract.required();
            const result = [ await length, await required ];
            assert(length === 3, "Number of owners changing when it shouldnt be");
            assert(JSON.parse(required) === 3, "Number of required changing when it shouldnt be");
		}).timeout(300000);
    });
    describe('MultiSig replaceOwner/confirmTransaction (invalid inputs)', () => {
		it('Verifying that the replaceOwner function cannot be initialized', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.replaceOwnerMultiSig(contract, web3.eth.accounts[2], web3.eth.accounts[1]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const owner = await contract.getOwners();
            assert(owner[0] === web3.eth.accounts[0] && 
                    owner[1] === web3.eth.accounts[1] &&
                    owner[2] === web3.eth.accounts[2], "Owner is being reset when it shouldnt be");
		}).timeout(300000);
    });
    describe('MultiSig replaceOwner/confirmTransaction (invalid inputs)', () => {
		it('Verifying that the replaceOwner function cannot be initialized', async () => {
            var owners = [ web3.eth.accounts[0], web3.eth.accounts[1], web3.eth.accounts[2] ];
            let contract = await multisig.deployMultisig(owners, 3);
            const transactionId = await multisig.replaceOwnerMultiSig(contract, web3.eth.accounts[4], web3.eth.accounts[3]);
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[1], JSON.parse(transactionId));
            await multisig.confirmTxMultiSig(contract, web3.eth.accounts[2], JSON.parse(transactionId));
            const owner = await contract.getOwners();
            assert(owner[0] === web3.eth.accounts[0] && 
                    owner[1] === web3.eth.accounts[1] &&
                    owner[2] === web3.eth.accounts[2], "Owner is being reset when it shouldnt be");
		}).timeout(300000);
    });
})