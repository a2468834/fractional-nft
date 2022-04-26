// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const Alice = (await hre.ethers.getSigners())[0];
    const ABI = ["function freeMint(string calldata) public returns (bool)"];
    const contract_address = "0xe90e62d160e47005eea1521c39cb47824b7be414";
    const contract = new ethers.Contract(contract_address, ABI, Alice);
    
    const ipfs_cid = "ipfs://bafyreigvqenbr6g2gxjiodxvy2z3x67uy2l4me3qhu4qv4opbxl7ustk64/metadata.json";
    const txn_response = await contract.freeMint(ipfs_cid);
    const txn_receipt  = await txn_response.wait();
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