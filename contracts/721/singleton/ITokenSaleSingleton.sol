//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Context.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";

import "./MSNFT.sol";
import "./CurrenciesERC20.sol";


interface ITokenSaleSingleton {

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokensPurchased(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 amount
    );

    event CalculatedFees(
        uint256 initial_value,
        uint256 fees,
        uint256 transfered_amount,
        address feeAddress
    );

    /**
     * @return the Master NFT contract.
     */
    function token() external view returns (MSNFT);

    /**
     *
     * @dev Create new Sale for given master_id
     * @param i_wallet Address where collected funds will be forwarded to
     * @param i_token Address of the Master Contract
     * @param i_sale_limit How much we want to sell. Should be consistent with rarity type
     *
     * @param sprice Price for 1 token. (in wei/lowest decimal format)
     * @param _currency ERC20 token used as a currency. If it stable then price is setting equal for all stables.
     * @param c_master_id ID of mastercopy being sold
     */
    function CreateNewSale(
        address payable i_wallet,
        MSNFT i_token,
        uint256 i_sale_limit,
        uint256 sprice,
        CurrenciesERC20.CurrencyERC20 _currency,
        uint256 c_master_id
    ) external;

    /**
     * @return the address where funds are collected (author).
     */
    function wallet(uint256 master_id_) external view returns (address); 

    function getBalances(
        CurrenciesERC20.CurrencyERC20 _currency,
        uint256 master_id_
    ) external view returns (uint256);

    function sale_limit(uint256 master_id_) external view returns (uint256);

    function sold_count(uint256 master_id_) external view returns (uint256);

    function isInitialized(uint256 master_id_) external view returns (bool); 

    function get_price(
        CurrenciesERC20.CurrencyERC20 currency,
        uint256 master_id_
    ) external view returns (uint256); 

    function get_currency(CurrenciesERC20.CurrencyERC20 currency) external view returns (IERC20Metadata);
   
    /**
     * @dev check if sale limit is not exceeded
     * @param amountToBuy how much of tokens want to buy
     */
    function check_sale_limit(uint256 amountToBuy, uint256 master_id_) external view returns (bool);

    /**
     * @dev Main function to buyTokens
     * @param beneficiary buyer address
     * @param tokenAmountToBuy how much tokens we want to buy by one tx
     * @param currency ERC20 token used as a currency
     */
    function buyTokens(
        address beneficiary,
        uint256 tokenAmountToBuy,
        CurrenciesERC20.CurrencyERC20 currency,
        uint256 master_id_
    ) external; 

    /**
     *  @dev How much is needed to pay for this token amount to buy
     *  @param tokenAmountToBuy how much we want to buy
     *  @param currency  ERC20 used as currency
     *  @return weiAmount how much we need to pay, could be zero if wrong currency, but will fail at pre-validation
     */
    function getWeiAmount(
        uint256 tokenAmountToBuy,
        CurrenciesERC20.CurrencyERC20 currency,
        uint256 master_id_
    ) external view returns (uint256);

    /**
     *   @dev determine how funds are collected by seller
     *   @param currency ERC20 currency
     */
    function withDrawFunds(
        CurrenciesERC20.CurrencyERC20 currency,
        uint256 master_id_
    ) external;

    /**
    function CloseAndDestroy(address payable _to) external; 
    */
}