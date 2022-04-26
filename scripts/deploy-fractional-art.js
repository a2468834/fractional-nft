// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const HRE_EOAs = await hre.ethers.getSigners();
    const Maya = HRE_EOAs[2];
    var settings_address, vault_factory_address;
    
    console.log("--------------------------------------------------");
    {
        console.log("Deploying contract `Settings`...");
        const factory  = await hre.ethers.getContractFactory("Settings", Maya);
        const contract = await factory.deploy();
        await contract.deployTransaction.wait(2);
        settings_address = contract.address;
        console.log("Successfully deployed at: ", contract.address);
    }
    console.log("--------------------------------------------------");
    {
        console.log("Deploying contract `ERC721VaultFactory`...");
        const factory  = await hre.ethers.getContractFactory("ERC721VaultFactory", Maya);
        const contract = await factory.deploy(settings_address);
        await contract.deployTransaction.wait(2);
        vault_factory_address = contract.address;
        console.log("Successfully deployed at: ", contract.address);
    }
    console.log("--------------------------------------------------");
    {
        console.log("Upload solidity codes to the Etherscan");
        try {
            await hre.run("verify:verify", {
                address: settings_address,
                constructorArguments: []
            });
        } catch(error) {
            if(error.message.includes("Reason: Already Verified")) {
                console.log("Contract has already been verified at Etherscan");
            }
            else console.error(error);
        }
    }
    {
        console.log("Upload solidity codes to the Etherscan");
        try {
            await hre.run("verify:verify", {
                address: vault_factory_address,
                constructorArguments: [settings_address]
            });
        } catch(error) {
            if(error.message.includes("Reason: Already Verified")) {
                console.log("Contract has already been verified at Etherscan");
            }
            else console.error(error);
        }
    }
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });