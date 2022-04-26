// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v3-core/contracts/interfaces/IERC20Minimal.sol";
import "./transfer-from-helper.sol";

/**
 *            _   __________  ____  __            __  _______ _   ____         
 *           / | / /_  __/ / / / / / /           / / / / ___// | / / /         
 *          /  |/ / / / / /_/ / / / /  ______   / /_/ /\__ \/  |/ / /          
 *         / /|  / / / / __  / /_/ /  /_____/  / __  /___/ / /|  / /___        
 *        /_/ |_/ /_/ /_/ /_/\____/           /_/ /_//____/_/ |_/_____/        
 */

interface IERC20Permit is IERC20Minimal {
    /******************************** EIP-2612 ********************************/
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
}

interface IHSNLBP is IERC20Permit {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

contract HSNLNFT is ReentrancyGuard, Ownable, ERC721, ERC721Enumerable, ERC721Royalty {
    /******************************** Structure *******************************/
    struct NewTokenData {
        string name;
        string description;
        string imageURI;
    }
    
    struct TokenInfo {
        string  name;
        string  description;
        uint256 date;
        string  imageURI;
    }
    
    /******************************** Constant ********************************/
    uint256 public immutable maxTokenSupply;
    address public immutable paymentToken;
    address public immutable bonusPointToken;
    
    /********************************** Event *********************************/
    //event Message(string message);
    
    /***************************** Public variable ****************************/
    mapping(uint256 => uint256) public depositBalance; // tokenId => # of deposit token of the NFT
    uint256 public mintPrice;                          // # of "paymentToken" tokens need to pay for each new minted NFT
    uint240 public bpConvertRatio;                     // "xxx : 1" could be equal to the payment tokens
    uint16  public maxBPRatio;                         // maximum "basis point" ratio (0.01%) of BP tokens which is proportional to "(mintPrice * mintAmount)"
    
    /**************************** Private variable ****************************/
    uint256 private _currTokenId;                       // The smallest un-used 'tokenId'
    string  private _profilePictureURI;                 // The profile picture of this contract
    // string  private _defaultTokenURI;
    mapping(address => uint256) private _freeMintLimit; // address => # of approved free minting tokens
    mapping(uint256 => TokenInfo) private _tokenURIs;
    
    /******************************* Constructor ******************************/
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 maxSupply, 
        address payment,
        address bonusPoint
    ) ERC721(name, symbol) {
        maxTokenSupply  = maxSupply;
        paymentToken    = payment;
        bonusPointToken = bonusPoint;
    }
    
    /****************************** View function *****************************/
    function getProfilePictureURI() public view returns (string memory) {
        return _profilePictureURI;
    }
    
    function getDepositBalanceByTokenId(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "ERC721: caller query for nonexistent token.");
        
        // if((owner() != _msgSender()) || (!_isApprovedOrOwner(_msgSender(), tokenId))) {
        //     revert("You are not allowed to know the deposit balance of this NFT.");
        // }
        
