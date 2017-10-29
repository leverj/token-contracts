function automine (n) {
	var n = n || 1;
	
	setInterval(function () {
		if (!eth.mining && (txpool.status.pending || txpool.status.queued)) {
			console.log("miner start");
			miner.start();
	     	} else if (eth.mining) {
			console.log('miner stop');
			miner.stop();
		}
	},  n*1000 );

}

automine();
