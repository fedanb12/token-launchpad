import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TokenFactory...");

  const Factory = await ethers.getContractFactory("TokenFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("TokenFactory deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});