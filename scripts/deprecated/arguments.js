module.exports = [
    "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",                           // LINK token address
    "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",                           // VRF coordinator
    "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",   // Key hash
    "100000000000000000"                                                    // Fee: 0.1 LINK
];
//$ yarn hardhat verify --network rinkeby --constructor-args scripts/arguments.js "0x337EE8070845771655446682Ced48d30eB7F68B5"