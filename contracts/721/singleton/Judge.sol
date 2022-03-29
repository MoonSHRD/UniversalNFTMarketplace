//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import './MSNFT.sol';
import './InterfaceRegister.sol';
import '../../test_erc20_tokens/BlackMark.sol';
import "../../../node_modules/@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";


contract Judge is Ownable, InterfaceRegister {

    event Check(address licenseKeeper, uint[] mid);

    constructor () {}

    function check(address _licenseKeeper, address _nft) public onlyOwner() returns (bool) {
        address master_adr = _nft;
        bytes4[] memory interfaceIds = new bytes4[](3);
        interfaceIds[0] = 0x5d08e584;
        interfaceIds[1] = 0x958c8917;
        interfaceIds[2] = 0x033a36bd;
        interfaceIds[3] = 0xeaf92d7a;
        bool usingOurInterfaces = ERC165Checker.supportsAllInterfaces(_licenseKeeper, interfaceIds);

        require(master_adr != address(0), "MSNFT address equal 0x0");
        MSNFT master = MSNFT(master_adr);
        uint[] memory mid = master.getMasterIdByAuthor(_licenseKeeper);
        if (mid[0] == 1){
            for(uint i = 0; i < mid.length; i++) {
                if(mid[i] == 1 && usingOurInterfaces == true) {
                    emit Check(_licenseKeeper, mid);
                    return true;
                }
            }
        }else{
            return false;
        }
    }
}