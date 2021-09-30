// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./TestTokenERC20.sol";

// this contract is exist cause we need to deploy ERC20 test tokens by truffle deployer, so we need js artifacts for that purpose (which can't be created otherway cause OZ is in node_modules)
 contract USDC is TestTokenERC20 {

    constructor(string memory name_, string memory symbol_) TestTokenERC20(name_,symbol_) {}

   


}

 