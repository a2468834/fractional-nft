// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const [EOA] = await hre.ethers.getSigners();
    
    const ABI     = require("../artifacts/contracts/random.sol/Random.json").abi;
    const address = "0x337EE8070845771655446682Ced48d30eB7F68B5";
    
    const contract = new hre.ethers.Contract(address, ABI, EOA);
    
    var txn_response = await contract.makeRequest();
    var txn_receipt = await txn_response.wait();
    
    console.log(JSON.stringify(txn_receipt, null, 2));
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });