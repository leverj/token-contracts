var { contracts }   = require('../dist/contracts.json');
var utils           = require('./utils');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployMultisig: function (owners, required){
        var c = contractSplitter();
        var MultiSigWallet = c.MultiSigWallet;
        var factory = web3.eth.contract(JSON.parse(MultiSigWallet.abi));     
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + MultiSigWallet.bin, gas: 4500000 };   
        return new Promise((resolve, reject) => {
            factory.new(owners, required, options, (err, contract) => {
                if (!err) {
                    if (contract.address) resolve(contract);
                }
                else reject(err);
            });
        }) 
    },
    addOwnerMultiSig: function (contract, newOwner){
        var options = { from: web3.eth.accounts[0], gas: 2000000 }
        return new Promise((resolve, reject) => {
            const ownerData = contract.addOwner.getData(web3.eth.accounts[4]);
            var event = contract.Confirmation();
            event.watch(function(err, result){
                if(err) reject(err)
                else resolve(result.args.transactionId);
                event.stopWatching();
            })
            contract.submitTransaction(contract.address, 0, ownerData, options, async (err, txHash) => {
                if(!err) await utils.onConfirmation(txHash);
                else reject(err)
            })
        })
    },
    confirmTxMultiSig: function(contract, owner, txData){
        var options = { from: owner, gas: 2000000 };
        return new Promise((resolve, reject) => {
            contract.confirmTransaction(txData, options, async (err, txHash) => {
                if(!err) {
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    }
}


function contractSplitter(){
    var c = {};
    Object.keys(contracts).forEach((contract) => {
        if (contract.split(':').length > 1)
            c[contract.split(':')[1]] = contracts[contract]
    });
    return c;
}