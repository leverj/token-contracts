all:
	solc --combined-json "abi,bin" contracts/*.sol > ./dist/combined.json

clean:
	rm ./dist/*

# for file in ./contracts/*.sol; 
#do 
#	solc --combined-json "abi,bin" $$file -o dist/"$$file".json --bin --abi --gas --pretty-json; 
# done
