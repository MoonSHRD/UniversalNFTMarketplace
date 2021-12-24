//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import './CurrenciesERC20.sol';
import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";



/** 
*   @title Gatekeeper contract with white_list and block_list functionality
*------------ YOU SHALL NOT PASS!--------------------------------------
*   @notice we can whitelist user (explicit yes)
*           OR user can make a bail deposit (which can be taken for broke rules)  (non-explicit yes)
*           also anyone can be blocked (и раскулачен)
 */
contract Gatekeeper is Ownable 
{


mapping (address => uint256) locked_balances;
mapping (address => bool) public authorized_status;
mapping (address => bool) public block_list;


// WL -- those, who submitted by us, bail list -- those, who deposit bail, kyc -- appendix for future work
enum AuthorizationType {white_list, bail_list, kyc, blocked}
mapping (address => AuthorizationType) MetaAuthorization;

uint256 price;
CurrenciesERC20.CurrencyERC20 _currency;
address _treasure_fund;

//events
event AuthorizationSubmit(address author_, AuthorizationType authorization_type, address authorizer);
event Blocked(address author_);


    // Currencies lib
    CurrenciesERC20 _currency_contract;


    // Constructor
    constructor (address payable treasure_fund_, address currency_contract_, uint bond_price_)
    {
        require(treasure_fund_ != address(0), "Label: wallet is the zero address");
        require(currency_contract_ != address(0), "Label: currency is the zero address");
        _treasure_fund = treasure_fund_;
        _currency_contract = CurrenciesERC20(currency_contract_);
       // _currency = CurrenciesERC20.CurrencyERC20.DAI;
       setBond(CurrenciesERC20.CurrencyERC20.DAI, bond_price_);
    }



    function whiteList(address author_) public onlyOwner {
        authorized_status[author_] = true;
        MetaAuthorization[author_] = AuthorizationType.white_list;
        emit AuthorizationSubmit(author_,AuthorizationType.white_list, msg.sender);
    }


    function place_bail() public {

        IERC20Metadata currency_token = get_currency(_currency);
        require(currency_token.transferFrom(msg.sender, address(this), price), "Label: ERC20: transferFrom buyer to label contract failed ");
        locked_balances[msg.sender] = price;
        authorized_status[msg.sender] = true;
        MetaAuthorization[msg.sender] = AuthorizationType.bail_list;
        emit AuthorizationSubmit(msg.sender, AuthorizationType.bail_list, msg.sender);
    }

    function blacklist(address author_) public onlyOwner {
        IERC20Metadata currency_token = get_currency(_currency);
        uint amount = locked_balances[author_];
        require(currency_token.transferFrom(address(this), msg.sender , amount), "Label: ERC20: transferFrom label to owner  failed ");
        locked_balances[author_] = 0;
        authorized_status[author_] = false;
        MetaAuthorization[author_] = AuthorizationType.blocked;
        block_list[author_] = true;
        emit Blocked(author_);
    }

    function setBond(CurrenciesERC20.CurrencyERC20 currency_, uint price_) public onlyOwner {
        _currency = currency_;
        price = price_;
    }

    function get_currency(CurrenciesERC20.CurrencyERC20 currency) public view returns (IERC20Metadata) {
        return _currency_contract.get_hardcoded_currency(currency);
    }

    function get_meta_authorization(address author_) public view returns (AuthorizationType) {
        return MetaAuthorization[author_];
    }
}