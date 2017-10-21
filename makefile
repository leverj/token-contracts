all:
	solc --combined-json "abi,bin" contracts/*.sol -o ./dist/ --gas > ./dist/compilation.log

clean:
	rm ./dist/*

# for file in ./contracts/*.sol; 
#do 
#	solc --combined-json "abi,bin" $$file -o dist/"$$file".json --bin --abi --gas --pretty-json; 
# done