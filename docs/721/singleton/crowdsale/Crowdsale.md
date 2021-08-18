## `Crowdsale`

                     FORKED FROM ZEPPEILINE v2


Crowdsale is a base contract for managing a token crowdsale,
allowing investors to purchase tokens with ether. This contract implements
such functionality in its most fundamental form and can be extended to provide additional
functionality and/or custom behavior.
The external interface represents the basic interface for purchasing tokens, and conforms
the base architecture for crowdsales. It is *not* intended to be modified / overridden.
The internal interface conforms the extensible and modifiable surface of crowdsales. Override
the methods to add functionality. Consider using 'super' where appropriate to concatenate
behavior.


### `constructor(uint256 rate, address payable wallet, contract IERC20 token)` (public)



The rate is the conversion between wei and the smallest and indivisible
token unit. So, if you are using a rate of 1 with a ERC20Detailed token
with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.


### `fallback()` (external)



fallback function ***DO NOT OVERRIDE***
Note that other contracts will transfer funds with a base gas stipend
of 2300, which is not enough to call buyTokens. Consider calling
buyTokens directly when purchasing tokens from a contract.

### `token() → contract IERC20` (public)





### `wallet() → address payable` (public)





### `rate() → uint256` (public)





### `weiRaised() → uint256` (public)





### `buyTokens(address beneficiary)` (public)



low level token purchase ***DO NOT OVERRIDE***
This function has a non-reentrancy guard, so it shouldn't be called by
another `nonReentrant` function.


### `_preValidatePurchase(address beneficiary, uint256 weiAmount)` (internal)



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


### `_processPurchase(address beneficiary, uint256 tokenAmount)` (internal)



Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
tokens.


### `_updatePurchasingState(address beneficiary, uint256 weiAmount)` (internal)



Override for extensions that require an internal state to check for validity (current user contributions,
etc.)


### `_getTokenAmount(uint256 weiAmount) → uint256` (internal)



Override to extend the way in which ether is converted to tokens.


### `_forwardFunds()` (internal)



Determines how ETH is stored/forwarded on purchases.


### `TokensPurchased(address purchaser, address beneficiary, uint256 value, uint256 amount)`

Event for token purchase logging




