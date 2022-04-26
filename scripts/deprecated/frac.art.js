// Packages
const uploader = require("./nft-storage");

// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Rinkeby Fractional.Art
const VaultABI = require("./ERC721VaultFactory.abi.json");
const VaultAddress = "0x458556c097251f52ca89cB81316B4113aC734BD1";

// My NFT contract
const MyNFTABI = require("../artifacts/contracts/hsnl-nft.sol/HSNLNFT.json").abi;
const MyNFTAddress = "0xF812D4fa538a6B466456e18e23ED9EF2ad423137";

// Main function
async function main() {
    // Declare Signer object
    const HRE_EOAs = await hre.ethers.getSigners();
    const signer_0 = HRE_EOAs[0];
    const signer_1 = HRE_EOAs[1];
    const provider = await hre.ethers.provider;
    var contract_my_nft = new hre.ethers.Contract(MyNFTAddress, MyNFTABI, provider);
    var contract_frac_vault = new hre.ethers.Contract(VaultAddress, VaultABI, provider);
    
    var txn_response, txn_receipt;
    
    // Upload a image to NFT.Storage
    /*
    const cid = await uploader.storeOneFile(
        "images/random/C.png", 
        "C",
        "This is an images of alphabet C."
    );
    console.log(JSON.stringify(cid, null, 2));
    */
    const cid = "ipfs://bafybeibvxodipnzzhs2jsri75brmsgnix2avx2pfatkbxgmkn6cqq6f2w4";
    
    
    // Mint a token in My NFT contract
    contract_my_nft = contract_my_nft.connect(signer_1);
    txn_response = await contract_my_nft.mintToken();
    //txn_receipt = 
    
    
    contract_frac_vault = contract_frac_vault.connect(signer_1);
    txn_response = await contract_frac_vault.mint();
    txn_receipt  = await txn_response.wait();
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });