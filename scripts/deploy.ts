import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TokenLaunchpad...");

  const Factory = await ethers.getContractFactory("TokenLaunchpad");
  const contract = await Factory.deploy("My Token", "MTK");

  await contract.waitForDeployment();

  console.log("TokenLaunchpad deployed to:",  await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});