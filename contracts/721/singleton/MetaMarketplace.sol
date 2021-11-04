pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED


import './CurrenciesERC20.sol';
import './MSNFT.sol';
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";




/**
 * @title NFT Marketplace with ERC-2981 support
 * @author JackBekket
 * --------------------------------------------------------ORIGINALLY FORKED FROM https://github.com/benber86/nft_royalties_market
 * @notice Defines a marketplace to bid on and sell NFTs.
 *         Sends royalties to rightsholder on each sale if applicable.
 */
contract MetaMarketplace {



    struct SellOffer {
        address seller;
        mapping(CurrenciesERC20.CurrencyERC20 => uint256) minPrice;
       // CurrenciesERC20.CurrencyERC20 _currency;
    }

    struct BuyOffer {
        address buyer;
        mapping(CurrenciesERC20.CurrencyERC20 => uint256) price; 
        //uint256 price;
        uint256 createTime;
       // CurrenciesERC20.CurrencyERC20 _currency;
    }

    // MSNFT, 721Enumerable, URIStorage, 721Metadata, erc721(common)
    enum NftType {MoonShard, Enum, Meta, Common}

    struct Marketplace {
        // Store all active sell offers  and maps them to their respective token ids
        mapping(uint256 => SellOffer) activeSellOffers;
        // Store all active buy offers and maps them to their respective token ids
        mapping(uint256 => BuyOffer) activeBuyOffers;
        // Token contract
        // Token token;
        // Escrow for buy offers
        mapping(address => mapping(uint256 => uint256)) buyOffersEscrow;
       
        // defines which interface to use for interaction with NFT
        NftType nft_standard;
        bool initialized;
    }

    // from nft token address to marketplace
    mapping(address => Marketplace) public Marketplaces;


    // Currencies lib
    CurrenciesERC20 _currency_contract;

    
    //bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;


    //Hardcode interface_id's
    bytes4 private constant _INTERFACE_ID_MSNFT = 0x780e9d63;
    bytes4 private constant _INTERFACE_ID_IERC721ENUMERABLE = 0x780e9d63;
    bytes4 private constant _INTERFACE_ID_IERC721METADATA = 0x5b5e139f;
    bytes4 private constant _INTERFACE_ID_IERC721= 0x7aa5391d;      // WRONG
    




    // Store the address of the contract of the NFT to trade. Can be changed in
    // constructor or with a call to setTokenContractAddress.
    //address public _tokenContractAddress = address(0);

    // Store all active sell offers  and maps them to their respective token ids
    //mapping(uint256 => SellOffer) public activeSellOffers;

    // Store all active buy offers and maps them to their respective token ids
    //mapping(uint256 => BuyOffer) public activeBuyOffers;
    // Token contract
   // Token token;
    // Escrow for buy offers
    //mapping(address => mapping(uint256 => uint256)) public buyOffersEscrow;

    // Events
    event NewSellOffer(address nft_contract_, uint256 tokenId, address seller, uint256 value);
    event NewBuyOffer(uint256 tokenId, address buyer, uint256 value);
    event SellOfferWithdrawn(address nft_contract_, uint256 tokenId, address seller);
    event BuyOfferWithdrawn(uint256 tokenId, address buyer);
   // event RoyaltiesPaid(uint256 tokenId, uint value);
    event Sale(address nft_contract_, uint256 tokenId, address seller, address buyer, uint256 value);
    

    constructor(address currency_contract_, address msnft_token_) {
        _currency_contract = CurrenciesERC20(currency_contract_);
        require(_checkStandard(msnft_token_, NftType.MoonShard), "Standard not supported");
        SetUpMarketplace(msnft_token_, NftType.MoonShard);
    }


    modifier marketplaceSetted(address mplace_) {
        require(Marketplaces[mplace_].initialized == true,
            "Marketplace for this token is not setup yet!");
        _; 
    }

    modifier isMarketable(uint256 tokenId, address token_contract_) {
     //   Marketplace storage metainfo = Marketplaces[token_contract_];
       // NftType standard_ = metainfo.nft_standard;
      //  if (standard_ == )
        require(Marketplaces[token_contract_].initialized == true,
            "Marketplace for this token is not setup yet!");
        IERC721Enumerable token = IERC721Enumerable(token_contract_);
       // metainfo.nft_standard = standard_;

        require(token.getApproved(tokenId) == address(this),
            "Not approved");
        _;
    }

    // TODO: check this and probably add marketplaceSetted check
    modifier tokenOwnerOnly(uint256 tokenId, address token_contract_) {
       IERC721 token = IERC721(token_contract_);
        require(token.ownerOf(tokenId) == msg.sender,
            "Not token owner");
        _;
    }

    modifier tokenOwnerForbidden(uint256 tokenId,address token_contract_) {
        IERC721 token = IERC721(token_contract_);
        require(token.ownerOf(tokenId) != msg.sender,
            "Token owner not allowed");
        _;
    }

    function SetUpMarketplace(address nft_token_, NftType standard_) public {
       
        require(Marketplaces[nft_token_].initialized == false, "Marketplace is already setted up");

        Marketplace storage metainfo = Marketplaces[nft_token_];
        metainfo.nft_standard = standard_;
        metainfo.initialized = true;
    }

    
    function _checkStandard(address contract_, NftType standard_) internal view returns (bool) {

        
        if(standard_ == NftType.MoonShard) {
           // MSNFT token = MSNFT(contract_);
           // if(token.symbol() == "MSNFT") {}
            (bool success) = MSNFT(contract_).
            supportsInterface(_INTERFACE_ID_IERC721ENUMERABLE);
            return success;
        }
         if(standard_ == NftType.Enum) {
            (bool success) = IERC721Enumerable(contract_).
            supportsInterface(_INTERFACE_ID_IERC721ENUMERABLE);
            return success;
        }
        if (standard_ == NftType.Meta) {
            (bool success) = IERC721Metadata(contract_).
            supportsInterface(_INTERFACE_ID_IERC721METADATA);
            return success;
        }
        if (standard_ == NftType.Common) {
            return false;
            //revert("");
        }
    }
    


    /** 
    * @notice Puts a token on sale at a given price
    * @param tokenId - id of the token to sell
    * @param minPrice - minimum price at which the token can be sold
    */
    function makeSellOffer(uint256 tokenId, uint256 minPrice, address token_contract_, CurrenciesERC20.CurrencyERC20 currency_)
    external marketplaceSetted(token_contract_) isMarketable(tokenId,token_contract_) tokenOwnerOnly(tokenId,token_contract_) 
    {
        Marketplace storage metainfo = Marketplaces[token_contract_];
        // Create sell offer
       // metainfo.activeSellOffers[tokenId] = SellOffer({seller : msg.sender,
       //                                        minPrice : minPrice });
        metainfo.activeSellOffers[tokenId].minPrice[currency_] = minPrice;
        metainfo.activeSellOffers[tokenId].seller = msg.sender;

        // Broadcast sell offer
        emit NewSellOffer(token_contract_,tokenId, msg.sender, minPrice);
    }


    /**
    * @notice Withdraw a sell offer
    * @param tokenId - id of the token whose sell order needs to be cancelled
    * @param token_contract_ - address of nft contract
    */
    function withdrawSellOffer(address token_contract_,uint256 tokenId)
    external marketplaceSetted(token_contract_) isMarketable(tokenId, token_contract_)
    {
        Marketplace storage metainfo = Marketplaces[token_contract_];
        require(metainfo.activeSellOffers[tokenId].seller != address(0),
            "No sale offer");
        require(metainfo.activeSellOffers[tokenId].seller == msg.sender,
            "Not seller");
        // Removes the current sell offer
        delete (metainfo.activeSellOffers[tokenId]);
        // Broadcast offer withdrawal
        emit SellOfferWithdrawn(token_contract_,tokenId, msg.sender);
    }


    /*
    /// @notice Transfers royalties to the rightsowner if applicable
    /// @param tokenId - the NFT assed queried for royalties
    /// @param grossSaleValue - the price at which the asset will be sold
    /// @return netSaleAmount - the value that will go to the seller after
    ///         deducting royalties
    function _deduceRoyalties(uint256 tokenId, uint256 grossSaleValue)
    internal returns (uint256 netSaleAmount) {
        // Get amount of royalties to pays and recipient
        (address royaltiesReceiver, uint256 royaltiesAmount) = token
        .royaltyInfo(tokenId, grossSaleValue);
        // Deduce royalties from sale value
        uint256 netSaleValue = grossSaleValue - royaltiesAmount;
        // Transfer royalties to rightholder if not zero
        if (royaltiesAmount > 0) {
            royaltiesReceiver.call{value: royaltiesAmount}('');
        }
        // Broadcast royalties payment
        emit RoyaltiesPaid(tokenId, royaltiesAmount);
        return netSaleValue;
    }
    */

    /// @notice Purchases a token and transfers royalties if applicable
    /// @param tokenId - id of the token to sell
    function purchase(address token_contract_,uint256 tokenId,CurrenciesERC20.CurrencyERC20 currency_, uint256 weiPrice_)
    external marketplaceSetted(token_contract_) tokenOwnerForbidden(tokenId,token_contract_) payable {
       
        Marketplace storage metainfo = Marketplaces[token_contract_];
        address seller = metainfo.activeSellOffers[tokenId].seller;

        require(seller != address(0),
            "No active sell offer");

        // If, for some reason, the token is not approved anymore (transfer or
        // sale on another market place for instance), we remove the sell order
        // and throw
        IERC721 token = IERC721(token_contract_);
        if (token.getApproved(tokenId) != address(this)) {
            delete (metainfo.activeSellOffers[tokenId]);
            // Broadcast offer withdrawal
            emit SellOfferWithdrawn(token_contract_,tokenId, seller);
            // Revert
            revert("Invalid sell offer");
        }

        IERC20 _currency_token = _currency_contract.get_hardcoded_currency(currency_); // get currency token
        uint256 approved_balance = _currency_token.allowance(msg.sender, address(this));
        require(weiPrice_ >= metainfo.activeSellOffers[tokenId].minPrice[currency_],     // TODO: idk if it will work properly with USDT however. need to implement price calculation algo from tokensale_singleton contract
            "Amount sent too low");
        require(approved_balance >= weiPrice_, "Approved amount is lesser then weiPrice");
        uint256 saleValue = weiPrice_;
        // Pay royalties if applicable
        /*
        if (_checkRoyalties(_tokenContractAddress)) {
            saleValue = _deduceRoyalties(tokenId, saleValue);
        }
        */

        // Transfer funds (ERC20) to the seller
        address seller_address = metainfo.activeSellOffers[tokenId].seller;
        require(_currency_token.transferFrom(msg.sender, address(this), saleValue), "MetaMarketplace: ERC20: transferFrom buyer to metamarketplace contract failed ");  // TODO: probably we need to send payment directly to a seller + comission fee

        // And nft_token to the buyer
        token.safeTransferFrom(
            seller,
            msg.sender,
            tokenId
        );
        // Remove all sell and buy offers
        delete (metainfo.activeSellOffers[tokenId]);
        delete (metainfo.activeBuyOffers[tokenId]);
        // Broadcast the sale
        emit Sale( token_contract_,
            tokenId,
            seller,
            msg.sender,
            msg.value);
    }



    /*
    /// @notice Makes a buy offer for a token. The token does not need to have
    ///         been put up for sale. A buy offer can not be withdrawn or
    ///         replaced for 24 hours. Amount of the offer is put in escrow
    ///         until the offer is withdrawn or superceded
    /// @param tokenId - id of the token to buy
    function makeBuyOffer(uint256 tokenId)
    external tokenOwnerForbidden(tokenId)
    payable {
        // Reject the offer if item is already available for purchase at a
        // lower or identical price
        if (activeSellOffers[tokenId].minPrice != 0) {
        require((msg.value > activeSellOffers[tokenId].minPrice),
            "Sell order at this price or lower exists");
        }
        // Only process the offer if it is higher than the previous one or the
        // previous one has expired
        require(activeBuyOffers[tokenId].createTime <
                (block.timestamp - 1 days) || msg.value >
                activeBuyOffers[tokenId].price,
                "Previous buy offer higher or not expired");
        address previousBuyOfferOwner = activeBuyOffers[tokenId].buyer;
        uint256 refundBuyOfferAmount = buyOffersEscrow[previousBuyOfferOwner]
        [tokenId];
        // Refund the owner of the previous buy offer
        buyOffersEscrow[previousBuyOfferOwner][tokenId] = 0;
        if (refundBuyOfferAmount > 0) {
            payable(previousBuyOfferOwner).call{value: refundBuyOfferAmount}('');
        }
        // Create a new buy offer
        activeBuyOffers[tokenId] = BuyOffer({buyer : msg.sender,
                                             price : msg.value,
                                             createTime : block.timestamp});
        // Create record of funds deposited for this offer
        buyOffersEscrow[msg.sender][tokenId] = msg.value;
        // Broadcast the buy offer
        emit NewBuyOffer(tokenId, msg.sender, msg.value);
    }

    /// @notice Withdraws a buy offer. Can only be withdrawn a day after being
    ///         posted
    /// @param tokenId - id of the token whose buy order to remove
    function withdrawBuyOffer(uint256 tokenId)
    external lastBuyOfferExpired(tokenId) {
        require(activeBuyOffers[tokenId].buyer == msg.sender,
            "Not buyer");
        uint256 refundBuyOfferAmount = buyOffersEscrow[msg.sender][tokenId];
        // Set the buyer balance to 0 before refund
        buyOffersEscrow[msg.sender][tokenId] = 0;
        // Remove the current buy offer
        delete(activeBuyOffers[tokenId]);
        // Refund the current buy offer if it is non-zero
        if (refundBuyOfferAmount > 0) {
            msg.sender.call{value: refundBuyOfferAmount}('');
        }
        // Broadcast offer withdrawal
        emit BuyOfferWithdrawn(tokenId, msg.sender);
    }

    /// @notice Lets a token owner accept the current buy offer
    ///         (even without a sell offer)
    /// @param tokenId - id of the token whose buy order to accept
    function acceptBuyOffer(uint256 tokenId)
    external isMarketable(tokenId) tokenOwnerOnly(tokenId) {
        address currentBuyer = activeBuyOffers[tokenId].buyer;
        require(currentBuyer != address(0),
            "No buy offer");
        uint256 saleValue = activeBuyOffers[tokenId].price;
        uint256 netSaleValue = saleValue;
        // Pay royalties if applicable
        if (_checkRoyalties(_tokenContractAddress)) {
            netSaleValue = _deduceRoyalties(tokenId, saleValue);
        }
        // Delete the current sell offer whether it exists or not
        delete (activeSellOffers[tokenId]);
        // Delete the buy offer that was accepted
        delete (activeBuyOffers[tokenId]);
        // Withdraw buyer's balance
        buyOffersEscrow[currentBuyer][tokenId] = 0;
        // Transfer funds to the seller
        msg.sender.call{value: netSaleValue}('');
        // And token to the buyer
        token.safeTransferFrom(
            msg.sender,
            currentBuyer,
            tokenId
        );
        // Broadcast the sale
        emit Sale(tokenId,
            msg.sender,
            currentBuyer,
            saleValue);
    }

  


 

    modifier lastBuyOfferExpired(uint256 tokenId) {
        require(
            activeBuyOffers[tokenId].createTime < (block.timestamp - 1 days),
            "Buy offer not expired");
        _;
    }
    */


}