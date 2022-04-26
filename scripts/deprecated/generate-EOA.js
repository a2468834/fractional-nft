// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    const new_wallet = ethers.Wallet.createRandom();
    console.log("PubKey  ", new_wallet.address);
    console.log("Mnemonic", new_wallet.mnemonic.phrase);
    console.log("PriKey  ", new_wallet.privateKey);
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });