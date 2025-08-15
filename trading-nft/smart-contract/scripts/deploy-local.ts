import { ethers, network } from 'hardhat';
import { saveDeployment } from './utils/deploy-utils';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function main() {
  if (network.name !== 'localhost' && network.name !== 'hardhat') {
    throw new Error('This script is intended for local deployment only');
  }

  const signers = await ethers.getSigners();
  if (!signers.length) {
    throw new Error("No signers available!");
  }
  const [deployer] = signers;

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Network:', network.name);

  // Deploy GachaBoxNFT
  console.log("Deploying GachaBoxNFT...");
  const GachaBoxNFT = await ethers.getContractFactory("GachaBoxNFT");
  const gachaBoxNFT = await GachaBoxNFT.deploy();
  await gachaBoxNFT.waitForDeployment();
  await gachaBoxNFT.deploymentTransaction()?.wait(1); // Chờ ít nhất 1 block

  const gachaBoxNFTAddress = await gachaBoxNFT.getAddress();
  console.log("GachaBoxNFT deployed to:", gachaBoxNFTAddress);

  // Save deployment addresses
  const deployments = { GachaBoxNFT: gachaBoxNFTAddress };
  await saveDeployment(deployments);

  // Update .env file
  const envFilePath = '.env';
  const envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf8') : '';
  const newEnvContent = envContent.includes('GACHA_BOX_NFT_ADDRESS=')
    ? envContent.replace(/GACHA_BOX_NFT_ADDRESS=.*/g, `GACHA_BOX_NFT_ADDRESS=${gachaBoxNFTAddress}`)
    : envContent + `\nGACHA_BOX_NFT_ADDRESS=${gachaBoxNFTAddress}`;

  fs.writeFileSync(envFilePath, newEnvContent.trim() + '\n');
  console.log('Updated .env file with contract address.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
