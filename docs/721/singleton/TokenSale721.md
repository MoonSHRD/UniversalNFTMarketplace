## `TokenSale721`






### `constructor(address i_wallet, contract MSNFT i_token, uint256 i_sale_limit, address payable _treasure_fund, uint256 sprice, enum TokenSale721.CurrencyERC20 _currency, uint256 c_master_id)` (public)

 rate Number of token units a buyer gets per wei


The rate is the conversion between wei and the smallest and indivisible
token unit. So, if you are using a rate of 1 with a ERC20Detailed token
with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.


### `token() → contract MSNFT` (public)





### `wallet() → address` (public)





### `getBalances(enum TokenSale721.CurrencyERC20 _currency) → uint256` (public)





### `master_id() → uint256` (public)





### `sale_limit() → uint256` (public)





### `sold_count() → uint256` (public)





### `get_price(enum TokenSale721.CurrencyERC20 currency) → uint256` (public)





### `get_currency(enum TokenSale721.CurrencyERC20 currency) → contract IERC20` (public)





### `check_sale_limit(uint256 amountToBuy) → bool` (public)





### `buyTokens(address beneficiary, uint256 tokenAmountToBuy, enum TokenSale721.CurrencyERC20 currency)` (public)



low level token purchase ***DO NOT OVERRIDE***
This function has a non-reentrancy guard, so it shouldn't be called by
another `nonReentrant` function.


### `_preValidatePurchase(address beneficiary, uint256 weiAmount, uint256 tokens, enum TokenSale721.CurrencyERC20 currency)` (internal)



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


### `_processPurchase(address beneficiary, uint256 tokenAmount, enum TokenSale721.CurrencyERC20 currency, uint256 weiAmount)` (internal)



Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
tokens.


### `_updatePurchasingState(address beneficiary, uint256 weiAmount)` (internal)



Override for extensions that require an internal state to check for validity (current user contributions,
etc.)


### `getWeiAmount(uint256 tokenAmountToBuy, enum TokenSale721.CurrencyERC20 currency) → uint256` (public)





### `_forwardFunds(enum TokenSale721.CurrencyERC20 currency)` (internal)



Determines how ERC20 is stored/forwarded on purchases.

### `withDrawFunds(enum TokenSale721.CurrencyERC20 currency)` (public)





### `calculateFee(uint256 amount, uint256 scale) → uint256` (internal)






### `TokensPurchased(address purchaser, address beneficiary, uint256 value, uint256 amount)`

Event for token purchase logging




### `CalculatedFees(uint256 initial_value, uint256 fees, uint256 transfered_amount)`





