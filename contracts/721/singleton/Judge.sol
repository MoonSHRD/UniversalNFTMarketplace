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

    event Check(address licenseKeeper, uint[] mid, bool status);
    event BlackMarked(address blockedLicenseKeeper);

    constructor (string memory name_, string memory smbl_) BlackMark(name_, smbl_) {}

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IMSNFT).interfaceId || super.supportsInterface(interfaceId);
     }

    function check(address _licenseKeeper, address _nft, address _checkContract) public onlyOwner() returns (bool) {
        address master_adr = _nft;
        require(master_adr != address(0), "MSNFT address equal 0x0");
        MSNFT master = MSNFT(master_adr);

        bytes4[] memory interfaceIds = new bytes4[](3);

        interfaceIds[0] = 0x5d08e584;
        interfaceIds[1] = 0x958c8917;
        interfaceIds[2] = 0x033a36bd;

        bool usingOurInterfaces = ERC165Checker.supportsInterface(_checkContract, interfaceIds[1]);

        uint[] memory mid = master.getMasterIdByAuthor(_licenseKeeper);
        require(mid.length > 0, "User have no nft");

        for(uint i = 0; i < mid.length; i++) {
            if(mid[i] == 1) {
                emit Check(_licenseKeeper, mid, usingOurInterfaces);
                return true;
            }else{
                mintMark(_licenseKeeper);
                emit BlackMarked(_licenseKeeper);
                return false;
            }
        }
    }

    function mintMark(address _to) public virtual override {
        super.mintMark(_to);
    }
}