// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./hsnl-nft.sol";

/**
 *            _   __________  ____  __            __  _______ _   ____         
 *           / | / /_  __/ / / / / / /           / / / / ___// | / / /         
 *          /  |/ / / / / /_/ / / / /  ______   / /_/ /\__ \/  |/ / /          
 *         / /|  / / / / __  / /_/ /  /_____/  / __  /___/ / /|  / /___        
 *        /_/ |_/ /_/ /_/ /_/\____/           /_/ /_//____/_/ |_/_____/        
 */

// Owner is "Alice"

contract NFTFactory is Ownable {
    /***************************** Public variable ****************************/
    uint256 public topIndex; // The smallest un-used index of 'nftContracts'
    
    /**************************** Private variable ****************************/
    HSNLNFT[] private _nftContracts;
    
    /********************************** Event *********************************/
    event CreateNewNFT(address indexed _address, uint256 indexed _index);
    
    /******************************* Constructor ******************************/
    constructor() {}
    
    /****************************** View function *****************************/
    function getContractAddressByIndex(uint256 index) public view returns (address) {
        require(index < topIndex, "You cannot query for nonexistent contract.");
        return address(_nftContracts[index]);
    }
    
    function getManagerAddressByIndex(uint256 index) public view returns (address) {
        require(index < topIndex, "You cannot query for nonexistent contract.");
        return _nftContracts[index].owner();
    }
    
    /***************************** Public function ****************************/
    function create(
        string calldata name, 
        string calldata symbol, 
        uint256 maxTokenSupply, 
        address paymentToken,
        address bonusPointToken,
        address manager
    ) public onlyOwner {
        HSNLNFT newNFT = new HSNLNFT(
            name, 
            symbol, 
            maxTokenSupply, 
            paymentToken, 
            bonusPointToken
        );
        _nftContracts.push(newNFT);
        
        // Grant "Alice" & "Bob" the un-bounded minting role
        address[] memory addressList = new address[](2);
        addressList[0] = owner(); // Alice
        addressList[1] = manager; // Bob
        newNFT.addWhitelist(addressList, -1);
        
        // Transfer ownership from "Alice" to "Bob"
        newNFT.transferOwnership(manager);
        
        emit CreateNewNFT(address(newNFT), topIndex);
        topIndex++;
    }
}