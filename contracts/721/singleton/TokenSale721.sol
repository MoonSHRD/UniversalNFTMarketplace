pragma solidity ^0.8.0;
//"SPDX-License-Identifier: UNLICENSED"

import './crowdsale/Crowdsale.sol';

import "../../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Context.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";


import './MSNFT.sol';
import './CurrenciesERC20.sol';

contract TokenSale721 is Context, ReentrancyGuard {


    using SafeMath for uint256;
    using SafeERC20 for IERC20Metadata;
  //  using Counters for Counters.Counter;

    // The token being sold
    MSNFT public _token;

    // Interface to currency token
    IERC20Metadata public _currency_token;

    // Currencies lib
    CurrenciesERC20 _currency_contract;

    //master_id
    uint256 public _master_id;

    // rarity type
    MSNFT.RarityType _rarity_type;

    // maximum amount of tickets to sale
   // Counters.Counter public _current_limit;
    uint _sale_limit;
    // how much have been already sold
    uint public _sold_count = 0;

    // Address where funds are collected
    address public _wallet;

    // Address where we collect comission
    address payable public treasure_fund;

    
    // Supported erc20 currencies: .. to be extended
    //enum CurrencyERC20 {USDT, USDC, DAI, SNM, WETH} 
    // CurrenciesERC20.CurrencyERC20 -- enum from above
    // Alternativly use CurrenciesERC20.

    // Map from currency to price
    mapping (CurrenciesERC20.CurrencyERC20 => uint256) public _price;

    // FIXME: rework this part to have separate contract with ability to modify currency list 
    // map from currency to contract addresses
   // mapping (CurrenciesERC20.CurrencyERC20 => IERC20) internal _currencies; // setting up currency list
    // CurrenciesERC20._currencies_hardcoded

   
    // balances of this sale contract in those currencies
    mapping (CurrenciesERC20.CurrencyERC20 => uint256) internal currency_balances; 

    // service comission fee
    uint public percent_fee = 5;

    // Creation date
    uint public crDate = block.timestamp;

    // How much time before event start (in seconds)
    // TODO -- delete this
    uint public _timeToStart;

    // Funds, that have been locked
    uint256 public lockedFunds;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokensPurchased(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    event CalculatedFees(uint256 initial_value, uint256 fees, uint256 transfered_amount);


    /**
     *  rate Number of token units a buyer gets per wei
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a ERC20Detailed token
     * with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.
     * @param i_wallet Address where collected funds will be forwarded to
     * @param i_token Address of the token being sold
     */
    constructor (address i_wallet, MSNFT i_token, uint i_sale_limit, address payable _treasure_fund, uint256 sprice, CurrenciesERC20.CurrencyERC20 _currency, uint256 c_master_id, address currency_contract_)  {
        require(i_wallet != address(0), "Crowdsale: wallet is the zero address");
        require(address(i_token) != address(0), "Crowdsale: token is the zero address");

        // Check if stable
        if (_currency == CurrenciesERC20.CurrencyERC20.DAI || _currency == CurrenciesERC20.CurrencyERC20.USDC) {
           // _price[_currency] = sprice;
            _price[CurrenciesERC20.CurrencyERC20.DAI] = sprice;
            _price[CurrenciesERC20.CurrencyERC20.USDC] = sprice;
            _price[CurrenciesERC20.CurrencyERC20.USDT] = sprice / 1 ether * 1e6;    // USDT have 6 decimals, not 18
        } else if(_currency == CurrenciesERC20.CurrencyERC20.USDT) {
            _price[CurrenciesERC20.CurrencyERC20.USDT] = sprice;
            _price[CurrenciesERC20.CurrencyERC20.USDC] = sprice / 1e6 * 1 ether;
            _price[CurrenciesERC20.CurrencyERC20.DAI] = sprice / 1e6 * 1 ether;
        } 
        else {
            _price[_currency] = sprice;
        }

        _wallet = i_wallet;
        treasure_fund = _treasure_fund;
        _token = i_token;
        _currency_contract = CurrenciesERC20(currency_contract_);
        
        // Get rarity type and check sale_limit
        _rarity_type = _token.get_rarity(c_master_id);
        if (_rarity_type == MSNFT.RarityType.Unique) {
            require(i_sale_limit == 1, "Tokensale: Attempt to create new Tokensale for unique NFT with wrong sale_limit");
        }
        if (_rarity_type == MSNFT.RarityType.Common) {  
            _sale_limit = 0;
        }
        if (_rarity_type == MSNFT.RarityType.Rare) {
            _sale_limit = i_sale_limit;
        }


        _master_id = c_master_id;

        _timeToStart = 0;
    }

    // @todo used to buy tokens for ether (deprecated)
    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing tokens from a contract.
     
    fallback() external payable {
        buyTokens(_msgSender());
    }
    */

    /**
     * @return the token being sold.
     */
    function token() public view returns (MSNFT) {
        return _token;
    }

    /**
     * @return the address where funds are collected.
     */
    function wallet() public view returns (address) {
        return _wallet;
    }

    function getBalances(CurrenciesERC20.CurrencyERC20 _currency) public view returns (uint) {
        return currency_balances[_currency];
    }

    function master_id() public view returns (uint256) {
        return _master_id;
    }

    function sale_limit() public view returns (uint) {
        return _sale_limit;
    }


    function sold_count() public view returns (uint) {
        return _sold_count;
    }

    function get_price(CurrenciesERC20.CurrencyERC20 currency) public view returns (uint256) {
        return _price[currency];
    }


    function get_currency(CurrenciesERC20.CurrencyERC20 currency) public view returns (IERC20Metadata) {
        return _currency_contract.get_hardcoded_currency(currency);
      //  return _currencies[currency];
    }


    function check_sale_limit(uint256 amountToBuy) public view returns (bool) {
        uint sl = sale_limit();
        if (sl == 0){
            return true;
        }
        if (sl == 1) {
            require(amountToBuy == 1,"TokenSale: exceed sale limit!");
            return true;
        } else {
            require(amountToBuy <= sl,"TokenSale: exceed sale limit!");
            return true;
        }
    }

    // BUY TOKENS FOR ETHER/COIN (DEPRECATED)
    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     
    function buyTokens(address beneficiary) public nonReentrant payable {
        uint256 weiAmount = msg.value;

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        _preValidatePurchase(beneficiary, weiAmount, tokens);

        // update state
        _weiRaised = _weiRaised.add(weiAmount);
        _sold_count = _sold_count.add(tokens);

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, weiAmount);

     //   _forwardFunds();
         _lockFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }
    **/



     function buyTokens(address beneficiary,uint256 tokenAmountToBuy, CurrenciesERC20.CurrencyERC20 currency) public nonReentrant payable {
        uint256 tokens = tokenAmountToBuy;

        // How much is needed to pay
        uint256 weiAmount = getWeiAmount(tokens,currency);  // can be zero if wrong currency set-up to pay. in this case tx will fail under pre-validate purchase check

        _preValidatePurchase(beneficiary, weiAmount, tokens, currency);

        // update state
        currency_balances[currency] = currency_balances[currency].add(weiAmount);
       // If it is unlimited sale then _sale_limit should be always 0   
        _sold_count = _sold_count.add(tokens);
    
        _processPurchase(beneficiary, tokens,currency, weiAmount);
        emit TokensPurchased(_msgSender(), beneficiary, weiAmount, tokens);

        _updatePurchasingState(beneficiary, weiAmount);

     //   _forwardFunds();
    //     _lockFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }



    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * Use `super` in contracts that inherit from Crowdsale to extend their validations.
     * Example from CappedCrowdsale.sol's _preValidatePurchase method:
     *     super._preValidatePurchase(beneficiary, weiAmount);
     *     require(weiRaised().add(weiAmount) <= cap);
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount, uint256 tokens, CurrenciesERC20.CurrencyERC20 currency) internal view {
        require(beneficiary != address(0), "Crowdsale: beneficiary is the zero address");
        require(weiAmount != 0, "Crowdsale: Pre-validate: weiAmount is 0, consider you have choose right currency to pay with");
        uint sc = _sold_count;
        uint limit = sc + tokens;

     // Check sale_limit (including rarity check)
        require(check_sale_limit(limit) == true, "tokens amount should not exceed sale_limit");


     // Check allowance of currency balance
        IERC20Metadata currency_token = get_currency(currency);
        uint256 approved_balance = currency_token.allowance(beneficiary, address(this));
        require(approved_balance >= weiAmount, "Tokensale: ERC20:approved spending limit is not enoght");


        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid
     * conditions are not met.
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _postValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends
     * its tokens.
     * @param beneficiary Address performing the token purchase
     * @param tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address beneficiary, uint256 tokenAmount) internal {
        _token.buyItem(beneficiary,tokenAmount, _master_id);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
     * tokens.
     * @param beneficiary Address receiving the tokens
     * @param tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address beneficiary, uint256 tokenAmount, CurrenciesERC20.CurrencyERC20 currency, uint256 weiAmount) internal {
        IERC20Metadata currency_token = get_currency(currency);
        require(currency_token.transferFrom(beneficiary, address(this), weiAmount), "TokenSale: ERC20: transferFrom buyer to itemsale contract failed ");
        _deliverTokens(beneficiary, tokenAmount);
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions,
     * etc.)
     * @param beneficiary Address receiving the tokens
     * @param weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal {
        // solhint-disable-previous-line no-empty-blocks
    }


    /*
    *   How much is needed to pay for this token amount to buy
    */
    function getWeiAmount(uint256 tokenAmountToBuy, CurrenciesERC20.CurrencyERC20 currency) public view returns(uint256){
        uint256 price = get_price(currency);    // @todo: WARNING -- it can be 0 if buyer mismatch currency, but such transaction will fail at pre-validate purchase check!
        uint256 weiAmount = price * tokenAmountToBuy; 
        return weiAmount;
    }

    /**
     * @dev Determines how ERC20 is stored/forwarded on purchases.
     */
    function _forwardFunds(CurrenciesERC20.CurrencyERC20 currency) internal {
        IERC20Metadata currency_token =  get_currency(currency);
        uint256 amount = currency_token.balanceOf(address(this));
        uint256 scale = 100;
        uint256 fees = calculateFee(amount,scale);
        amount = amount - fees;
        currency_token.transfer(_wallet,amount);
        currency_token.transfer(treasure_fund,fees);
        uint256 r = amount + fees;
        emit CalculatedFees(r,fees,amount);
    }


    // WithDraw locked funds to organiser
    function withDrawFunds(CurrenciesERC20.CurrencyERC20 currency) public {
        require(msg.sender == _wallet, "only organaizer can do it");
      /*
        if (block.timestamp >= crDate - _timeToStart) {
            _wallet.transfer(lockedFunds);
            lockedFunds = 0;
        } else {
            revert("event is not started yet, funds are locked");
        }
        */
        _forwardFunds(currency);
    }

    /*
    *   EXAMPLE OF TAKING FEE (BASIC OPERATORS)
    *
    // calculate percent -- amount * percent / 100
    function calculateFee(uint256 amount, uint256 scale) internal view returns (uint256) {
        uint a = amount / scale;
        uint b = amount % scale;
        uint c = percent_fee / scale;
        uint d = percent_fee % scale;

        // Calculate fee with ROUND DOWN
       // return a * c * scale + a * d + b * c + b * d / scale;

       // calculate fee with ROUND UP
     //   return a * c * scale + a * d + b * c + (b * d + scale - 1) / scale;

     //calculate fee with CLOSESTS INTEGER
        return a * c * scale + a * d + b * c + (b * d + scale / 2) / scale;

    }
    */


    /*
    *   Calculate fee (SafeMath)
    */
    function calculateFee(uint256 amount, uint256 scale) internal view returns (uint256) {
        uint256 a = SafeMath.div(amount, scale);
        uint256 b = SafeMath.mod(amount, scale);
        uint256 c = SafeMath.div(percent_fee, scale);
        uint256 d = SafeMath.mod(percent_fee, scale);

        // Calculate fee with ROUND DOWN
       // return a * c * scale + a * d + b * c + b * d / scale;

       // calculate fee with ROUND UP
     //   return a * c * scale + a * d + b * c + (b * d + scale - 1) / scale;

     //calculate fee with CLOSESTS INTEGER
       // return a * c * scale + a * d + b * c + (b * d + scale / 2) / scale;
        uint256 m1 = SafeMath.mul(SafeMath.mul(a,c), scale);
        uint256 m2 = SafeMath.mul(a,d);
        uint256 m3 = SafeMath.mul(b,c);
        uint m4 = SafeMath.mul(b,d);

        uint256 d1 = SafeMath.div(scale,2);

        uint256 a1 = SafeMath.add(m4,d1);
        uint256 d2 = SafeMath.div(a1,scale);
        uint256 a2 = SafeMath.add(m1,m2);
        uint256 a3 = SafeMath.add(a2,m3);
        uint256 a4 = SafeMath.add(a3,d2);
        return a4;
    }




}