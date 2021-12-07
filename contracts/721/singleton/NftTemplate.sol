// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract NftTemplate is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    event NewTokenCreated(address receiver, uint tokenId);
    constructor(string memory name_, string memory smbl_) ERC721(name_,smbl_) ERC721Enumerable() {}

    function mintNft(address receiver) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();
        _mint(receiver, newNftTokenId);
        emit NewTokenCreated(receiver, newNftTokenId);
        return newNftTokenId;
    }
}