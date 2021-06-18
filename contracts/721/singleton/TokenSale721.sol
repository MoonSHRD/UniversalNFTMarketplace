pragma solidity ^0.6.0;

import '@openzeppelin/zeppeline/crowdsale/Crowdsale.sol';
import "@openzeppelin/zeppeline/utils/ReentrancyGuard.sol";
import "@openzeppelin/zeppeline/math/SafeMath.sol";
import "@openzeppelin/zeppeline/GSN/Context.sol";
import "@openzeppelin/zeppeline/token/ERC721/IERC721Enumerable.sol";
import "@openzeppelin/zeppeline/drafts/Counters.sol";

import './Ticket721.sol';

contract TokenSale721 is Context, ReentrancyGuard {


    using SafeMath for uint256;
    using SafeERC20 for IERC20;
  //  using Counters for Counters.Counter;

    // The token being sold
    Ticket721 public _token;


    //event_id
    uint256 public _event_id;

    // ticket type
    uint public _ticket_type = 1;

    // maximum amount of tickets to sale
   // Counters.Counter public _current_limit;
    uint _sale_limit;
    // how much have been already sold
    uint public _sold_count = 0;

    // Address where funds are collected
    address payable public _wallet;

    // Address where we collect comission
    address payable public treasure_fund;

    // How many token units a buyer gets per wei.
    // The rate is the conversion between wei and the smallest and indivisible token unit.
    // So, if you are using a rate of 1 with a ERC20Detailed token with 3 decimals called TOK
    // 1 wei will give you 1 unit, or 0.001 TOK.
    uint256 private _rate;

    // Amount of wei raised
    uint256 private _weiRaised;

    // service comission fee
    uint public percent_fee = 5;

    // Creation date
    uint public crDate = now;

    // How much time before event start (in seconds)
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
     * @param rate Number of token units a buyer gets per wei
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a ERC20Detailed token
     * with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.
     * @param wallet Address where collected funds will be forwarded to
     * @param token Address of the token being sold
     */
    constructor (uint256 rate, address payable wallet, Ticket721 token, uint sale_limit, string memory jid, address payable _treasure_fund,uint timeToStart) public {
        require(rate > 0, "Crowdsale: rate is 0");
        require(wallet != address(0), "Crowdsale: wallet is the zero address");
        require(address(token) != address(0), "Crowdsale: token is the zero address");

        _rate = rate;
        _wallet = wallet;
        treasure_fund = _treasure_fund;
        _token = token;
        _sale_limit = sale_limit * (1 ether);

        _event_id = _token.reserveEventId(_wallet,jid);

        _timeToStart = timeToStart;
    }

    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing tokens from a contract.
     */
    function() external payable {
        buyTokens(_msgSender());
    }

    /**
     * @return the token being sold.
     */
    function token() public view returns (Ticket721) {
        return _token;
    }

    /**
     * @return the address where funds are collected.
     */
    function wallet() public view returns (address payable) {
        return _wallet;
    }

    /**
     * @return the number of token units a buyer gets per wei.
     */
    function rate() public view returns (uint256) {
        return _rate;
    }

    /**
     * @return the amount of wei raised.
     */
    function weiRaised() public view returns (uint256) {
        return _weiRaised;
    }

    function event_id() public view returns (uint256) {
        return _event_id;
    }

    function sale_limit() public view returns (uint) {
        return _sale_limit;
    }

    function ticket_type() public view returns (uint) {
        return _ticket_type;
    }

    function sold_count() public view returns (uint) {
        return _sold_count;
    }

    /**
     * @dev low level token purchase ***DO NOT OVERRIDE***
     * This function has a non-reentrancy guard, so it shouldn't be called by
     * another `nonReentrant` function.
     * @param beneficiary Recipient of the token purchase
     */
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

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * Use `super` in contracts that inherit from Crowdsale to extend their validations.
     * Example from CappedCrowdsale.sol's _preValidatePurchase method:
     *     super._preValidatePurchase(beneficiary, weiAmount);
     *     require(weiRaised().add(weiAmount) <= cap);
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount, uint256 tokens) internal view {
        require(beneficiary != address(0), "Crowdsale: beneficiary is the zero address");
        require(weiAmount != 0, "Crowdsale: weiAmount is 0");
        uint sc = _sold_count * (1 ether);
        uint limit = sc + tokens;
        require(limit <= _sale_limit, "tokens amount should not exceed sale_limit");
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
        _token.buyTicket(beneficiary,tokenAmount, _event_id, _ticket_type);
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Doesn't necessarily emit/send
     * tokens.
     * @param beneficiary Address receiving the tokens
     * @param tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address beneficiary, uint256 tokenAmount) internal {
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
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
      //  require(condition, message);
        require(weiAmount >= _rate, "wei amount should be bigger or equal of rate");
       // uint256 ta = SafeMath.mul(weiAmount, _rate);
        uint256 ta = (weiAmount / (1 ether)) / (_rate / (1 ether));
        return ta;
       // return weiAmount.mul(_rate);
        //FIXME: round result to int, check math
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        uint256 amount = msg.value;
        uint256 scale = 100;
        uint256 fees = calculateFee(amount,scale);
        amount = amount - fees;
        _wallet.transfer(amount);
        treasure_fund.transfer(fees);
        uint256 r = amount + fees;
        emit CalculatedFees(r,fees,amount);
    }

    // Locking funds form sales to contract balance
    function _lockFunds() public payable {
        uint256 amount = msg.value;
        uint256 scale = 100;
        uint256 fees = calculateFee(amount,scale);
        amount = amount - fees;
        treasure_fund.transfer(fees);
        uint256 r = amount + fees;
        emit CalculatedFees(r,fees,amount);
        lockedFunds = lockedFunds + amount;

    }

    // WithDraw locked funds to organiser
    function withDrawFunds() public {
        require(msg.sender == _wallet, "only organaizer can do it");
        if (now >= crDate - _timeToStart) {
            _wallet.transfer(lockedFunds);
            lockedFunds = 0;
        } else {
            revert("event is not started yet, funds are locked");
        }
    }

    function refundToken(address payable visitor, uint256 amount) internal {
        visitor.transfer(amount);
        lockedFunds = lockedFunds.sub(amount);
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