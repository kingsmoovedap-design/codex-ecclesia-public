const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const BSC = await hre.ethers.getContractFactory("BordersSovereignCoin");
  const bsc = await BSC.deploy();
  await bsc.waitForDeployment();

  console.log("Borders Sovereign Coin deployed to:", await bsc.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});