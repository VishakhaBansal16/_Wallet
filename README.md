npm init --yes  
npm i @nomiclabs/hardhat-ethers
npm install '@nomiclabs/hardhat-etherscan'
npm install hardhat
npx hardhat compile
npx hardhat run
npx hardhat run scripts/deploy.js --network goerli
npx hardhat run scripts/verify.js --network goerli
