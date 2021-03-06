// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// this contract is exist cause we need to deploy ERC20 test tokens by truffle deployer, so we need js artifacts for that purpose (which can't be created otherway cause OZ is in node_modules)

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";


 contract TestUSDT is ERC20, Ownable {

    constructor(string memory name_, string memory symbol_) ERC20(name_,symbol_) {
       
       // We should mint token during tests, not inside contracts itself
       
       // uint amount = 1 * 1e6;
       // super._mint(msg.sender, amount);
    }




    function MintERC20 (address to, uint amount) public onlyOwner{
        super._mint(to, amount);
    }


    function decimals() public view virtual override returns (uint8) {
        return 6; // USDT decimal = 6
    }

}

 