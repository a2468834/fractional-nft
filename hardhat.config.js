require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("dotenv").config();

task("accounts", "Prints the list of accounts")
    .setAction(async (taskArgs) => {
        const HRE_EOAs = await hre.ethers.getSigners();
        
        console.log("HRE Accounts" + "\n" + "========================================");
        
        for(var i = 0; i < HRE_EOAs.length; i++) {
            console.log(`PubKey ${HRE_EOAs[i].address}`);
        }
    });

task("height", "Print the current block height")
    .setAction(async (taskArgs) => {
        console.log("The current block height is: " + await web3.eth.getBlockNumber());
    });

module.exports = {
    solidity: {
        version: "0.8.7",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        },
        outputSelection: {
            '*': {
                '*': ['*']
            }
        },
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: process.env.Goerli,
            accounts: [process.env.Alice, process.env.Bob, process.env.Maya]
        },
        hardhat: {
            forking: {
                url: process.env.Mainnet,
                blockNumber: (+process.env.ForkNumber)
            }
        },
        hrenet: {
            url: "http://127.0.0.1:8545/",
        }
    },
    etherscan: {
        apiKey: process.env.Etherscan
    }
};
// Block #14297759 ==> 2022-03-01 00:00:18 (UTC+0)