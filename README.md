# token-contracts

### Clone Repo

This repo contains the contracts being used for the Leverj token sale and associated test suites. Clone the repo and install the require packages by
```
git clone https://github.com/leverj/token-contracts
npm install
```

### Install

Linux
```
# Ethereum
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
sudo apt-get install solc

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

All steps assume you are in the project directory.

Linux
```
mkdir ~/.ethereum
mkdir ~/.ethereum/keystore
cp geth/keystore_backup/* ~/.ethereum/keystore/
geth init geth/genesis.json

# create a file called .pass and add the pasword given 20 times on a new line
vim geth/.pass
```

Mac
```
mkdir ~/Library/Ethereum
mkdir ~/Library/Ethereum/keystore
cp geth/keystore_backup/* ~/Library/Ethereum/keystore/
geth init geth/genesis.json

# create a file called .pass and add the password given 20 times on a new line
vim geth/.pass
```

### Run Node

```
cd geth
./start-geth && tail -f ~/.ethereum/log
```

Once the DAG creation is complete, you will be able to run test on your local node.

### Compilation

All compilation outputs will be in the `dist` folder in a single `contracts.json` file

To compile all of the contracts in the contracts/ folder
```
make all
```

To clean up the dist folder
```
make clean
```

### Running Tests

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
