pragma solidity ^0.8.0;
//"SPDX-License-Identifier: MIT"

// this contract is exist cause we need to deploy ERC20 test tokens by truffle deployer, so we need js artifacts for that purpose (which can't be created otherway cause OZ is in node_modules)

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";


 contract TestTokenERC20 is ERC20, Ownable {

    constructor(string memory name_, string memory symbol_) ERC20(name_,symbol_) {}

    function MintERC20 (address to, uint amount) public onlyOwner{
        super._mint(to, amount);
    }


}

 