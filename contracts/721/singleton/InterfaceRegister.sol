pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract InterfaceRegister {

    bytes4 public _INTERFACE_ID_MSNFT;
    bytes4 public _INTERFACE_ID_META_MARKETPLACE;
    bytes4 public _INTERFACE_ID_CURRENCIES;
    bytes4 public _INTERFACE_ID_TOKEN_SALE;

    bytes4 public _INTERFACE_ID_IERC721ENUMERABLE; // should be 0x780e9d63
    // bytes4 private _INTERFACE_ID_ERC721METADATA = 0x5b5e139f; // 0x5b5e139f
    bytes4 public _INTERFACE_ID_IERC721METADATA; // 0x5b5e139f
    bytes4 public _INTERFACE_ID_IERC721; // 0x80ac58cd

    function getInterfaceEnumerable() public view returns (bytes4) {
        return _INTERFACE_ID_IERC721ENUMERABLE;
    }

    function getInterfaceMetadata() public view returns (bytes4) {
        return _INTERFACE_ID_IERC721METADATA;
    }

    function getInterface721() public view returns (bytes4) {
        return _INTERFACE_ID_IERC721;
    }

    function getInterfaceMSNFT() public view returns (bytes4) {
        return _INTERFACE_ID_MSNFT;
    }

    function getInterfaceCurrenciesERC20() public view returns (bytes4) {
        return _INTERFACE_ID_CURRENCIES;
    }

    function getInterfaceMetaMarketplace() public view returns (bytes4) {
        return _INTERFACE_ID_META_MARKETPLACE;
    }
    
    function getInterfaceTokenSaleSingleton() public view returns (bytes4) {
        return _INTERFACE_ID_TOKEN_SALE;
    }

    function calculateIERC721Enumarable() public pure returns (bytes4) {
        IERC721Enumerable i;
        return
            i.totalSupply.selector ^
            i.tokenOfOwnerByIndex.selector ^
            i.tokenByIndex.selector;
    }

    function calculateIERC721Metadata() public pure returns (bytes4) {
        IERC721Metadata i;
        return i.name.selector ^ i.symbol.selector ^ i.tokenURI.selector;
    }

    function calculateIERC721() public pure returns (bytes4) {
        return
            bytes4(keccak256("balanceOf(address)")) ^
            bytes4(keccak256("ownerOf(uint256)")) ^
            bytes4(keccak256("approve(address,uint256)")) ^
            bytes4(keccak256("getApproved(uint256)")) ^
            bytes4(keccak256("setApprovalForAll(address,bool)")) ^
            bytes4(keccak256("isApprovedForAll(address,address)")) ^
            bytes4(keccak256("transferFrom(address,address,uint256)")) ^
            bytes4(keccak256("safeTransferFrom(address,address,uint256)")) ^
            bytes4(
                keccak256("safeTransferFrom(address,address,uint256,bytes)")
            );
    }

    function calculateMSNFT() public pure returns (bytes4) {
        return
            bytes4(keccak256("PlugCrowdSale(address,uint256,address)")) ^
            bytes4(keccak256("createMasterCopy(string,address,string,uint256)")) ^
            bytes4(keccak256("get_rarity(uint256)")) ^
            bytes4(keccak256("EmitItem(address,uint256,uint256)")) ^
            bytes4(keccak256("buyItem(address,uint256,uint256)")) ^
            bytes4(keccak256("transferAuthorship(uint256)")) ^
            bytes4(keccak256("transferFrom(address,address,uint256)")) ^
            bytes4(keccak256("safeTransferFrom(address,address,uint256)")) ^
            bytes4(keccak256("safeTransferFrom(address,address,uint256,bytes)")) ^
            bytes4(keccak256("getItemSale(uint256)")) ^
            bytes4(keccak256("get_author(uint256)")) ^
            bytes4(keccak256("get_master_id_by_link(string)")) ^
            bytes4(keccak256("get_author_by_link(string)")) ^
            bytes4(keccak256("get_author_by_token_id(uint256)")) ^
            bytes4(keccak256("getMasterIdByAuthor(address)")) ^
            bytes4(keccak256("getInfobyItemId(uint256)")) ^
            bytes4(keccak256("updateFactoryAddress(address)")) ^
            bytes4(keccak256("getFactoryAddress()")) ^
            bytes4(keccak256("supportsInterface(bytes4)"));
    }

    function calculateCurrenciesERC20() public pure returns (bytes4) {
        return
            bytes4(keccak256("AddCustomCurrency(address)")) ^ bytes4(keccak256("get_hardcoded_currency(CurrencyERC20)"));
    }

    function calculateMetaMarketplace() public pure returns (bytes4) {
        return
            bytes4(keccak256("makeSellOffer(uint256,uint256,address)")) ^
            bytes4(keccak256("withdrawSellOffer(address,uint256)")) ^
            bytes4(keccak256("purchase(address,uint256,CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("makeBuyOffer(address,uint256,CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("withdrawBuyOffer(address,uint256,CurrenciesERC20.CurrencyERC20)")) ^
            bytes4(keccak256("acceptBuyOffer(address,uint256,CurrenciesERC20.CurrencyERC20)")) ^
            bytes4(keccak256("getLastPrice(address,uint256,CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("makeBuyOffer(address,uint256)"));
    }

    function calculateTokenSaleSingleton() public pure returns (bytes4) {
         return
            bytes4(keccak256("token()")) ^
            bytes4(keccak256("wallet(uint256)")) ^
            bytes4(keccak256("getBalances(CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("sale_limit(uint256)")) ^
            bytes4(keccak256("sold_count(uint256)")) ^
            bytes4(keccak256("isInitialized(uint256)")) ^
            bytes4(keccak256("get_price(CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("get_currency(CurrenciesERC20.CurrencyERC20)")) ^
            bytes4(keccak256("check_sale_limit(uint256,uint256)")) ^
            bytes4(keccak256("buyTokens(address,uint256,CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("getWeiAmount(uint256,CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("withDrawFunds(CurrenciesERC20.CurrencyERC20,uint256)")) ^
            bytes4(keccak256("closeCrowdsale(uint256)"));
    }

    constructor() {
        _INTERFACE_ID_IERC721ENUMERABLE = calculateIERC721Enumarable();
        _INTERFACE_ID_IERC721METADATA = calculateIERC721Metadata();
        _INTERFACE_ID_IERC721 = calculateIERC721();
        _INTERFACE_ID_MSNFT = calculateMSNFT();
        _INTERFACE_ID_META_MARKETPLACE = calculateMetaMarketplace();
        _INTERFACE_ID_CURRENCIES = calculateCurrenciesERC20();
        _INTERFACE_ID_TOKEN_SALE = calculateTokenSaleSingleton();
    }
}
