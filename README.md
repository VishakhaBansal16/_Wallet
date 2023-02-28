## Table of Contents

- [Task Description](#task-description)
- [Tasks Included](#tasks-included)
- [Technologies Included](#technologies-included)
- [Install and run](#install-and-run)
- [Hardhat Setup](#hardhat-setup)

## Task Description

Create a Fully Working Wallet Based on Nodejs.

## Tasks Included

- Maintain User session with JWT token
- Send Email Verification Mail to User on Signup
- Login with Password
- Give Fake Balance on User Signup
- Manage ERC20 tokens Transfer Functionality between Users
- Show Transaction Details (Admin/User View)
- Send Transaction Success/Failure Details to User on Email

## Technologies Included

- Nodejs for backend
- Solidity for smart contracts
- Hardhat for deploying contract on testnet goerli
- MongoDB for storing entries in the database
- Postman for using these APIs(/register, /login, /transaction, /sentTransactionDetails, /receivedTransactionDetails, /checkBalance)

## Install and Run

To run this project, you must have the following installed:

- nodejs
- npm

Run npm install to install required dependencies.

```
$ npm install
```

Run npm run dev to start the application.

```
$ npm run dev
```

## Hardhat Setup

Run npm install hardhat to install hardhat.

```
npm install hardhat
```

Run npm install '@nomiclabs/hardhat-etherscan' to install hardhat plugin for verifying contracts on etherscan.

```
npm install '@nomiclabs/hardhat-etherscan'
```

Run npm i @nomiclabs/hardhat-ethers to install plugin which brings Hardhat the Ethereum library ethers.js, which allows to interact with the Ethereum blockchain

```
Run npm i @nomiclabs/hardhat-ethers
```

Run npx hardhat compile to compile all contracts.

```
npx hardhat compile
```

Run npx hardhat run to run the hardhat in application.

```
npx hardhat compile
```

Run npx hardhat run scripts/deploy.js --network goerli to deploy contract on network goerli.

```
npx hardhat run scripts/deploy.js --network goerli
```

Run npx hardhat run scripts/verify.js --network goerli to verify the deployed contract on netwrok goerli.

```
npx hardhat run scripts/verify.js --network goerli
```