        return depositBalance[tokenId];
    }
    
    function getFreeMintLimit(address who) public view returns (uint256) {
        return _freeMintLimit[who];
    }
    
    /***************************** Public function ****************************/
    function freeMint(NewTokenData calldata _newTokenData) public returns (bool) {
        require(_freeMintLimit[_msgSender()] > 0, "You are not allowed for free minting NFT.");
        
        _freeMintLimit[_msgSender()]--;
        _mintToken(_newTokenData);
        
        return true;
    }
    
    function publicMint(
        NewTokenData calldata _newTokenData, 
        uint256 bpAmount
    ) public returns (bool) {
        bool success;
        uint256 paymentAmount;
        
        (success, paymentAmount) = isQualifiedMint(_msgSender(), 1, bpAmount);
        require(success, "You are not qualified for minting NFT.");
        
        success = collectBuyerToken(_msgSender(), paymentAmount, bpAmount);
        require(success, "Transfer payment or bonus point tokens failed.");
        
        _mintToken(_newTokenData);
        return true;
    }
    
    function publicMint(
        NewTokenData calldata _newTokenData, 
        uint256 bpAmount, 
        uint256 deadline, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) public returns (bool) {
        bool success;
        uint256 paymentAmount;
        
        (success, paymentAmount) = isQualifiedMint(_msgSender(), 1, bpAmount);
        require(success, "You are not qualified for minting NFT.");
        
        success = collectBuyerToken(_msgSender(), paymentAmount, bpAmount, deadline, v, r, s);
        require(success, "Transfer payment or bonus point tokens failed.");
        
        _mintToken(_newTokenData);
        return true;
    }
    
    function burnToken(uint256 tokenId) public returns (bool) {
        return _burnToken(tokenId);
    }
    
    /******************* Public function (w/ access control) ******************/
    function addWhitelist(address[] calldata addressList, int8 approvedAmount) public onlyOwner {
        uint256 amount;
        
        if(approvedAmount < 0) {
            amount = type(uint256).max;
        }
        else if(approvedAmount > 0){
            amount = uint256(int256(approvedAmount));
        }
        else {
            revert("Please give a non-zero approved amount.");
        }
        
        for(uint256 i = 0; i < addressList.length;) {
            _freeMintLimit[addressList[i]] = amount;
            unchecked{i++;}
        }
    }
    
    function removeWhitelist(address[] calldata addressList) public onlyOwner {
        for(uint256 i = 0; i < addressList.length;) {
            _freeMintLimit[addressList[i]] = 0;
            unchecked{i++;}
        }
    }
    
    function setProfilePictureURI(string calldata newProfilePictureURI) public onlyOwner returns (bool) {
        _profilePictureURI = newProfilePictureURI;
        return true;
    }
    
    /**
     * @param receiver The royalty fee received address
     * @param feeNumerator E.g., setting 30 means royalty is "30"/10000 = 0.3%
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner returns (bool) {
        _setDefaultRoyalty(receiver, feeNumerator);
        return true;
    }
    
    function setMintPrice(uint256 _mintPrice) public onlyOwner returns (bool) {
        mintPrice = _mintPrice;
        return true;
    }
    
    function setBPConvertRatio(uint240 newBPConvertRatio) public onlyOwner returns (bool) {
        bpConvertRatio = newBPConvertRatio;
        return true;
    }
    
    function setMaxBPRatio(uint16 newMaxBPRatio) public onlyOwner returns (bool) {
        maxBPRatio = newMaxBPRatio;
        return true;
    }
    
    /**************************** Internal function ***************************/
    function isQualifiedMint(
        address buyer, 
        uint256 mintAmount, 
        uint256 bpAmount
    ) internal view returns (bool, uint256) {
        // Check `buyer`'s bonus point token balance
        if(IHSNLBP(bonusPointToken).balanceOf(buyer) < bpAmount) {
            return (false, type(uint256).max);
        }
        
        // Discount payment token amount with bonus point token
        uint256 paymentAmount = mintPrice * mintAmount;
        if((bpAmount / uint256(bpConvertRatio)) >= (paymentAmount * uint256(maxBPRatio) / 10000)) {
            return (false, type(uint256).max);
        }
        
        paymentAmount = paymentAmount - (bpAmount / uint256(bpConvertRatio));
        return (true, paymentAmount);
    }
    
    function collectBuyerToken(
        address buyer, 
        uint256 paymentAmount, 
        uint256 bonusPointAmount
    ) internal nonReentrant returns (bool) {
        // Transfers (payment & bonus point) tokens to this contract, assume that buyer has given allownace[buyer][address(this)]
        TransferFromHelper.safeTransferFrom(paymentToken, buyer, address(this), paymentAmount);
        TransferFromHelper.safeTransferFrom(bonusPointToken, buyer, address(this), bonusPointAmount);
        
        // Burns the bonus point token
        try IHSNLBP(bonusPointToken).burn(bonusPointAmount) {}
        catch {
            revert("Error: failed to burn the bonus point tokens");
        }
        
        return true;
    }
    
    // Overload of {collectBuyerToken} that receives EIP-2612 payloads
    function collectBuyerToken(
        address buyer, 
        uint256 paymentAmount, 
        uint256 bonusPointAmount, 
        uint256 deadline, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) internal nonReentrant returns (bool) {
        // Transfers payment token to this contract (expected un-supporting EIP-2612)
        TransferFromHelper.safeTransferFrom(paymentToken, buyer, address(this), paymentAmount);
        
        // Transfers bonus point token to this contract (with EIP-2612, aka onchain approval)
        try IHSNLBP(bonusPointToken).permit(buyer, address(this), bonusPointAmount, deadline, v, r, s) {}
        catch {
            revert("Error: failed to get approval of the bonus point tokens");
        }
        TransferFromHelper.safeTransferFrom(bonusPointToken, buyer, address(this), bonusPointAmount);
        
        // Burns the bonus point token
        try IHSNLBP(bonusPointToken).burn(bonusPointAmount) {}
        catch {
            revert("Error: failed to burn the bonus point tokens");
        }
        
        return true;
    }
    
    function constructTokenURI(uint256 tokenId) internal view returns (string memory) {
        TokenInfo memory tokenInfo = _tokenURIs[tokenId];
        
        return
            string(
                abi.encodePacked(
                    'data:application/json;base64,',
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                tokenInfo.name,
                                '", "description":"',
                                tokenInfo.description,
                                '", "date":"',
                                Strings.toString(tokenInfo.date),
                                '", "image": "',
                                tokenInfo.imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
    
    /**************************** Private function ****************************/
    function _mintToken(NewTokenData calldata _newTokenData) private nonReentrant returns (bool) {
        require(totalSupply() < maxTokenSupply, "There are too many minted NFT.");
        
        uint256 newTokenId;
        unchecked {
            newTokenId = (_currTokenId++);
        }
        
        _safeMint(_msgSender(), newTokenId);
        _setTokenURI(newTokenId, _newTokenData);
        
        return true;
    }
    
    function _burnToken(uint256 tokenId) private nonReentrant returns (bool) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "You cannot burn this NFT.");
        
        uint256 transferAmount = depositBalance[tokenId];
        depositBalance[tokenId] = 0;
        
        _burn(tokenId);
        
        if(transferAmount > 0) {
            TransferFromHelper.safeTransferFrom(paymentToken, address(this), _msgSender(), transferAmount);
        }
        
        return true;
    }
    
    function _setTokenURI(uint256 tokenId, NewTokenData calldata _newTokenData) private {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        
        require(bytes(_newTokenData.name).length <= 64, "New minting NFT's `name` is too long.");
        require(bytes(_newTokenData.description).length <= 64, "New minting NFT's `description` is too long.");
        
        TokenInfo storage tokenInfo = _tokenURIs[tokenId];
        
        tokenInfo.name        = _newTokenData.name;
        tokenInfo.description = _newTokenData.description;
        tokenInfo.date        = block.timestamp;
        tokenInfo.imageURI    = _newTokenData.imageURI;
    }
    
    /********** Override function (multiple base contracts define it) *********/
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721Royalty) 
    {
        super._burn(tokenId);
        
        TokenInfo storage tokenInfo = _tokenURIs[tokenId]; 
        
        if(bytes(tokenInfo.name).length != 0) {
            delete tokenInfo.name;
        }
        
        if(bytes(tokenInfo.description).length != 0) {
            delete tokenInfo.description;
        }
        
        delete tokenInfo.date;
        
        if(bytes(tokenInfo.imageURI).length != 0) {
            delete tokenInfo.imageURI;
        }
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) 
        internal 
        override(ERC721, ERC721Enumerable) 
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        return constructTokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}