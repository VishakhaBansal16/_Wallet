require("@nomiclabs/hardhat-etherscan");
const hre = require("hardhat");
async function main() {
  await hre.run("verify:verify", {
    address: "0x1ff1EA0a7F55BD4bBAf2a3C35EEbE63D921FcbEc",
    constructorArguments: ["ERC20Token", "ERC20T", 18, 1000],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
