pragma solidity ^0.8.0;
//"SPDX-License-Identifier: UNLICENSED"

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Context.sol";
import "../../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
//import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";



contract CurrenciesERC20 is Context, ReentrancyGuard, Ownable {


    using SafeMath for uint256;
  //  using SafeERC20 for IERC20;

    // Interface to currency token
    IERC20 public _currency_token;

    // Supported erc20 currencies: .. to be extended.  This is hard-coded values
    enum CurrencyERC20 {USDT, USDC, DAI, SNM, WETH} 


    // map currency contract addresses
    // FIXME: rework this part to have separate contract with ability to modify currency list 
    mapping (CurrencyERC20 => IERC20) public _currencies_hardcoded;

    // mapping from name to currency contract (protected)
    mapping (string => IERC20) public _currencies_custom;


    // mapping from name to currency contract defined by users (not protected against scum)
    mapping (string => IERC20) public _currencies_custom_user;


    function AddCustomCurrency(string memory name, address _token_contract) public {

        IERC20 _currency_token_contract = IERC20(_token_contract);

        string memory _name_currency = _currency_token_contract.name();
        

        address _owner_c = owner();
        if(msg.sender == _owner_c) {
         //   require(_currencies_custom[name].address == 0);
            _currencies_custom[name] = _currency_token_contract;
        }
        else {
            _currencies_custom_user[name] = _currency_token_contract;
        }
    }







}