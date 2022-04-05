pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

import "../721/singleton/CurrenciesERC20.sol";
import "../721/singleton/MSNFT.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title NFT MetaMarketplace with ERC-165 support
 * @author JackBekket
 * original idea from https://github.com/benber86/nft_royalties_market
 * @notice Defines a marketplace to bid on and sell NFTs.
 *         each marketplace is a struct tethered to nft-token contract
 */

interface IMetaMarketplace {

    /**
     *  @notice offers from owner of nft-s, who are willing to sell them
     */
    struct SellOffer {
        address seller;
        mapping(CurrenciesERC20.CurrencyERC20 => uint256) minPrice; // price tethered to currency
    }

    /**
     *  @notice offers from users, who want to buy nfts
     */
    struct BuyOffer {
        address buyer;
        uint256 price; 
        uint256 createTime;
    }

    struct Receipt {
        uint256 lastPriceSold;
        CurrenciesERC20.CurrencyERC20 currencyUsed;
    }

    // MSNFT, 721Enumerable,721Metadata, erc721(common)
    enum NftType {MoonShard, Enum, Meta, Common}

    struct Marketplace {
        // Store all active sell offers  and maps them to their respective token ids
        mapping(uint256 => SellOffer) activeSellOffers;
        // Store all active buy offers and maps them to their respective token ids
        mapping(uint256 => mapping(CurrenciesERC20.CurrencyERC20 => BuyOffer)) activeBuyOffers;
        // Store the last price & currency item was sold for
        mapping(uint256 => Receipt) lastPrice;
        // Escrow for buy offers
        // buyer_address => token_id => Currency => locked_funds
        mapping(address => mapping(uint256 => mapping(CurrenciesERC20.CurrencyERC20=>uint256))) buyOffersEscrow;
       
        // defines which interface to use for interaction with NFT
        NftType nft_standard;
        bool initialized;
    }

    // Events
    event NewSellOffer(
        address nft_contract_,
        uint256 tokenId,
        address seller,
        uint256 value
    );
    event NewBuyOffer(uint256 tokenId, address buyer, uint256 value);
    event SellOfferWithdrawn(
        address nft_contract_,
        uint256 tokenId,
        address seller
    );
    event BuyOfferWithdrawn(uint256 tokenId, address buyer);
    event CalculatedFees(
        uint256 initial_value,
        uint256 fees,
        uint256 transfered_amount,
        address feeAddress
    );
    event RoyaltiesPaid(
        address nft_contract_,
        uint256 tokenId,
        address recepient,
        uint256 value
    );
    event Sale(
        address nft_contract_,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 value
    );

    /**
     * @notice Puts a token on sale at a given price
     * @param tokenId - id of the token to sell
     * @param minPrice - minimum price at which the token can be sold
     * @param nft_contract_ -- address of nft contract
     */
    function makeSellOffer(
        uint256 tokenId,
        uint256 minPrice,
        address nft_contract_,
        CurrenciesERC20.CurrencyERC20 currency_
    ) external;

    /**
     * @notice Withdraw a sell offer. It's called by the owner of nft.
     *         it will remove offer for every currency (it's intended behaviour)
     * @param tokenId - id of the token whose sell order needs to be cancelled
     * @param nft_contract_ - address of nft contract
     */
    function withdrawSellOffer(address nft_contract_, uint256 tokenId) external;

    /**
     * @notice Purchases a nft-token. Require active sell offer from owner of nft. Otherwise use makeBuyOffer
     *         also require bid_price_ equal or bigger than desired price from sell offer
     * @param tokenId - id of the token to sell
     * @param bid_price_ -- price buyer is willing to pay to the seller
     */
    function purchase(
        address token_contract_,
        uint256 tokenId,
        CurrenciesERC20.CurrencyERC20 currency_,
        uint256 bid_price_
    ) external;

    /**
     * @notice Makes a buy offer for a token. The token does not need to have
     *         been put up for sale. A buy offer can not be withdrawn or
     *         replaced for 24 hours. Amount of the offer is put in escrow
     *         until the offer is withdrawn or superceded
     *
     * @param tokenId - id of the token to buy
     * @param currency_ - in what currency we want to pay
     * @param bid_price_ - how much we are willing to offer for this nft
     */
    function makeBuyOffer(
        address token_contract_,
        uint256 tokenId,
        CurrenciesERC20.CurrencyERC20 currency_,
        uint256 bid_price_
    ) external;

    /**  @notice Withdraws a buy offer. Can only be withdrawn a day after being posted
     *    @param tokenId - id of the token whose buy order to remove
     *    @param currency_ -- in which currency we want to remove offer
     */
    function withdrawBuyOffer(
        address token_contract_,
        uint256 tokenId,
        CurrenciesERC20.CurrencyERC20 currency_
    ) external;

    /** @notice Lets a token owner accept the current buy offer
     *         (even without a sell offer)
     * @param tokenId - id of the token whose buy order to accept
     * @param currency_ - in which currency we want to accept offer
     */
    function acceptBuyOffer(
        address token_contract_,
        uint256 tokenId,
        CurrenciesERC20.CurrencyERC20 currency_
    ) external;

    function getLastPrice(address token_contract_, uint256 _tokenId)
        external
        view
        returns (uint256 _lastPrice, CurrenciesERC20.CurrencyERC20 currency_);
}
