var { contracts }   = require('../dist/contracts.json');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployHumanStandardToken: function (amount, name, decimal, symbol, saleAddr, endBlock){
        var c = contractSplitter();
        var HumanStandardToken = c.HumanStandardToken;
        var factory = web3.eth.contract(JSON.parse(HumanStandardToken.abi));     
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + HumanStandardToken.bin, gas: 2000000 };   
        return new Promise((resolve, reject) => {
            factory.new(amount, name, decimal, symbol, saleAddr, endBlock, options, (err, contract) => {
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
                    const mined = await onConfirmation(txHash);
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
                    const mined = await onConfirmation(txHash);
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
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash)
                }
                else reject(err);
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


function onConfirmation(txHash){
    return new Promise((resolve, reject) => {
        var breakout = false;
        var timeout = setInterval(()=>{
            breakout = true;
            clearTimeout(timeout);
        },10000)
        var txCheck = setInterval(()=>{            
            if(web3.eth.getTransaction(txHash).blockNumber !== null){
                resolve(true);
                clearTimeout(txCheck);
                clearTimeout(timeout);
            }else if(breakout){
                resolve(false);
                clearTimeout(txCheck);
                clearTimeout(timeout);
            }
        },1000)
    })
}