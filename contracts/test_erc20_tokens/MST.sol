// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TestTokenERC20.sol";

// this contract exists cause we need to deploy ERC20 test tokens by truffle deployer, so we need js artifacts for that purpose (which can't be created otherway cause OZ is in node_modules)
 contract MST is TestTokenERC20 {

    constructor(string memory name_, string memory symbol_) TestTokenERC20(name_,symbol_) {}
/*
 @TODO: delete the function below before release
 
 LINES 15-17 ARE HERE FOR TESTING PURPOSES ONLY! IT'S IMPORTANT TO REMOVE THEM AFTERWARDS!
 */
    function MintERC20 (address to, uint amount) public override{
        super._mint(to, amount);
    }
}

 