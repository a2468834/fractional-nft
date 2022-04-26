// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const [EOA] = await hre.ethers.getSigners();
    
    const ABI     = require("./LINK.abi.json");
    const address = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    const contract = new hre.ethers.Contract(address, ABI, EOA);
    
    const _to = "0x337EE8070845771655446682Ced48d30eB7F68B5";
    const _value = "1000000000000000000";
    console.log("Transfer 1 LINK token.");
    var txn_response = await contract.transfer(_to, _value);
    await txn_response.wait();
    
    console.log("LINK token balance of my contract:");
    console.log(JSON.stringify(hre.ethers.utils.formatEther(await contract.balanceOf(_to)), null, 2));
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });