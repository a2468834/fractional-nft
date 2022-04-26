// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const HRE_EOAs = await hre.ethers.getSigners();
    const Maya = HRE_EOAs[2];
    
    console.log("--------------------------------------------------");
    
    console.log("Deploying contract...");
    const factory  = await hre.ethers.getContractFactory("WETH", Maya);
    const contract = await factory.deploy();
    await contract.deployTransaction.wait(2);
    console.log("Successfully deployed at: ", contract.address);
    
    console.log("--------------------------------------------------");
    
    console.log("Upload solidity codes to the Etherscan");
    try {
        await hre.run("verify:verify", {
            address: contract.address,
            constructorArguments: []
        });
    } catch(error) {
        if(error.message.includes("Reason: Already Verified")) {
            console.log("Contract has already been verified at Etherscan");
        }
        else console.error(error);
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