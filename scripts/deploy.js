require("@nomiclabs/hardhat-ethers");
async function main() {
  const ContractInstance = await ethers.getContractFactory("ERC20");
  const contractInstance = await ContractInstance.deploy(
    "ERC20Token",
    "ERC20T",
    18,
    1000
  );
  await contractInstance.deployed();
  console.log(contractInstance.address);
}
main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
