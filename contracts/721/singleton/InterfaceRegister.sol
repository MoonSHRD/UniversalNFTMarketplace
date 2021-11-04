pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";



contract InterfaceRegister {

    function calculateIERC721Enumarable() public pure returns (bytes4) {

        IERC721Enumerable i;
        return i.totalSupply.selector ^ i.tokenOfOwnerByIndex.selector ^ i.tokenByIndex.selector;
    }


    function calculateIERC721Metadata() public pure returns (bytes4) {

        IERC721Metadata i;
        return i.name.selector ^ i.symbol.selector ^ i.tokenURI.selector;
    }


    function calculateIERC721() public pure returns (bytes4) {

        IERC721 i;
        return i.balanceOf.selector ^ i.ownerOf.selector ^ i.transferFrom.selector ^ i.approve.selector ^ i.getApproved.selector ^ i.setApprovalForAll.selector ^ i.isApprovedForAll.selector;

    }

}