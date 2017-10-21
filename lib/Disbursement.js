var { contracts }   = require('../dist/contracts.json');
var utils           = require('./utils');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployDisbursement: function (receiver, period, start){
        var c = contractSplitter();
        var Disbursement = c.Disbursement;
        var factory = web3.eth.contract(JSON.parse(Disbursement.abi));     
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + Disbursement.bin, gas: 2000000 };   
        return new Promise((resolve, reject) => {
            factory.new(receiver, period, start, options, (err, contract) => {
                if (!err) {
                    if (contract.address) resolve(contract);
                }
                else reject(err);
            });
        }) 
    },
    setupDisbursement: function(contract, tokenContract, accountFrom){
        return new Promise((resolve, reject) => {
            var options = { from: accountFrom, gas: 2000000 };
            contract.setup(tokenContract, options, async (err, txHash) => {
                if(!err) {
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    withdrawDisbursement: function(contract, accountTo, accountFrom, amount){
        return new Promise((resolve, reject) => {
            var options = { from: accountFrom, gas: 3000000 };
            contract.withdraw(accountTo, amount, options, async (err, txHash) => {
                if(!err){
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