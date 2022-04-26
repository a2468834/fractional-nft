// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const HSNLNFT_JSON = require("../artifacts/contracts/hsnl-nft.sol/HSNLNFT.json");
const zero_address = "0x0000000000000000000000000000000000000000";
const uploader     = require("./nft-storage");

// Main function
async function main() {
    var txn_response, txn_receipt;
    
    // Declare Signer object
    const HRE_EOAs = await hre.ethers.getSigners();
    const signer_0 = HRE_EOAs[0];
    const signer_1 = HRE_EOAs[1];
    const provider = await hre.ethers.provider;
    
    // Deploy contract (NFTFactory) by signer[0]
    const factory    = await hre.ethers.getContractFactory("NFTFactory", signer_0);
    const NFTFactory = await factory.deploy();
    await NFTFactory.deployed();
    console.log(JSON.stringify(NFTFactory.deployTransaction, null, 2));
    
    // Create collection  by signer[1]
    txn_response = await NFTFactory.create("Maroon Bronze Vaduz", "MBV", 100, signer_1.address);    
    txn_receipt  = await txn_response.wait();
    
    console.log(JSON.stringify(txn_receipt, null, 2));
    
    /*
    var HSNLNFTs = [""];
    HSNLNFTs.push(
        new hre.ethers.Contract(
            await NFTFactory.contractAddressByIndex(0), 
            HSNLNFT_JSON.abi, 
            provider
    ));
    
    // Create collection 2 (manager is signer_2)
    txn_response = await NFTFactory.create("2", "Two", 100, signer_2.address);    
    txn_receipt  = await txn_response.wait();
    HSNLNFTs.push(await HSNLNFTs[0].attach(await NFTFactory.getAddress(1)));
    
    const ttt = await uploader.storeFolder("images/random", "The alphabets", "This is a collection of alphabet pictures.");
    const tttt = ttt.url;
    console.log(JSON.stringify(tttt, null, 2));
    
    // Mint a C1 token by 0 - Failed
    try {
        HSNLNFTs[1] = await (HSNLNFTs[1]).connect(signer_0);
        txn_response = await HSNLNFTs[1].mintToken(token_URI);
        txn_receipt  = await txn_response.wait();
    }
    catch (error) {
        console.log("L47", error);
    }
    
    // Mint a C2 token by 1 - Failed
    try {
        HSNLNFTs[2] = await (HSNLNFTs[2]).connect(signer_1);
        txn_response = await HSNLNFTs[2].mintToken(token_URI);
        txn_receipt  = await txn_response.wait();
    }
    catch (error) {
        console.log("L57", error);
    }
    
    // Mint a C1 token by 1 - Okay
    try {
        HSNLNFTs[1] = await (HSNLNFTs[1]).connect(signer_1);
        txn_response = await HSNLNFTs[1].mintToken(token_URI);
        txn_receipt  = await txn_response.wait();
    }
    catch (error) {
        console.log("L67", error);
    }
    
    // Mint a C2 token by 2 - Okay
    try {
        HSNLNFTs[2] = await (HSNLNFTs[2]).connect(signer_2);
        txn_response = await HSNLNFTs[2].mintToken(token_URI);
        txn_receipt  = await txn_response.wait();
    }
    catch (error) {
        console.log("L77", error);
    }
    */
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });
//console.log(JSON.stringify(error.message, null, 2));
/*
const metadata = await uploadFile.storeOneFile("images/random/A.png", "The alphabet A", "This is a picture of alphabet A .");
console.log(JSON.stringify(metadata.url, null, 2));
*/
//ipfs://bafyreibgvlx75toc2jyxeeu6sregyfnlaaivnzciwr7whn5qwl2s74fagm/metadata.json
//var token_URI = "ipfs://bafyreibgvlx75toc2jyxeeu6sregyfnlaaivnzciwr7whn5qwl2s74fagm/metadata.json";