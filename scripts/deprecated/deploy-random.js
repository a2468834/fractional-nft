// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const [EOA] = await hre.ethers.getSigners(); // Hardhat would get the EOA from hardhat.config.js
    console.log("Deploy the contract with the EOA: ", EOA.address);
    
    const constructor_arg = [
        "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",                           // LINK token address
        "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",                           // VRF coordinator
        "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",   // Key hash
        "100000000000000000"                                                    // Fee: 0.1 LINK
    ];
    const factory  = await hre.ethers.getContractFactory("Random", EOA);
    const contract = await factory.deploy(...constructor_arg);
    
    await contract.deployed();
    console.log(JSON.stringify(contract, null, 2));
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });