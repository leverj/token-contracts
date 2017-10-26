# token-contracts

This repo contains the contracts being used for the Leverj token sale and associated test suites.

Ensure you have a local node or testrpc along with at least 20 unlocked accounts.

Compilation:
```
make all
```
To run the sale tests:
```
mocha tests/Sale.js
```
To run tests for all other contracts:
```
mocha tests/<contract name>.js
```

TODO: update instructions to use Mo's test node instatiation for faster and more automatic setup
