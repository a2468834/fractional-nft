// Package
const { ethers } = require("ethers");
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);


// Constant
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;


/**
 * @dev
 * (1) Before running this script, please MAKE SURE that the following variable is well configured.
 * (2) You could get 'profile_URI' and 'token_URIs' by running 'profile-picture.js'.
 */
const payment_token_address = "0x190411Af0c058f08555B80C335d7009ad6791588"; // Wrapped Ether
var new_NFT_contract_config = [
    {
        name: "Lillian P. Span", 
        symbol: "LPS",
        address: null,
        mint_price: ethers.utils.parseUnits("0.01", "ether"),
        bp_convert_ratio: 100, // BPToken : PaymentToken = 100 : 1
        max_bp_ratio: 10000,   // BPtoken_{effective} <= PaymentToken * (10000 * 0.01%)
        profile_URI: "bafyreiavousnzuvzlvjkavma3cgxdnpym5dbqdi7leqha2ucmung5kknxy/metadata.json", 
        new_token_data: [
            {
                name: "TokenId_0",
                description: "This is a non-fungible token minted by freeMint().",
                imageURI: "bafybeibronwxcouzcsf5wj3djgrgucfijmw67kzmsbif2qzx6fimywnmtu/A.jpg"
            },
            {
                name: "TokenId_1",
                description: "This is a non-fungible token minted by freeMint().",
                imageURI: "bafybeibronwxcouzcsf5wj3djgrgucfijmw67kzmsbif2qzx6fimywnmtu/B.jpg"
            },
            {
                name: "TokenId_2",
                description: "This is a non-fungible token minted by freeMint().",
                imageURI: "bafybeibronwxcouzcsf5wj3djgrgucfijmw67kzmsbif2qzx6fimywnmtu/C.jpg"
            },
        ],
        new_token_data_publicMint: [
            {
                name: "TokenId_3",
                description: "This is a non-fungible token minted by publicMint().",
                imageURI: "bafybeibronwxcouzcsf5wj3djgrgucfijmw67kzmsbif2qzx6fimywnmtu/F.jpg"
            },
        ]
    },
    {
        name: "John J. Springer",
        symbol: "JJS",
        address: null,
        mint_price: ethers.utils.parseUnits("0.01", "ether"),
        bp_convert_ratio: 100, // BPToken : PaymentToken = 100 : 1
        max_bp_ratio: 10000,   // BPtoken_{effective} <= PaymentToken * (10000 * 0.01%)
        profile_URI: "bafyreife6xeydtoeemrw6zaamc6pnupkshb3xzungffe6tjxr476swbyou/metadata.json",
        new_token_data: [
            {
                name: "TokenId_0",
                description: "This is a non-fungible token minted by freeMint().",
                imageURI: "bafybeibronwxcouzcsf5wj3djgrgucfijmw67kzmsbif2qzx6fimywnmtu/D.jpg"
            },
            {
                name: "TokenId_1",
                description: "This is a non-fungible token minted by freeMint().",
                imageURI: "bafybeibronwxcouzcsf5wj3djgrgucfijmw67kzmsbif2qzx6fimywnmtu/E.jpg"
            }
        ]
    }
];


// Function
async function deployNFTFactory(signer) {
    const factory  = await hre.ethers.getContractFactory("NFTFactory", signer);
    const contract = await factory.deploy();
    await contract.deployTransaction.wait(5);
    
    console.log("------------------ NFT Factory -------------------");
    console.log(JSON.stringify(contract, null, 2));
    console.log("--------------------------------------------------");
    
    return contract.address;
}

async function deployBonusPoint(signer) {
    const arguments = ["HSNLab Bonus Point", "HSNLBP", 4];
    const factory  = await hre.ethers.getContractFactory("HSNLabBP", signer);
    const contract = await factory.deploy(...arguments);
    await contract.deployTransaction.wait(5);
    
    console.log("--------------- HSNLab Bonus Point ---------------");
    console.log(JSON.stringify(contract, null, 2));
    console.log("--------------------------------------------------");
    
    return contract.address;
}

/**
 * @param signer Typically, the signer of invoking NFTFactory's txn will be the "owner()"
 * @param manager The manager of the new created NFT contract
 */
async function createHSNLabNFT(signer, contract_address, name, symbol, paymentToken, bonusPointToken, manager) {
    const ABI = (require("../artifacts/contracts/nft-factory.sol/NFTFactory.json")).abi;
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    const txn_response = await contract.create(name, symbol, 100, paymentToken, bonusPointToken, manager);
    const txn_receipt  = await txn_response.wait(3);
    
    console.log("---------------- New NFT contract ----------------");
    console.log(JSON.stringify(txn_receipt, null, 2));
    console.log("--------------------------------------------------");
    
    const parsing_result = ethers.utils.defaultAbiCoder.decode(["address"], txn_receipt.events[2].topics[1]);
    return parsing_result[0];
}

