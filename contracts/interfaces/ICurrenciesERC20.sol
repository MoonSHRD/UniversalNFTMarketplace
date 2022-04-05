//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

interface ICurrenciesERC20 {
    /**
     * @dev Hardcoded (not-extetiable after deploy) erc20 currencies
     */
    enum CurrencyERC20 {USDT, USDC, DAI, MST, WETH, WBTC} 
    /**
     *  @dev add new currency for using
     *  @param _token_contract address of a new token
     */
    function AddCustomCurrency(address _token_contract) external;

    /**
     *  @dev get hardcoded currency
     *  @param currency CurrencyERC20 enum id
     */
    function get_hardcoded_currency(CurrencyERC20 currency)
        external
        view
        returns (IERC20Metadata);
}
