// Packages
const { NFTStorage, File } = require("nft.storage");
const mime = require("mime");
const mime_db = require('mime-db');
const fs   = require("fs");
const path = require("path");
const IPFS = require("ipfs-core");

// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

async function storeOneFileWithPath(title, description, miscellanea, file_path) {
    const client  = new NFTStorage({token: process.env.NFTStorage});
    const content = fs.readFileSync(file_path);
    const image   = new File(
        [content], // Must be a bit array or string! https://developer.mozilla.org/en-US/docs/Web/API/File/File#parameters
        path.basename(file_path), 
        {type: mime.getType(file_path)}
    );
    
    const result = await client.store({
        image: image,
        name: title,
        description: description,
        ...miscellanea
    });
    return result.url;
}

async function storeOneFileWithFile(title, description, miscellanea, file_object, file_name, file_type) {
    const client  = new NFTStorage({token: process.env.NFTStorage});
    const image = new File(
        [file_object], // Must be a bit array or string! https://developer.mozilla.org/en-US/docs/Web/API/File/File#parameters
        file_name, 
        {type: file_type}
    );
    
    const result = await client.store({
        image: image,
        name: title,
        description: description,
        ...miscellanea
    });
    return result.url;
}

/**
 * @param title       A string title which describes the image
 * @param description A detailed description of the image
 * @param miscellanea Other custom properties in the NFT's metadata which must be a JSON {}
 * @param file_path   [OPTIONAL-1] A path to the image file
 * @param file_object [OPTIONAL-2] A object of "Buffer" class
 * @param file_name   [OPTIONAL-2] The name of a file (e.g., "A.png")
 * @param file_type   [OPTIONAL-2] The MIME type of a file (e.g., "image/png")
 * @returns A IPFS CIDv1 of the wrapped ERC-1155 "metadata.json"
 */
async function storeOneFile() {
    if (
        (arguments.length === 4) && 
        (typeof arguments[0] === "string") && 
        (typeof arguments[1] === "string") && 
        (typeof arguments[2] === "object") &&
        (fs.statSync(arguments[3], {throwIfNoEntry : false}) !== undefined)
    ) {
        return await storeOneFileWithPath(...arguments);
    }
    else if (
        (arguments.length === 6) && 
        (typeof arguments[0] === "string") && 
        (typeof arguments[1] === "string") && 
        (typeof arguments[2] === "object") &&
        (arguments[3].constructor.name === "Buffer") && 
        (typeof arguments[4] === "string") && 
        (arguments[5] in mime_db)
    ) {
        return await storeOneFileWithFile(...arguments);
    }
    else {
        console.log("Match none of correct input arguments.");
        return null;
    }
}

/**
 * @dev Any file name contained "~" will be automatically ignored during uploading.
 * @param title       A string title which describes the folder
 * @param description A detailed description of the folder
 * @param miscellanea Other custom properties in the NFT's metadata which must be a JSON {}
 * @param dir_path    A path of the folder which contains images
 * @returns A IPFS CIDv1 of the uploaded "folder" which contains many metadata.json
 */
async function storeFolder(title, description, miscellanea, dir_path) {
    const ipfs_cid = await uploadFolder(dir_path); // Upload images themselves
    const metadata_path = await wrapFolderMetadata(
        ipfs_cid, 
        dir_path, 
        title, 
        description, 
        miscellanea
    );
    
    const result = await uploadFolder(metadata_path); // Upload images' metadata
    return `ipfs://${result}`;
}

async function uploadFolder(dir_path) {
    const client      = new NFTStorage({token: process.env.NFTStorage}); // Create a 'client' object
    const dirent_list = fs.readdirSync(dir_path, {withFileTypes: true});
    var File_list     = []; // A list of NFTStorage's 'File' objects
    
    for(let idx = 0; idx < dirent_list.length; idx++) {
        const dirent = dirent_list[idx];
        
        if(dirent.isFile() && !(dirent.name.match(/~/))) {
            const file_path = `${dir_path}/${dirent.name}`;
            
            File_list.push(new File(
                [fs.readFileSync(file_path)], 
                path.basename(file_path), 
                {type: mime.getType(file_path)}
            ));
        }
    }
    
    return client.storeDirectory(File_list);
}

async function wrapFolderMetadata(ipfs_cid, dir_path, title, description, miscellanea) {
    const dirent_list   = fs.readdirSync(dir_path, {withFileTypes: true});
    const metadata_path = `${dir_path}/metadata`;
    
    if(!fs.existsSync(metadata_path)) {
        fs.mkdirSync(metadata_path);
    }
    
    for(let idx = 0; idx < dirent_list.length; idx++) {
        const dirent = dirent_list[idx];
        
        if(dirent.isFile() && !(dirent.name.match(/~/))) {
            var metadata = {
                image: `ipfs://${ipfs_cid}/${dirent.name}`,
                name: title,
                description: description,
                ...miscellanea
            };
            
            fs.writeFileSync(
                `${dir_path}/metadata/${(dirent.name.split('.'))[0]}.json`, 
                JSON.stringify(metadata)
            );
        }
    }
    
    return metadata_path;
}

/**
 * Upload one image to NFT.Storage service and return the IPFS CID of that image
 * @param file_path A valid directory path to that image file
 * @returns A IPFS CID of the image which points to the image itself (no more metadata.json)
 */
async function storeOneFileWithoutMetadata(file_path) {
    const client  = new NFTStorage({token: process.env.NFTStorage});
    const content = fs.readFileSync(file_path);
    const image   = new File(
        [content], // Must be a bit array or string! https://developer.mozilla.org/en-US/docs/Web/API/File/File#parameters
        path.basename(file_path), 
        {type: mime.getType(file_path)}
    );
    
    return await client.storeBlob(image);
}

/**
 * Upload all of files under a folder to NFT.Storage service and return IPFS CID
 * @param dir_path A valid directory path to that folder
 * @returns A IPFS CID of the folder which points to the folder itself (no more metadata.json)
 */
async function storeFolderWithoutMetadata(dir_path) {
    return await uploadFolder(dir_path);
}

// // Main function
// async function main() {
//     /***************************** Example usages *****************************/
//     console.log(
//         await storeOneFile(
//             "The alphabets", 
//             "This is a collection of alphabets.", 
//             {date: "2022-04-27"}, 
//             "images/random/A.png"
//     ));
//     console.log(
//         await storeOneFile(
//             "The alphabets", 
//             "This is a collection of alphabets.", 
//             {date: "2022-04-27"}, 
//             fs.readFileSync("images/random/A.png"), 
//             "A.png", 
//             mime.getType("images/random/A.png")
//     ));
//     console.log(
//         await storeOneFile(
//             "The alphabets", 
//             "This is a collection of alphabets.", 
//             {date: "2022-04-27"}, 
//             "images/random"
//     ));
//     /**************************************************************************/
// }
// main()
//     .then(() => {
//         process.exit(EXIT_SUCCESS);
//     })
//     .catch((error) => {
//         console.error(error);
//         process.exit(EXIT_FAILURE);
//     });

module.exports = {
    storeOneFileWithoutMetadata,
    storeFolderWithoutMetadata,
    storeOneFile,
    storeFolder
};