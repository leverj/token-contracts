var { contracts }   = require('../dist/combined.json');
var utils           = require('./utils');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployHumanStandardToken: function (amount, name, decimal, symbol, saleAddr){
        var c = contractSplitter();
        var HumanStandardToken = c.HumanStandardToken;
        var factory = web3.eth.contract(JSON.parse(HumanStandardToken.abi));     
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + HumanStandardToken.bin, gas: 2000000 };   
        return new Promise((resolve, reject) => {
            factory.new(amount, name, decimal, symbol, saleAddr, options, (err, contract) => {
                if (!err) {
                    if (contract.address) resolve(contract);
                }
                else reject(err);
            });
        }) 
    },
    transferHumanStandardToken: function(contract, accountTo, amount){
        return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            contract.transfer(accountTo, amount, options, async (err, txHash) => {
                if(!err) {
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    transferHumanStandardTokenAs: function(contract, sender, accountTo, amount){
        return new Promise((resolve, reject) => {
            var options = { from: sender, gas: 2000000 }
            contract.transfer(accountTo, amount, options, async (err, txHash) => {
                if(!err) {
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    approveHumanStandardToken: function(contract, accountTo, amount){
        return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 };
            contract.approve(accountTo, amount, options, async (err, txHash) => {
                if(!err){
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                } 
                else reject(err)
            })
        })
    },
    transferFromHumanStandardToken: function(contract, accountFrom, accountTo, amount, accountSender){
        return new Promise((resolve, reject) => {
            var options = { from: accountSender, gas: 2000000 }
            contract.transferFrom(accountFrom, accountTo, amount, options, async (err, txHash) =>{
                if(!err){
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash)
                }
                else reject(err);
            })
        })
    },
    removeTransferLockHumanStandardToken: function(contract, sender){
        return new Promise((resolve, reject) => {
            var options = { from: sender, gas: 2000000 }
            contract.removeTransferLock(options, async (err, txHash) =>{
                if(!err){
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash)
                }
                else reject(err);
            })
        })
    },
    reversePurchaseHumanStandardToken: function(contract, sender, tokenholder){
        return new Promise((resolve, reject) => {
            var options = { from: sender, gas: 2000000 }
            contract.reversePurchase(tokenholder, options, async (err, txHash) =>{
                if(!err){
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash)
                }
                else reject(err);
            })
        })
    },
    at: function(address){
        var c = contractSplitter();
        var HumanStandardToken = c.HumanStandardToken;
        var factory = web3.eth.contract(JSON.parse(HumanStandardToken.abi));  
        var instance = web3.eth.contract(JSON.parse(HumanStandardToken.abi)).at(address);    
        return new Promise((resolve, reject) => {
            if(instance){
                resolve(instance);
            }else{
                reject("unable to create instance from address");
            }
        }); 
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