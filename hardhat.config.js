require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { BSC_RPC_URL, BSC_DEPLOYER_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    bsc: {
      url: BSC_RPC_URL || "",
      accounts: BSC_DEPLOYER_KEY ? [BSC_DEPLOYER_KEY] : []
    }
  }
};