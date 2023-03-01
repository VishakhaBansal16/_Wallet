require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
module.exports = {
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/NGUbihVC3VtItjB-XcwQabWeuBZUfcnR",
      accounts: [
        "52f2046c2002f0bd00adcebfc8cd45dcddd933eb47e9df34f2ec81386814a810",
      ],
    },
  },

  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      goerli: "WNA22FEIRQGXMUSZXDJNPICTUN16NRURMX",
    },
    customChains: [],
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  mocha: {
    timeout: 40000,
  },
};
