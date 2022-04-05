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
    address public nft;
    uint256 public licensemasterid;

    event Check(address licenseKeeper);
    event BlackMarked(address blockedLicenseKeeper);

    constructor(string memory name_, string memory smbl_)
        BlackMark(name_, smbl_)
    {}

    function check(address _checkContract, address _nft) public returns (bool) {
        if (
            isMSNFT(_checkContract) ||
            isCurrenciesERC20(_checkContract) ||
            isMetaMarketplace(_checkContract)
        ) {
            address licenseKeeper = _getUserAddress(_checkContract);
            bool boughtLicense = _checkforlicense(_checkContract,_nft);

            if (boughtLicense) {
                emit Check(licenseKeeper);
            } else {
                mintMark(licenseKeeper);
                emit BlackMarked(licenseKeeper);
            }
        }
    }

    function _checkforlicense(address _checkContract, address _nft)
        internal
        onlyOwner
        returns (bool)
    {
        address master_adr = _nft;
        require(master_adr != address(0), "MSNFT address equal 0x0");
        MSNFT master = MSNFT(master_adr);
        address _licenseKeeper = _getUserAddress(_checkContract);

        uint256[] memory mid = master.getMasterIdByAuthor(_licenseKeeper);
        require(mid.length > 0, "User have no nft");
        for (uint256 i = 0; i < mid.length; i++) {
            if (i == licensemasterid) {
                return true;
            }
        }
    }

    function isMSNFT(address msnftAddress) public view returns (bool) {
        bool success = MSNFT(msnftAddress).supportsInterface(ID_IMSNFT);
        return success;
    }

    function isCurrenciesERC20(address currenciesAddress)
        public
        view
        returns (bool)
    {
        bool success = CurrenciesERC20(currenciesAddress).supportsInterface(
            ID_ICURRENCIESERC20
        );
        return success;
    }

    function isMetaMarketplace(address metaMarketplaceAddress)
        public
        view
        returns (bool)
    {
        bool success = MetaMarketplace(metaMarketplaceAddress)
            .supportsInterface(ID_IMETAMARKETPLACE);
        return success;
    }

    function _getUserAddress(address _contractaddress)
        internal
        view
        returns (address)
    {
        /*  (bool _success, bytes memory data) = _contractaddress.staticcall(abi.encode(bytes4(keccak256("owner()"))));
        (address _useraddress) = abi.decode(data, (address)); */

        Ownable contract_instance = Ownable(_contractaddress);
        address _useraddress = contract_instance.owner();
        return _useraddress;
    }

    function mintMark(address _to) public virtual override {
        super.mintMark(_to);
    }

    function setNft(address _nft) public onlyOwner {
        nft = _nft;
    }

    function getNft() public onlyOwner returns (address nft) {
        return nft;
    }

    function setLicensemasterid(uint256 _licensemasterid) public onlyOwner {
        licensemasterid = _licensemasterid;
    }

    function getLicensemasterid()
        public
        onlyOwner
        returns (uint256 licensemasterid)
    {
        return licensemasterid;
    }
}
