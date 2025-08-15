import { ethers } from "hardhat";
import { expect } from "chai";
import { GachaBoxNFT } from "../types";

describe("GachaBoxNFT", function () {
  let gachaBoxNFT: GachaBoxNFT;
  let owner: any, user: any, minter: any;
  
  beforeEach(async function () {
    [owner, user, minter] = await ethers.getSigners();

    const GachaBoxNFT = await ethers.getContractFactory("GachaBoxNFT");
    gachaBoxNFT = (await GachaBoxNFT.deploy()) as GachaBoxNFT;
    await gachaBoxNFT.waitForDeployment();
  });

  it("should deploy and set owner correctly", async function () {
    expect(await gachaBoxNFT.owner()).to.equal(owner.address);
  });

  it("should allow user to spin gacha with sufficient payment", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), true);
    await expect(
      gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") })
    ).to.emit(gachaBoxNFT, "GachaPaid");
  });

  it("should reject gacha spin with insufficient payment", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), true);
    await expect(
      gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.009") })
    ).to.be.revertedWithCustomError(gachaBoxNFT, "InsufficientPayment");
  });

  it("should reject gacha spin if box is not active", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), false);
    await expect(
      gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(gachaBoxNFT, "BoxNotActive");
  });

  it("should not allow exceeding daily mint limit", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), true);
    for (let i = 0; i < 5; i++) {
      await gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") });
    }
    await expect(
      gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(gachaBoxNFT, "DailyMintLimitReached");
  });

  it("should allow admin to set box price and state", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.02"), true);
  });

  it("should allow admin to authorize a minter", async function () {
    await gachaBoxNFT.connect(owner).setAuthorizedMinter(minter.address, true);
  });

  it("should reject setting minter to zero address", async function () {
    await expect(
      gachaBoxNFT.connect(owner).setAuthorizedMinter(ethers.ZeroAddress, true)
    ).to.be.revertedWithCustomError(gachaBoxNFT, "ZeroAddress");
  });

  it("should allow an authorized minter to mint NFT", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), true);
    await gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") });
    await gachaBoxNFT.connect(owner).setAuthorizedMinter(minter.address, true);
    
    await expect(
      gachaBoxNFT.connect(minter).mintNFT(0, "ipfs://example")
    ).to.emit(gachaBoxNFT, "NFTMinted");
  });

  it("should reject unauthorized minter", async function () {
    await expect(
      gachaBoxNFT.connect(user).mintNFT(0, "ipfs://example")
    ).to.be.revertedWithCustomError(gachaBoxNFT, "NotAuthorized");
  });

  it("should reject minting if already minted", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), true);
    await gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") });
    await gachaBoxNFT.connect(owner).setAuthorizedMinter(minter.address, true);
    await gachaBoxNFT.connect(minter).mintNFT(0, "ipfs://example");
    await expect(
      gachaBoxNFT.connect(minter).mintNFT(0, "ipfs://example")
    ).to.be.revertedWithCustomError(gachaBoxNFT, "AlreadyMinted");
  });

  it("should allow owner to withdraw funds", async function () {
    await gachaBoxNFT.connect(owner).setBoxPrice(1, ethers.parseEther("0.01"), true);
    
    // User spins gacha
    await gachaBoxNFT.connect(user).spinGacha(1, { value: ethers.parseEther("0.01") });
  
    // Owner authorizes a minter
    await gachaBoxNFT.connect(owner).setAuthorizedMinter(minter.address, true);
    
    // Minter mints NFT to reduce _pendingWithdrawals
    await gachaBoxNFT.connect(minter).mintNFT(0, "ipfs://example");
  
    const initialBalance = await ethers.provider.getBalance(owner.address);
  
    // Now withdrawal should succeed
    await gachaBoxNFT.connect(owner).withdrawFunds();
  
    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.greaterThan(initialBalance);
  });
  

  it("should reject withdrawal if no funds available", async function () {
    await expect(
      gachaBoxNFT.connect(owner).withdrawFunds()
    ).to.be.revertedWithCustomError(gachaBoxNFT, "NoFundsToWithdraw");
  });
});