/**
 * @param signer Typically, the signer of txn that invokes HSNLNFT will be the "owner()"
 */
async function setPublicVariables(signer, contract_address, profile_picture_URI, mint_price, bp_convert_ratio, max_bp_ratio) {
    const ABI = (require("../artifacts/contracts/hsnl-nft.sol/HSNLNFT.json")).abi;
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    var txn_response, txn_receipt;
    
    txn_response = await contract.setProfilePictureURI(profile_picture_URI);
    txn_receipt  = await txn_response.wait(2);
    console.log(JSON.stringify(txn_receipt, null, 2));
    
    txn_response = await contract.setMintPrice(mint_price);
    txn_receipt  = await txn_response.wait(2);
    console.log(JSON.stringify(txn_receipt, null, 2));
    
    txn_response = await contract.setBPConvertRatio(bp_convert_ratio);
    txn_receipt  = await txn_response.wait(2);
    console.log(JSON.stringify(txn_receipt, null, 2));
    
    txn_response = await contract.setMaxBPRatio(max_bp_ratio);
    txn_receipt  = await txn_response.wait(2);
    console.log(JSON.stringify(txn_receipt, null, 2));
}

/**
 * @param signer Typically, the signer of txn that invokes HSNLNFT will be the "owner()"
 */
async function invokeFreeMint(signer, contract_address, new_token_data) {
    const ABI = (require("../artifacts/contracts/hsnl-nft.sol/HSNLNFT.json")).abi;
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    var txn_response, txn_receipt;
    
    for(let i = 0; i < new_token_data.length; i++) {
        txn_response = await contract.freeMint(new_token_data[i]);
        txn_receipt  = await txn_response.wait();
        console.log(JSON.stringify(txn_receipt, null, 2));
    }
}

async function mintHSNLBP(signer, contract_address, amount) {
    const ABI = (require("../artifacts/contracts/bonus-point.sol/HSNLabBP.json")).abi;
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    txn_response = await contract.mint(signer.address, amount);
    txn_receipt  = await txn_response.wait();
    console.log(JSON.stringify(txn_receipt, null, 2));
}

async function depositWrappedEther(signer, contract_address, amount) {
    const ABI = [
        "function deposit() public payable"
    ];
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    txn_response = await contract.deposit({value: amount});
    txn_receipt  = await txn_response.wait();
    console.log(JSON.stringify(txn_receipt, null, 2));
}

async function approveWrappedEther(signer, contract_address, to_address, amount) {
    const ABI = [
        "function approve(address guy, uint256 wad)"
    ];
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    txn_response = await contract.approve(to_address, amount);
    txn_receipt  = await txn_response.wait();
    console.log(JSON.stringify(txn_receipt, null, 2));
}

async function getPermitSignature(signer, contract_address, spender, amount, deadline) {
    const ABI = (require("../artifacts/contracts/bonus-point.sol/HSNLabBP.json")).abi;
    const contract = new ethers.Contract(contract_address, ABI, signer);
    
    // According to the spec of EIP-2612
    const domain = {
        name: await contract.name(),
        version: '1',
        chainId: await signer.getChainId(),
        verifyingContract: contract.address
    };
    const types  = {
        Permit: [
            {
                name: 'owner',
                type: 'address'
            },
            {
                name: 'spender',
                type: 'address'
            },
            {
                name: 'value',
                type: 'uint256'
            },
            {
                name: 'nonce',
                type: 'uint256'
            },
            {
                name: 'deadline',
                type: 'uint256'
            }
        ]
    };
    const value = {
        owner: await signer.getAddress(),
        spender: spender,
        value: amount,
        nonce: await contract.nonces(await signer.getAddress()),
        deadline: deadline
    };
    
    return ethers.utils.splitSignature(
        await signer._signTypedData(domain, types, value)
    );
}

async function invokePublicMint(signer, nft_contract_address, hsnlbp_contract_address, new_token_data, bp_amount, deadline) {
    const ABI = (require("../artifacts/contracts/hsnl-nft.sol/HSNLNFT.json")).abi;
    const contract = new ethers.Contract(nft_contract_address, ABI, signer);
    
    const Alice_bp_amount = bp_amount;
    const Alice_ether     = ((await contract.mintPrice()).mul(1)).sub(Alice_bp_amount.div(await contract.bpConvertRatio()));
    const Alice_deadline  = deadline;    
    
    // Mint HSNLBP to Alice
    await mintHSNLBP(signer, hsnlbp_contract_address, Alice_bp_amount);

    // Deposit WETH
    await depositWrappedEther(signer, payment_token_address, Alice_ether);
    
    // Approve NFT contract with WETH balance
    await approveWrappedEther(signer, payment_token_address, nft_contract_address, Alice_ether);
    
    // Generate HSNLBP off-chain signature
    const {v, r, s} = await getPermitSignature(signer, hsnlbp_contract_address, nft_contract_address, Alice_bp_amount, Alice_deadline);
    
    // Invoke `publicMint()`
    const txn_response = await contract["publicMint((string,string,string),uint256,uint256,uint8,bytes32,bytes32)"](new_token_data, bp_amount, deadline, v, r, s);
    const txn_receipt  = await txn_response.wait();
    console.log(JSON.stringify(txn_receipt, null, 2));
}

