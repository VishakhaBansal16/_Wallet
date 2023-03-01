const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function deployTokenFixture() {
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();

  const MyContract = await ethers.getContractFactory("ERC20");

  const hardhatToken = await MyContract.deploy(
    "ERC20Token",
    "ERC20T",
    18,
    1000
  );

  await hardhatToken.deployed();

  // Fixtures can return anything you consider useful for your tests
  return { MyContract, hardhatToken, owner, addr1, addr2, addr3 };
}

describe("MyContract", function () {
  //totalSupply should be equal to ownerBalance
  it("Should assign the total supply of tokens to the owner", async () => {
    const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async () => {
    const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );
    //transfer 100 tokens from owner to addr1
    await hardhatToken.connect(owner).transfer(addr1.address, 100);
    expect(await hardhatToken.balanceOf(addr1.address)).to.equal(100);

    //transfer 50 tokens from addr1 to addr2
    await hardhatToken.connect(addr1).transfer(addr2.address, 50);
    expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
  });

  it("Should emit Transfer events", async function () {
    const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    // Transfer 100 tokens from owner to addr1
    await expect(hardhatToken.transfer(addr1.address, 100))
      .to.emit(hardhatToken, "Transfer")
      .withArgs(owner.address, addr1.address, 100);

    // Transfer 50 tokens from addr1 to addr2
    await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
      .to.emit(hardhatToken, "Transfer")
      .withArgs(addr1.address, addr2.address, 50);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const { hardhatToken, owner, addr3 } = await loadFixture(
      deployTokenFixture
    );
    const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

    // Trying to send 1 token from addr3(0 tokens) to owner.
    await expect(hardhatToken.connect(addr3).transfer(owner.address, 100)).to.be
      .reverted;

    // Owner balance shouldn't have changed.
    expect(await hardhatToken.balanceOf(owner.address)).to.equal(
      initialOwnerBalance
    );
  });

  it("Should update balances after transfers", async function () {
    const { hardhatToken, owner, addr3 } = await loadFixture(
      deployTokenFixture
    );
    //transfer 50 tokens from owner to addr3
    await expect(
      hardhatToken.connect(owner).transfer(addr3.address, 50)
    ).to.changeTokenBalances(hardhatToken, [owner, addr3], [-50, 50]);
  });
});
