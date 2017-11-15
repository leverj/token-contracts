var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    getBalance: function(address) {
        return new Promise((resolve, reject) => {
            resolve(web3.eth.getBalance(address));
        });
    },
    sendTransaction: function(from, to, value) {
        var options = { from: from, to: to, value: value };
        return new Promise((resolve, reject) => {
            web3.eth.sendTransaction(options, async (err, txHash) => {
                if(!err){
                    const mined = await this.onConfirmation(txHash);
                    if(mined) resolve(txHash)
                    else reject(txHash)
                }
                else reject(err)
            })
        })
    },onConfirmation: function(txHash){
        return new Promise((resolve, reject) => {
            var breakout = false;
            var timeout = setInterval(()=>{
                breakout = true;
                clearTimeout(timeout);
            },30000)
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
};