// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const { storeOneFile, storeFolder } = require("./nft-storage");
const { storeOneFileWithoutMetadata, storeFolderWithoutMetadata } = require("./nft-storage");

async function printDateNow() {
    const leadingZeros = (number, digit_num=2) => {return ("0".repeat(digit_num) + number).slice(-digit_num)};
    
    const now = new Date(Date.now());
    
    const YYYY = now.getFullYear();
    const MM   = leadingZeros(now.getMonth()+1);
    const DD   = leadingZeros(now.getDate());
    const hh   = leadingZeros(now.getHours());
    const mm   = leadingZeros(now.getMinutes());
    const ss   = leadingZeros(now.getSeconds());
    
    // return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}`;
    return `${YYYY}-${MM}-${DD}`;
}

// Main function
async function main() {
    var path, title, description, miscellanea;
    
    // /***** Example Usage *****/
    // path = "/path/to/folder";
    // title = "";
    // description = "A collection of pictures that user can choose from when they minting.";
    // miscellanea = {date: `${await printDateNow()}`};
    // console.log(
    //     await storeFolder(
    //         title,
    //         description,
    //         miscellanea,
    //         path
    // ));
    
    // path        = "/path/to/image.png";
    // title       = "";
    // description = `The profile picture of the NFT project ${title}.`;
    // miscellanea = {date: `${await printDateNow()}`};
    // console.log(
    //     await storeOneFile(
    //         title,
    //         description,
    //         miscellanea,
    //         path
    // ));
    
    // path = "/path/to/folder";
    // console.log(
    //     await storeFolderWithoutMetadata(
    //         path
    // ));
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });