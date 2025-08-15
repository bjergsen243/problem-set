import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
import { verifyContract, saveDeployment } from "./utils/deploy-utils";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const balanceBefore = await ethers.provider.getBalance(deployer.address);

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance before deployment:", ethers.formatEther(balanceBefore), "ETH");
  console.log("Network:", network.name);

  // Deploy GachaBoxNFT (Thêm tham số nếu cần)
  console.log("Deploying GachaBoxNFT...");
  const GachaBoxNFT = await ethers.getContractFactory("GachaBoxNFT");
  const gachaBoxNFT = await GachaBoxNFT.deploy(); // Nếu có constructor, thêm tham số vào đây
  await gachaBoxNFT.waitForDeployment();
  
  const gachaBoxNFTAddress = await gachaBoxNFT.getAddress();
  console.log("GachaBoxNFT deployed to:", gachaBoxNFTAddress);

  // Save deployment addresses
  const deployments = {
    GachaBoxNFT: gachaBoxNFTAddress,
  };
  await saveDeployment(deployments);

  // Update .env file with contract addresses
  console.log("\nAdd these lines to your .env file:");
  console.log(`GACHA_BOX_NFT_ADDRESS=${gachaBoxNFTAddress}`);

  // Verify contract on Etherscan (chỉ nếu có API key và không phải mạng local)
  if (process.env.ETHERSCAN_API_KEY && network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nVerifying contract on Etherscan...");
    try {
      await verifyContract(gachaBoxNFTAddress, []);
      console.log("Contract verification successful!");
    } catch (error) {
      console.error("Contract verification failed:", error);
    }
  }

  const balanceAfter = await ethers.provider.getBalance(deployer.address);
  console.log("\nAccount balance after deployment:", ethers.formatEther(balanceAfter), "ETH");
  console.log("Gas used for deployment:", ethers.formatEther(balanceBefore - balanceAfter), "ETH");

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log(`Network: ${network.name}`);
  console.log(`GachaBoxNFT: ${gachaBoxNFTAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
