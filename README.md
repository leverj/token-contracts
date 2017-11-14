# token-contracts

This repo contains the contracts being used for the Leverj token sale and associated test suites.

### Install

Linux
```
# Ethereum
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
sudo apt-get isntall solc

# NodeJS
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# Mocha
sudo npm install -g mocha
```

Mac
```
# Ethereum
brew tap ethereum/ethereum
brew install ethereum
brew install solc

# NodeJS
TBD

# Mocha
TBD
```

### Setup

Restore the accounts
```
mkdir ~/.ethereum
mkdir ~/.ethereum/keystore
cp geth/keystore_backup/* ~/.ethereum/keystore/
```

Initialize Geth
```
geth init geth/genesis.json

# Create a file called .pass and add the pasword given 20 times
vim geth/.pass
```

### Compilation

```
make all
```

All compilation outputs will be in the `dist` folder in a single `contracts.json` file

To run all the tests:
```
mocha tests/*
```

To run the sale tests:
```
mocha tests/Sale.js
```

To run tests for all other contracts:
```
mocha tests/<contract name>.js
```

To clean up compilation folder:
```
make clean
```
