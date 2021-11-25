pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT


import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";



contract InterfaceRegister {

    bytes4 public _INTERFACE_ID_MSNFT;
    bytes4 public _INTERFACE_ID_IERC721ENUMERABLE;  // should be 0x780e9d63
   // bytes4 private _INTERFACE_ID_ERC721METADATA = 0x5b5e139f; // 0x5b5e139f
    bytes4 public _INTERFACE_ID_IERC721METADATA; // 0x5b5e139f
    bytes4 public _INTERFACE_ID_IERC721;    // 0x7aa5391d  -- @WARN -- MAY BE *WRONG*       should be eqal 0x80ac58cd


    function getInterfaceEnumerable() public view returns (bytes4) {
        return _INTERFACE_ID_IERC721ENUMERABLE;
    }

    function getInterfaceMetadata() public view returns (bytes4) {
        return _INTERFACE_ID_IERC721METADATA;
    }

    function getInterface721() public view returns (bytes4) {
        return _INTERFACE_ID_IERC721;
    }

    function calculateIERC721Enumarable() public pure returns (bytes4) {

        IERC721Enumerable i;
        return i.totalSupply.selector ^ i.tokenOfOwnerByIndex.selector ^ i.tokenByIndex.selector;
    }


    function calculateIERC721Metadata() public pure returns (bytes4) {

        IERC721Metadata i;
        return i.name.selector ^ i.symbol.selector ^ i.tokenURI.selector;
    }


    function calculateIERC721() public pure returns (bytes4) {
        //  wrong calculation, need to fix.. use IERC721Enumarable interface for MSNFT
        IERC721 i;
        return i.balanceOf.selector ^ i.ownerOf.selector ^ i.transferFrom.selector ^ i.approve.selector ^ i.getApproved.selector ^ i.setApprovalForAll.selector ^ i.isApprovedForAll.selector;

    }

    constructor() {

        _INTERFACE_ID_IERC721ENUMERABLE = calculateIERC721Enumarable();
        _INTERFACE_ID_IERC721METADATA = calculateIERC721Metadata();
        _INTERFACE_ID_IERC721 = 0x80ac58cd; // hardcode is not the best way to do it but
    }


}