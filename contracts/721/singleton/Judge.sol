//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./MSNFT.sol";
import "./MetaMarketplace.sol";
import "../../test_erc20_tokens/BlackMark.sol";
import "../../interfaces/IMSNFT.sol";
import "../../interfaces/IMetaMarketplace.sol";
import "../../interfaces/ICurrenciesERC20.sol";

contract Judge is Ownable, BlackMark {
    bytes4 public constant ID_IMSNFT = type(IMSNFT).interfaceId;
    bytes4 public constant ID_IMETAMARKETPLACE = type(IMetaMarketplace).interfaceId;
    bytes4 public constant ID_ICURRENCIESERC20 = type(ICurrenciesERC20).interfaceId;

    event Check(address licenseKeeper, uint256[] mid);
    event BlackMarked(address blockedLicenseKeeper);

    constructor(string memory name_, string memory smbl_)
        BlackMark(name_, smbl_)
    {}

    function check(
        address _licenseKeeper,
        address _nft,
        address _checkContract
    ) public onlyOwner returns (bool) {
        address master_adr = _nft;
        require(master_adr != address(0), "MSNFT address equal 0x0");
        MSNFT master = MSNFT(master_adr);

        uint256[] memory mid = master.getMasterIdByAuthor(_licenseKeeper);
        require(mid.length > 0, "User have no nft");

        for (uint256 i = 0; i < mid.length; i++) {
            if (mid[i] == 1) {
                emit Check(_licenseKeeper, mid);
                return true;
            } else {
                mintMark(_licenseKeeper);
                emit BlackMarked(_licenseKeeper);
                return false;
            }
        }
    }

    function isMSNFT(address msnftAddress) external view returns (bool) {
        bool success = MSNFT(msnftAddress).supportsInterface(ID_IMSNFT);
        return success;
    }

    function isCurrenciesERC20(address currenciesAddress)
        external
        view
        returns (bool)
    {
        bool success = CurrenciesERC20(currenciesAddress).supportsInterface(
            ID_ICURRENCIESERC20
        );
        return success;
    }

    function isMetaMarketplace(address metaMarketplaceAddress)
        external
        view
        returns (bool)
    {
        bool success = MetaMarketplace(metaMarketplaceAddress)
            .supportsInterface(ID_IMETAMARKETPLACE);
        return success;
    }

    function mintMark(address _to) public virtual override {
        super.mintMark(_to);
    }
}
