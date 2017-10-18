var { contracts }   = require('../dist/contracts.json');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployToken: function (receiver, period, start){
        var c = contractSplitter();
        var Token = c.Token;
        var factory = web3.eth.contract(JSON.parse(Token.abi));     
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + Token.bin, gas: 400000 };   
        return new Promise((resolve, reject) => {
            factory.new(options, (err, contract) => {
                if (!err) {
                    if (contract.address) resolve(contract);
                }
                else reject(err);
            });
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