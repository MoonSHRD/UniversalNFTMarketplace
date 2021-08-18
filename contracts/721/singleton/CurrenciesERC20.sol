pragma solidity ^0.8.0;
//"SPDX-License-Identifier: UNLICENSED"

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
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

    struct CurrencyERC20_Custom {
       // string name;
        uint8 decimals;
        address contract_address;
        IERC20 itoken; // contract interface
    }


    // map currency contract addresses
    // FIXME: rework this part to have separate contract with ability to modify currency list 
    mapping (CurrencyERC20 => IERC20) public _currencies_hardcoded;

    // mapping from name to currency contract (protected)
    mapping (string => CurrencyERC20_Custom) public _currencies_custom;


    // mapping from name to currency contract defined by users (not protected against scum)
    mapping (string => CurrencyERC20_Custom) public _currencies_custom_user;


    function AddCustomCurrency(address _token_contract) public {

        IERC20 _currency_contract_i = IERC20(_token_contract);
        ERC20 _currency_contract = ERC20(_token_contract);      // @todo: is it possible to use IERC20Metadata instead?

        string memory _name_c = _currency_contract.name();
        uint8 _dec = _currency_contract.decimals();
        

        address _owner_c = owner();
        if(msg.sender == _owner_c) {
            require(_currencies_custom[_name_c].contract_address == address(0), "Currency token contract with this address is already exists");
            _currencies_custom[_name_c].itoken = _currency_contract_i;
            _currencies_custom[_name_c].decimals = _dec;
            _currencies_custom[_name_c].contract_address = _token_contract;
        }
        else {
            require(_currencies_custom_user[_name_c].contract_address == address(0), "Currency token contract with this address is already exists");
            _currencies_custom_user[_name_c].itoken = _currency_contract_i;
            _currencies_custom_user[_name_c].decimals = _dec;
            _currencies_custom_user[_name_c].contract_address = _token_contract;
        }
    }


/*
    function hardcodeCurrencies() internal {

    }
*/



    constructor() {




    }




}