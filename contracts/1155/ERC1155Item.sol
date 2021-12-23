// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// this contract is exist cause we need to deploy ERC20 test tokens by truffle deployer, so we need js artifacts for that purpose (which can't be created otherway cause OZ is in node_modules)
 contract ERC1155Item is ERC1155 {
    uint256 public itemsCount;

    constructor() public ERC1155("") {
        itemsCount = 0;
    }

    function addNewItem(uint256 initialSupply) external {
        itemsCount++;
        uint256 itemTokenClassId = itemsCount;
        _mint(msg.sender, itemTokenClassId, initialSupply, "");        
    }



}