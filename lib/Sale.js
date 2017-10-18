var { contracts }   = require('../dist/contracts.json');
var Web3      = require('web3');
var web3      = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

module.exports = {
    createSale: function (owner, supply, name, decimals, symbol, freezeBlock, startBlock, endblock, price){
        var c = contractSplitter();
        var sale = c.Sale;
        var factory = web3.eth.contract(JSON.parse(sale.abi));
        var options = { from: web3.eth.accounts[0], value: 0, data: "0x" + sale.bin, gas: 200000000 };   
        return new Promise((resolve, reject) => {
            factory.new(owner, supply, name, decimals, symbol, freezeBlock, startBlock, endblock, price, options, (err, contract) => {
                if (!err) {
                    if (contract.address) resolve(contract);
                }
                else reject(err);
            });
        }) 
    },
    distributeFoundersTokens: function(address, founders, foundersTokens, vestingStartDates, vestingDurations){
    	var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            instance.distributeFoundersTokens(founders, foundersTokens, vestingStartDates, vestingDurations, options, async (err, txHash) => {
                if(!err) {
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    distributeLiquidityTokens: function(address, liquidityWallets, liquidityAmounts){
    	var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            instance.distributeLiquidityTokens(liquidityWallets, liquidityAmounts, options, async (err, txHash) => {
                if(!err) {
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    distributePartnersTokens: function(address, partners, partnersTokens, vestingStartDates, vestingDurations){
    	var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            instance.distributePartnersTokens(partners, partnersTokens, vestingStartDates, vestingDurations, options, async (err, txHash) => {
                if(!err) {
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    distributePresaleTokens: function(address, presaleBuyers, presaleTokens, vestingStartDates, _vestingDurations){
    	var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            instance.distributePreSaleTokens(presaleBuyers, presaleTokens, vestingStartDates, _vestingDurations, options, async (err, txHash) => {
                if(!err) {
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    configureWallet: function(address, wallet){
    	var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: web3.eth.accounts[0], gas: 2000000 }
            instance.configureWallet(wallet, options, async (err, txHash) => {
                if(!err) {
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    purchase: function(address, buyer, ether){
    	var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
    	return new Promise((resolve, reject) => {
            var options = { from: buyer, value: ether, gas: 2000000 }
            instance.purchaseTokens(options, async (err, txHash) => {
                if(!err) {
                    const mined = await onConfirmation(txHash);
                    if(mined) resolve(txHash);
                    else reject(txHash);
                }
                else reject(err)
            })
        })
    },
    at: function(address){
        var c = contractSplitter();
        var sale = c.Sale;
        var instance = web3.eth.contract(JSON.parse(sale.abi)).at(address);    
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

function onConfirmation(txHash){
    return new Promise((resolve, reject) => {
        var breakout = false;
        var timeout = setInterval(()=>{
            breakout = true;
            clearTimeout(timeout);
        },500000)
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