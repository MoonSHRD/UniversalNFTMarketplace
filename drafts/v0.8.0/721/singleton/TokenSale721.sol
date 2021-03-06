//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Context.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";


import './MSNFT.sol';
import './CurrenciesERC20.sol';



/**
 *                  TOKENSALE721
 *  @title TokenSale721
 *  @author JackBekket (Sergey Ponomarev)
 *  @dev TokenSale721 is a reworked OZ Crowdsale contract (see Crowdsale.sol). Originall contract was designed to sell ERC20 tokens
 *  This contract is defining rules of token (ERC721Enumerable) sell.
 *  This version of contract suppose to accept ERC20 tokens as a currency (instead of ethereum), and support work with stable-coins as a currency
 * 
*/
contract TokenSale721 is Context, ReentrancyGuard {

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
    address payable public _wallet;

    // Address where we collect comission
    address payable public treasure_fund;

    
    // Supported erc20 currencies: .. to be extended
    //enum CurrencyERC20 {USDT, USDC, DAI, MST, WETH} 
    // CurrenciesERC20.CurrencyERC20 -- enum from above
    // Alternativly use CurrenciesERC20.

    // Map from currency to price
    mapping (CurrenciesERC20.CurrencyERC20 => uint256) public _price;
   
    // balances of this sale contract in those currencies
    mapping (CurrenciesERC20.CurrencyERC20 => uint256) internal currency_balances; 

    // service comission fee
    uint public promille_fee = 25;



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

    event CalculatedFees(uint256 initial_value, uint256 fees, uint256 transfered_amount, address feeAddress);


    /**
     *  
     * @dev Constructor of TokenSale721
     * @param i_wallet Address where collected funds will be forwarded to
     * @param i_token Address of the Master Contract
     * @param i_sale_limit How much we want to sell. Should be consistent with rarity type
     * @param _treasure_fund This is our wallet to collect fees
     * @param sprice Price for 1 token. (in wei/lowest decimal format)
     * @param _currency ERC20 token used as a currency. If it stable then price is setting equal for all stables. 
     * @param c_master_id ID of mastercopy being sold
     * @param currency_contract_ Address of currency registry contract (CurrenciesERC20.sol)
     */
    constructor (address payable i_wallet, MSNFT i_token, uint i_sale_limit, address payable _treasure_fund, uint256 sprice, CurrenciesERC20.CurrencyERC20 _currency, uint256 c_master_id, address currency_contract_)  {
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


    

    /**
     * @return the Master NFT contract.
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

    /**
     * @dev check if sale limit is not exceeded 
     * @param amountToBuy how much of tokens want to buy
     */
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

     /**
     *      @dev Main function to buyTokens
     *      @param beneficiary buyer address
     *      @param tokenAmountToBuy how much tokens we want to buy by one tx
     *      @param currency ERC20 token used as a currency
     */
     function buyTokens(address beneficiary,uint256 tokenAmountToBuy, CurrenciesERC20.CurrencyERC20 currency) public nonReentrant payable {
        uint256 tokens = tokenAmountToBuy;

        // How much is needed to pay
        uint256 weiAmount = getWeiAmount(tokens,currency);  // can be zero if wrong currency set-up to pay. in this case tx will fail under pre-validate purchase check

        _preValidatePurchase(beneficiary, weiAmount, tokens, currency);

        // update state
        currency_balances[currency] = currency_balances[currency] + (weiAmount);
       // If it is unlimited sale then _sale_limit should be always 0   
        _sold_count = _sold_count + tokens;
    
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
     * @param tokens number of tokens we want to buy
     * @param currency ERC20 we use as currency
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
     * @param currency ERC20 used as currency
     * @param weiAmount wei amount involved in transaction
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


    /** 
    *  @dev How much is needed to pay for this token amount to buy
    *  @param tokenAmountToBuy how much we want to buy
    *  @param currency  ERC20 used as currency
    *  @return weiAmount how much we need to pay, could be zero if wrong currency, but will fail at pre-validation
    */
    function getWeiAmount(uint256 tokenAmountToBuy, CurrenciesERC20.CurrencyERC20 currency) public view returns(uint256){
        uint256 price = get_price(currency);    
        uint256 weiAmount = price * tokenAmountToBuy; 
        return weiAmount;
    }

    /**
     * @dev Determines how ERC20 is stored/forwarded on purchases. Here we take our fee. This function can be tethered to buy tx or can be separate from buy flow.
     * @param currency ERC20 currency. Seller should specify what exactly currency he/she want to out
     */
    function _forwardFunds(CurrenciesERC20.CurrencyERC20 currency) internal {
        IERC20Metadata currency_token =  get_currency(currency);
        uint256 amount = currency_token.balanceOf(address(this));
        uint256 scale = 1000;
        uint256 fees = calculateFee(amount,scale);
        amount = amount - fees;
        currency_token.transfer(_wallet,amount);
        currency_token.transfer(treasure_fund,fees);
        uint256 r = amount + fees;
        emit CalculatedFees(r,fees,amount,treasure_fund);
    }


    /**
    *   @dev determine how funds are collected by seller
    *   @param currency ERC20 currency
    */
    function withDrawFunds(CurrenciesERC20.CurrencyERC20 currency) public {
        require(msg.sender == _wallet, "only organaizer can do it");
        IERC20Metadata currency_token =  get_currency(currency);
        require(currency_token.balanceOf(address(this)) > 0, "balance for this currency must be greater then zero");
  
        _forwardFunds(currency);
    }

    function CloseAndDestroy(address payable _to) public {
        require(msg.sender == _wallet, "must be author address");
        for (uint8 i = 0; i <= 4;i++) {
            IERC20Metadata currency_token =  get_currency(CurrenciesERC20.CurrencyERC20(i));
            if (currency_token.balanceOf(address(this)) > 0) {
            withDrawFunds(CurrenciesERC20.CurrencyERC20(i));
            }
        }
        selfdestruct(_to);

    }

    /**
    *   Calculate fee (UnSafeMath) -- use it only if it ^0.8.0
    *   @param amount number from whom we take fee
    *   @param scale scale for rounding. 100 is 1/100 (percent). we can encreace scale if we want better division (like we need to take 0.5% instead of 5%, then scale = 1000)
    */
    function calculateFee(uint256 amount, uint256 scale) internal view returns (uint256) {
        uint a = amount / scale;
        uint b = amount % scale;
        uint c = promille_fee / scale;
        uint d = promille_fee % scale;

        // Calculate fee with ROUND DOWN
        // return a * c * scale + a * d + b * c + b * d / scale;

        // calculate fee with ROUND UP
        // return a * c * scale + a * d + b * c + (b * d + scale - 1) / scale;   // I guess we use this

        //calculate fee with CLOSESTS INTEGER
        // return a * c * scale + a * d + b * c + (b * d + scale / 2) / scale;

       return a * c * scale + a * d + b * c + (b * d + scale - 1) / scale;
    }


    /**
    *   Calculate fee (SafeMath)
    *   @param amount number from whom we take fee
    *   @param scale scale for rounding. 100 is 1/100 (percent). we can encreace scale if we want better division (like we need to take 0.5% instead of 5%, then scale = 1000)
    function calculateFeeSafeMath(uint256 amount, uint256 scale) internal view returns (uint256) {
        uint256 a = SafeMath.div(amount, scale);
        uint256 b = SafeMath.mod(amount, scale);
        uint256 c = SafeMath.div(promille_fee, scale);
        uint256 d = SafeMath.mod(promille_fee, scale);

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
    */

}