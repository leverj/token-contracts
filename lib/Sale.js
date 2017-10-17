var build = require('../dist/Sale');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


module.exports = function (owners, required, opts) {
	var opts = opts || {};
	opts.from = opts.from || web3.eth.accounts[0];
	opts.value = opts.value || 0;
	var factory = web3.eth.contract(build.abi);
	return factory.new({
		from: opts.from,
		value: opts.value,
		data: build.bin,
		gas: web3.eth.estimateGas({data: build.bin})
	}, function (err, contract) {
		if (!err) {
			if (!contract.address)
				console.log(`Transaction sent. Hash: ${contract.transactionHash}`);
			else
				console.log(`Transaction mined. Address: ${contract.address}`);
		}
		else {
			console.log(`err: ${err}`);
		}
	});
}
