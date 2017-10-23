var { contracts }   = require('../dist/contracts.json');
var utils           = require('./utils');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployFilter: function (beneficiaries, tokens){
        var c = contractSplitter();
        var Filter = c.Filter;
        var factory = web3.eth.contract(JSON.parse(Filter.abi));     
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + Filter.bin, gas: 2000000 };   
        return new Promise((resolve, reject) => {
            factory.new(beneficiaries, tokens, options, (err, contract) => {
                if (!err) {
                    if (contract.address) resolve(contract);
                }
                else reject(err);
            });
        }) 
    },
    setup: function(address, disburser){
    	var c = contractSplitter();
        var Filter = c.Filter;
        var instance = web3.eth.contract(JSON.parse(Filter.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            instance.setup(disburser, options, async (err, txHash) => {
                if(!err) {
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    claim: function(address, sender){
    	var c = contractSplitter();
        var Filter = c.Filter;
        var instance = web3.eth.contract(JSON.parse(Filter.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: sender, gas: 2000000 }
            instance.claim(options, async (err, txHash) => {
                if(!err) {
                    const mined = await utils.onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    getBeneficiaryInfo: function(address, beneficiary){
    	var c = contractSplitter();
    	var Filter = c.Filter();
    	var instance = web3.eth.contract(JSON.parse(Filter.abi)).at(address);    
    	return instance.getBeneficiaryInfo(beneficiary);
    },
    at: function(address){
        var c = contractSplitter();
        var Filter = c.Filter;
        var factory = web3.eth.contract(JSON.parse(Filter.abi));  
        var instance = web3.eth.contract(JSON.parse(Filter.abi)).at(address);    
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