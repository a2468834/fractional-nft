// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@rari-capital/solmate/src/tokens/ERC20.sol";

/**
 *            _   __________  ____  __            __  _______ _   ____         
 *           / | / /_  __/ / / / / / /           / / / / ___// | / / /         
 *          /  |/ / / / / /_/ / / / /  ______   / /_/ /\__ \/  |/ / /          
 *         / /|  / / / / __  / /_/ /  /_____/  / __  /___/ / /|  / /___        
 *        /_/ |_/ /_/ /_/ /_/\____/           /_/ /_//____/_/ |_/_____/        
 */

contract HSNLabBP is Ownable, ERC20 {
    /******************************* Constructor ******************************/
    constructor(
        string memory _name,   // "HSNLab Bonus Point"
        string memory _symbol, // "HSNLBP"
        uint8 _decimals        // 4
    ) ERC20(_name, _symbol, _decimals) {
        _mint(msg.sender, 10000 * (10 ** _decimals));
    }
    
    /******************************** Function ********************************/
    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }
    
    function burn(uint256 amount) public returns (bool) {
        _burn(_msgSender(), amount);
        return true;
    }
}