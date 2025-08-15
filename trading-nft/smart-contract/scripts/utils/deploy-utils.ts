import { ethers, network, run } from 'hardhat';
import { Contract } from 'ethers';
import * as fs from 'fs';

export async function verifyContract(
  address: string,
  constructorArguments: any[] = []
) {
  if (network.name === 'hardhat' || network.name === 'localhost') {
    return;
  }

  console.log('Waiting for 6 block confirmations before verification...');
  const tx = await ethers.provider.getTransaction(address);
  if (tx) {
    await ethers.provider.waitForTransaction(tx.hash, 6);
  }

  try {
    await run('verify:verify', {
      address,
      constructorArguments,
    });
    console.log('Contract verified successfully');
  } catch (error: any) {
    if (error.message.includes('Already Verified')) {
      console.log('Contract already verified');
    } else {
      console.error('Error verifying contract:', error);
    }
  }
}

export async function saveDeployment(deployments: Record<string, string>) {
  const deploymentsPath = `deployments/${network.name}`;
  const filename = `${deploymentsPath}/deployments.json`;

  if (!fs.existsSync(deploymentsPath)) {
    fs.mkdirSync(deploymentsPath, { recursive: true });
  }

  let existingDeployments: Record<string, string> = {};
  if (fs.existsSync(filename)) {
    existingDeployments = JSON.parse(fs.readFileSync(filename, "utf-8"));
  }

  const newDeployments = { ...existingDeployments, ...deployments };
  fs.writeFileSync(filename, JSON.stringify(newDeployments, null, 2));

  console.log(`Deployment addresses saved to ${filename}`);
}
