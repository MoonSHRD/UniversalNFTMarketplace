## `TokenSale721`

                 TOKENSALE721
 @title TokenSale721
 @dev TokenSale721 is a reworked OZ Crowdsale contract (see Crowdsale.sol). Originall contract was designed to sell ERC20 tokens
 This contract is defining rules of token (ERC721Enumerable) sell.
 This version of contract suppose to accept ERC20 tokens as a currency (instead of ethereum), and support work with stable-coins as a currency





### `constructor(address i_wallet, contract MSNFT i_token, uint256 i_sale_limit, address payable _treasure_fund, uint256 sprice, enum CurrenciesERC20.CurrencyERC20 _currency, uint256 c_master_id, address currency_contract_)` (public)

 


Constructor of TokenSale721


### `token() → contract MSNFT` (public)





### `wallet() → address` (public)





### `getBalances(enum CurrenciesERC20.CurrencyERC20 _currency) → uint256` (public)





### `master_id() → uint256` (public)





### `sale_limit() → uint256` (public)





### `sold_count() → uint256` (public)





### `get_price(enum CurrenciesERC20.CurrencyERC20 currency) → uint256` (public)





### `get_currency(enum CurrenciesERC20.CurrencyERC20 currency) → contract IERC20Metadata` (public)





### `check_sale_limit(uint256 amountToBuy) → bool` (public)



check if sale limit is not exceeded 


### `buyTokens(address beneficiary, uint256 tokenAmountToBuy, enum CurrenciesERC20.CurrencyERC20 currency)` (public)

     @dev Main function to buyTokens
     @param beneficiary buyer address
     @param tokenAmountToBuy how much tokens we want to buy by one tx
     @param currency ERC20 token used as a currency



### `_preValidatePurchase(address beneficiary, uint256 weiAmount, uint256 tokens, enum CurrenciesERC20.CurrencyERC20 currency)` (internal)



Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
Use `super` in contracts that inherit from Crowdsale to extend their validations.
Example from CappedCrowdsale.sol's _preValidatePurchase method:
    super._preValidatePurchase(beneficiary, weiAmount);
    require(weiRaised().add(weiAmount) <= cap);


### `_postValidatePurchase(address beneficiary, uint256 weiAmount)` (internal)



Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid
conditions are not met.


### `_deliverTokens(address beneficiary, uint256 tokenAmount)` (internal)



Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends
its tokens.


### `_processPurchase(address beneficiary, uint256 tokenAmount, enum CurrenciesERC20.CurrencyERC20 currency, uint256 weiAmount)` (internal)



Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
tokens.


### `_updatePurchasingState(address beneficiary, uint256 weiAmount)` (internal)



Override for extensions that require an internal state to check for validity (current user contributions,
etc.)


### `getWeiAmount(uint256 tokenAmountToBuy, enum CurrenciesERC20.CurrencyERC20 currency) → uint256` (public)

 @dev How much is needed to pay for this token amount to buy
 @param tokenAmountToBuy how much we want to buy
 @param currency  ERC20 used as currency
 @return weiAmount how much we need to pay, could be zero if wrong currency, but will fail at pre-validation



### `_forwardFunds(enum CurrenciesERC20.CurrencyERC20 currency)` (internal)



Determines how ERC20 is stored/forwarded on purchases. Here we take our fee. This function can be tethered to buy tx or can be separate from buy flow.


### `withDrawFunds(enum CurrenciesERC20.CurrencyERC20 currency)` (public)

  @dev determine how funds are collected by seller
  @param currency ERC20 currency



### `calculateFee(uint256 amount, uint256 scale) → uint256` (internal)

  Calculate fee (SafeMath)
  @param amount number from whom we take fee
  @param scale scale for rounding. 100 is 1/100 (percent). we can encreace scale if we want better division (like we need to take 0.5% instead of 5%, then scale = 1000)




### `TokensPurchased(address purchaser, address beneficiary, uint256 value, uint256 amount)`

Event for token purchase logging




### `CalculatedFees(uint256 initial_value, uint256 fees, uint256 transfered_amount)`