// Main function
async function main() {
    const HRE_EOAs = await hre.ethers.getSigners();
    const provider = await hre.ethers.provider;
    const signer_Alice = HRE_EOAs[0]; // Alice
    const signer_Bob   = HRE_EOAs[1]; // Bob
    
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Address information");
    console.log("Alice:", signer_Alice.address);
    console.log("Bob:  ", signer_Bob.address);
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Deploy 2 main contracts");
    const NFTFactory_address = await deployNFTFactory(signer_Alice);
    const HSNLabBP_address   = await deployBonusPoint(signer_Alice);
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Upload contract codes to the Etherscan");
    try {
        await hre.run("verify:verify", {
            address: NFTFactory_address,
            constructorArguments: []
        });
    } catch(error) {
        if(error.message.includes("Reason: Already Verified")) {
            console.log("Contract has already been verified at Etherscan");
        }
        else console.error(error);
    }
    try {
        await hre.run("verify:verify", {
            address: HSNLabBP_address,
            constructorArguments: [
                "HSNLab Bonus Point", 
                "HSNLBP", 
                4
            ]
        });
    } catch(error) {
        if(error.message.includes("Reason: Already Verified")) {
            console.log("Contract has already been verified at Etherscan");
        }
        else console.error(error);
    }
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Create NFT contracts");
    for(let i = 0; i < new_NFT_contract_config.length; i++) {
        const NFT_config = [
            signer_Alice,
            NFTFactory_address,
            new_NFT_contract_config[i].name,
            new_NFT_contract_config[i].symbol,
            payment_token_address,
            HSNLabBP_address,
            signer_Alice.address
        ];
        new_NFT_contract_config[i].address = await createHSNLabNFT(...NFT_config);
    }
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Upload contract codes to the Etherscan");
    
    for(let i = 0; i < new_NFT_contract_config.length; i++) {
        try {
            await hre.run("verify:verify", {
                address: new_NFT_contract_config[i].address,
                constructorArguments: [
                    new_NFT_contract_config[i].name, 
                    new_NFT_contract_config[i].symbol, 
                    100, 
                    payment_token_address,
                    HSNLabBP_address
                ]
            }); 
        } catch(error) {
            if(error.message.includes("Reason: Already Verified")) {
                console.log("Contract has already been verified at Etherscan");
            }
            else console.error(error);
        }
    }
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Set public variables of NFT contracts");
    for(let i = 0; i < new_NFT_contract_config.length; i++) {
        const NFT_config = [
            signer_Alice,
            new_NFT_contract_config[i].address,
            new_NFT_contract_config[i].profile_URI,
            new_NFT_contract_config[i].mint_price,
            new_NFT_contract_config[i].bp_convert_ratio,
            new_NFT_contract_config[i].max_bp_ratio
        ];
        await setPublicVariables(...NFT_config);
    }
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Mint non-fungible tokens");
    for(let i = 0; i < new_NFT_contract_config.length; i++) {
        const NFT_config = [
            signer_Alice,
            new_NFT_contract_config[i].address,
            new_NFT_contract_config[i].new_token_data
        ];
        await invokeFreeMint(...NFT_config);
    }
    /**************************************************************************/
    console.log("--------------------------------------------------");
    console.log("[Info] Public mint non-fungible tokens");
    const Alice_bp_amount = (ethers.utils.parseUnits("0.001", "ether")).mul(new_NFT_contract_config[0].bp_convert_ratio);
    const Alice_deadline  = ethers.constants.MaxUint256;
    await invokePublicMint(
        signer_Alice,
        new_NFT_contract_config[0].address,
        HSNLabBP_address,
        new_NFT_contract_config[0].new_token_data_publicMint[0],
        Alice_bp_amount,
        Alice_deadline
    );
}

main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });


// Other code snippets
/******************************************************************************/
// // Get deployed contract address in advance
// await ethers.utils.getContractAddress({
//     from: signer.address, 
//     nonce: await signer.getTransactionCount()
// });
/******************************************************************************/
// // Example usage: await waitForKeyPress()
// async function waitForKeyPress() {
//     return new Promise((resolve, reject) => {
//         process.stdin.once("data", (data) => {
//             const byte_array = [...data];
            
//             if(byte_array.length > 0 && byte_array[0] === 3) {
//                 console.log("^C");
//                 process.exit(EXIT_FAILURE);
//             }
//             else {
//                 process.stdin.setRawMode(false);
//                 resolve();
//             }
//         });
//     });
// }
/******************************************************************************/