//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import './MSNFT.sol';
import './InterfaceRegister.sol';
import '../../test_erc20_tokens/BlackMark.sol';
import "../../../node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import '../../interfaces/IMSNFT.sol';
import '../../interfaces/IMetaMarketplace.sol';
import '../../interfaces/ICurrenciesERC20.sol';


contract Judge is ERC165, Ownable, BlackMark {

    using ERC165Checker for address;

    bytes4 public constant ID_IMSNFT = 0x5d08e584;
    bytes4 public constant ID_ICURRENCIESERC20 = 0x033a36bd;
    bytes4 public constant ID_IMETAMARKETPLACE = 0x958c8917;

    event Check(address licenseKeeper, uint[] mid);
    event BlackMarked(address blockedLicenseKeeper);

    constructor (string memory name_, string memory smbl_) BlackMark(name_, smbl_) {}

    function check(address _licenseKeeper, address _nft, address _checkContract) public onlyOwner() returns (bool) {
        address master_adr = _nft;
        require(master_adr != address(0), "MSNFT address equal 0x0");
        MSNFT master = MSNFT(master_adr);

        uint[] memory mid = master.getMasterIdByAuthor(_licenseKeeper);
        require(mid.length > 0, "User have no nft");

        for(uint i = 0; i < mid.length; i++) {
            if(mid[i] == 1) {
                emit Check(_licenseKeeper, mid);
                return true;
            }else{
                mintMark(_licenseKeeper);
                emit BlackMarked(_licenseKeeper);
                return false;
            }
        }
    }

    function isMSNFT(address msnftAddress) external view returns (bool) {
        return msnftAddress.supportsInterface(ID_IMSNFT);
    }

    function isCurrenciesERC20(address currenciesAddress) external view returns (bool) {
        return currenciesAddress.supportsInterface(ID_ICURRENCIESERC20);
    }

    function isMetaMarketplace(address metaMarketplaceAddress) external view returns (bool) {
        return metaMarketplaceAddress.supportsInterface(ID_IMETAMARKETPLACE);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == ID_IMSNFT || interfaceId == ID_ICURRENCIESERC20 || interfaceId == ID_IMETAMARKETPLACE;
    }

    function mintMark(address _to) public virtual override {
        super.mintMark(_to);
    }
}