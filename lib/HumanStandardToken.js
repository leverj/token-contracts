var { contracts }   = require('../dist/contracts.json');
var Web3            = require('web3');
var web3            = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    deployHumanStandardToken: function (){
        var c = contractSplitter();
        var HumanStandardToken = c.HumanStandardToken;
        var factory = web3.eth.contract(JSON.parse(HumanStandardToken.abi));        
        return new Promise((resolve, reject) => {
            factory.new(100,'ConsenSys',10,'CS',"0x5b1869d9a4c187f2eaa108f3062412ecf0526b24",20,{
                from: web3.eth.accounts[0],
                value: 0,
                data: "0x" + HumanStandardToken.bin,
                gas: 2000000
            }, function (err, contract) {
                if (!err) {
                    if (!contract.address)
                        console.log(`Transaction sent. Hash: ${contract.transactionHash}`);
                    else{
                        console.log(`Transaction mined. Address: ${contract.address}`);
                        resolve(contract);
                    }
                }
                else {
                    console.log(`err: ${err}`);
                    reject(err);
                }
            });
        }) 
    },
    transferHumanStandardToken: function(contract){
        return new Promise((resolve, reject) => {
            contract.transfer(web3.eth.accounts[1], 60,{
                from: web3.eth.accounts[0],
                gas: 2000000
            }, function(err, response){
                if(!err) resolve(response)
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