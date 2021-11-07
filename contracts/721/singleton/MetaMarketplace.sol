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
    }

    struct BuyOffer {
        address buyer;
        uint256 price; 
        uint256 createTime;
    }

    // MSNFT, 721Enumerable,721Metadata, erc721(common)
    enum NftType {MoonShard, Enum, Meta, Common}

    struct Marketplace {
        // Store all active sell offers  and maps them to their respective token ids
        mapping(uint256 => SellOffer) activeSellOffers;
        // Store all active buy offers and maps them to their respective token ids
        mapping(uint256 => mapping(CurrenciesERC20.CurrencyERC20 => BuyOffer)) activeBuyOffers;
        // Escrow for buy offers
        mapping(address => mapping(uint256 => mapping(CurrenciesERC20.CurrencyERC20=>uint256))) buyOffersEscrow;
       
        // defines which interface to use for interaction with NFT
        NftType nft_standard;
        bool initialized;
    }

    // from nft token contract address to marketplace
    mapping(address => Marketplace) public Marketplaces;


    // Currencies lib
    CurrenciesERC20 _currency_contract;

    uint public promille_fee = 25; // service fee (2.5%)
    // Address where we collect comission
    address payable public _treasure_fund;
    
    
    //Hardcode interface_id's
    bytes4 private constant _INTERFACE_ID_MSNFT = 0x780e9d63;
    bytes4 private constant _INTERFACE_ID_IERC721ENUMERABLE = 0x780e9d63;
    bytes4 private constant _INTERFACE_ID_IERC721METADATA = 0x5b5e139f;
    bytes4 private constant _INTERFACE_ID_IERC721= 0x7aa5391d;      // WRONG  @todo: add correct interface id to IERC721
    //bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;


    // Events
    event NewSellOffer(address nft_contract_, uint256 tokenId, address seller, uint256 value);
    event NewBuyOffer(uint256 tokenId, address buyer, uint256 value);
    event SellOfferWithdrawn(address nft_contract_, uint256 tokenId, address seller);
    event BuyOfferWithdrawn(uint256 tokenId, address buyer);
    event CalculatedFees(uint256 initial_value, uint256 fees, uint256 transfered_amount, address feeAddress);
   // event RoyaltiesPaid(uint256 tokenId, uint value);
    event Sale(address nft_contract_, uint256 tokenId, address seller, address buyer, uint256 value);
    

    constructor(address currency_contract_, address msnft_token_,address treasure_fund_) 
    {
        _currency_contract = CurrenciesERC20(currency_contract_);
        require(_checkStandard(msnft_token_, NftType.MoonShard), "Standard not supported");
        SetUpMarketplace(msnft_token_, NftType.MoonShard);      // set up MSNFT ready for sale
        treasure_fund_ = _treasure_fund;
    }


    function SetUpMarketplace(address nft_token_, NftType standard_) public 
    {   
        require(Marketplaces[nft_token_].initialized == false, "Marketplace is already setted up");

        Marketplace storage metainfo = Marketplaces[nft_token_];
        metainfo.nft_standard = standard_;
        metainfo.initialized = true;
    }



    /**
    *   @notice check if contract support specific nft standard
    *   @param standard_ is one of ERC721 standards (MSNFT, 721Enumerable,721Metadata, erc721(common))
    *   it will return false if contract not support specific interface
    */
    function _checkStandard(address contract_, NftType standard_) internal view returns (bool) {

        
        if(standard_ == NftType.MoonShard) {
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
    * @param nft_contract_ -- address of nft contract
    */
    function makeSellOffer(uint256 tokenId, uint256 minPrice, address nft_contract_, CurrenciesERC20.CurrencyERC20 currency_)
    external marketplaceSetted(nft_contract_) isMarketable(tokenId,nft_contract_) tokenOwnerOnly(tokenId,nft_contract_) 
    {
        Marketplace storage metainfo = Marketplaces[nft_contract_];
        // Create sell offer
        metainfo.activeSellOffers[tokenId].minPrice[currency_] = minPrice;
        metainfo.activeSellOffers[tokenId].seller = msg.sender;

        // Broadcast sell offer
        emit NewSellOffer(nft_contract_,tokenId, msg.sender, minPrice);
    }


    /**
    * @notice Withdraw a sell offer. It's called by the owner of nft. 
    *         it will remove offer for every currency (it's intended behaviour)
    * @param tokenId - id of the token whose sell order needs to be cancelled
    * @param nft_contract_ - address of nft contract
    */
    function withdrawSellOffer(address nft_contract_,uint256 tokenId)
    external marketplaceSetted(nft_contract_) isMarketable(tokenId, nft_contract_)
    {
        Marketplace storage metainfo = Marketplaces[nft_contract_];
        require(metainfo.activeSellOffers[tokenId].seller != address(0),
            "No sale offer");
        require(metainfo.activeSellOffers[tokenId].seller == msg.sender,
            "Not seller");
        // Removes the current sell offer
        delete (metainfo.activeSellOffers[tokenId]);
        // Broadcast offer withdrawal
        emit SellOfferWithdrawn(nft_contract_,tokenId, msg.sender);
    }


    /*      UNDER CONSIDERATION
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


    /**
    * @notice Purchases a nft-token. Require active sell offer from owner of nft. Otherwise use makeBuyOffer
    *         also require bid_price_ equal or bigger than desired price from sell offer
    * @param tokenId - id of the token to sell
    * @param bid_price_ -- price buyer is willing to pay to the seller
    */
    function purchase(address token_contract_,uint256 tokenId,CurrenciesERC20.CurrencyERC20 currency_, uint256 bid_price_)
    external marketplaceSetted(token_contract_) tokenOwnerForbidden(tokenId,token_contract_) {
       
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

        require(metainfo.activeSellOffers[tokenId].minPrice[currency_] > 0, "price for this currency has not been setted, use makeBuyOffer() instead");
        require(bid_price_ >= metainfo.activeSellOffers[tokenId].minPrice[currency_],
            "Bid amount lesser than desired price!");
      
        // Pay royalties if applicable
        /*
        if (_checkRoyalties(_tokenContractAddress)) {
            saleValue = _deduceRoyalties(tokenId, saleValue);
        }
        */

        // Transfer funds (ERC20-currency) to the seller and distribute fees
        if(_forwardFunds(currency_,msg.sender,seller,bid_price_) == false) {
            delete metainfo.activeBuyOffers[tokenId][currency_];                    // if we can't move funds from buyer to seller, then buyer either don't have enough balance nor approved spending this much, so we delete this order
            revert("Approved amount is lesser than (bid_price_) needed to deal");
        }
        
        // And transfer nft_token to the buyer
        token.safeTransferFrom(
            seller,
            msg.sender,
            tokenId
        );

        // Remove all sell and buy[currency_] offers
        delete (metainfo.activeSellOffers[tokenId]);            // this nft is SOLD, remove all SellOffers
        // @note: next line will delete offers by specific currency, which help us to avoid situtation when buyer offers made in another currency clog in this contract
        delete (metainfo.activeBuyOffers[tokenId][currency_]);  // at least it was most successful order from BuyOffers by *this* currency. Orders for buy for other currencies still alive
        
        // Broadcast the sale
        emit Sale( token_contract_,
            tokenId,
            seller,
            msg.sender,
            bid_price_);
    }



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
    function makeBuyOffer(address token_contract_, uint256 tokenId,CurrenciesERC20.CurrencyERC20 currency_, uint256 bid_price_)
    external marketplaceSetted(token_contract_) tokenOwnerForbidden(tokenId,token_contract_)
     {

        Marketplace storage metainfo = Marketplaces[token_contract_];
        // Reject the offer if item is already available for purchase at a
        // lower or identical price
        if (metainfo.activeSellOffers[tokenId].minPrice[currency_] != 0) {
        require((bid_price_ > metainfo.activeSellOffers[tokenId].minPrice[currency_]),
            "Sell order at this price or lower exists");
            // TODO: execute purchase if price is lower instead of revert
        }

        // Only process the offer if it is higher than the previous one or the
        // previous one has expired
        require(metainfo.activeBuyOffers[tokenId][currency_].createTime <
                (block.timestamp - 1 days) || bid_price_ >
                metainfo.activeBuyOffers[tokenId][currency_].price,
                "Previous buy offer higher or not expired");

        address previousBuyOfferOwner = metainfo.activeBuyOffers[tokenId][currency_].buyer;
        uint256 refundBuyOfferAmount = metainfo.buyOffersEscrow[previousBuyOfferOwner]
        [tokenId][currency_];
        // Refund the owner of the previous buy offer
        if (refundBuyOfferAmount > 0) {
           _sendRefund(currency_, previousBuyOfferOwner, refundBuyOfferAmount);
        }
        metainfo.buyOffersEscrow[previousBuyOfferOwner][tokenId][currency_] = 0;    // zero escrow after refund
        
        // Create a new buy offer
        metainfo.activeBuyOffers[tokenId][currency_].buyer = msg.sender;
        metainfo.activeBuyOffers[tokenId][currency_].price = bid_price_;
        metainfo.activeBuyOffers[tokenId][currency_].createTime = block.timestamp;
        // Create record of funds deposited for this offer
        metainfo.buyOffersEscrow[msg.sender][tokenId][currency_] = bid_price_;    


        // Broadcast the buy offer
        emit NewBuyOffer(tokenId, msg.sender, bid_price_);
    }

    

    /**  @notice Withdraws a buy offer. Can only be withdrawn a day after being posted
    *    @param tokenId - id of the token whose buy order to remove
    *    @param currency_ -- in which currency we want to remove offer
    */
    function withdrawBuyOffer(address token_contract_,uint256 tokenId,CurrenciesERC20.CurrencyERC20 currency_)
    external marketplaceSetted(token_contract_) lastBuyOfferExpired(tokenId,token_contract_,currency_) {
        
        Marketplace storage metainfo = Marketplaces[token_contract_];
        require(metainfo.activeBuyOffers[tokenId][currency_].buyer == msg.sender,
            "Not buyer");
        uint256 refundBuyOfferAmount = metainfo.buyOffersEscrow[msg.sender][tokenId][currency_];
        // Set the buyer balance to 0 before refund ---- ??? why? (i removed this but stick this comment in case of fire)
 
        // Refund the current buy offer if it is non-zero
        if (refundBuyOfferAmount > 0) {
            _sendRefund(currency_, msg.sender, refundBuyOfferAmount);
        }

        // Set the buyer balance to 0 after refund 
        metainfo.buyOffersEscrow[msg.sender][tokenId][currency_] = 0;
        // Remove the current buy offer
        delete(metainfo.activeBuyOffers[tokenId][currency_]);

        // Broadcast offer withdrawal
        emit BuyOfferWithdrawn(tokenId, msg.sender);
    }



    /** @notice Lets a token owner accept the current buy offer
    *         (even without a sell offer)
    * @param tokenId - id of the token whose buy order to accept
    * @param currency_ - in which currency we want to accept offer
    */
    function acceptBuyOffer(address token_contract_, uint256 tokenId,CurrenciesERC20.CurrencyERC20 currency_ )
    external isMarketable(tokenId,token_contract_) tokenOwnerOnly(tokenId,token_contract_) {
        Marketplace storage metainfo = Marketplaces[token_contract_];
        address currentBuyer = metainfo.activeBuyOffers[tokenId][currency_].buyer;
        require(currentBuyer != address(0),
            "No buy offer");
        uint256 bid_value = metainfo.activeBuyOffers[tokenId][currency_].price;
        // Pay royalties if applicable
        /*
        if (_checkRoyalties(_tokenContractAddress)) {
            netSaleValue = _deduceRoyalties(tokenId, saleValue);
        }
        */

        // Delete the current sell offer whether it exists or not
        delete (metainfo.activeSellOffers[tokenId]);
        // Delete the buy offer that was accepted
        delete (metainfo.activeBuyOffers[tokenId][currency_]);
        // Withdraw buyer's balance
        metainfo.buyOffersEscrow[currentBuyer][tokenId][currency_] = 0;

        
        // Transfer funds to the seller
        // Tries to forward funds from buyer to seller and distribute fees
        if(_forwardFunds(currency_,currentBuyer,msg.sender,bid_value) == false) {
            delete metainfo.activeBuyOffers[tokenId][currency_];
            revert("Bad buy offer");
        }
        
        // And transfer nft token to the buyer
        IERC721 token = IERC721(token_contract_);
        token.safeTransferFrom(msg.sender,currentBuyer,tokenId);
    
        // Broadcast the sale
        emit Sale( token_contract_,
            tokenId,
            msg.sender,
            currentBuyer,
            bid_value);
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
        return a * c * scale + a * d + b * c + (b * d + scale - 1) / scale;
    }

      /**
     * @dev Determines how ERC20 is stored/forwarded on purchases. Here we take our fee. This function can be tethered to buy tx or can be separate from buy flow.
     * @notice transferFrom(from_) to this contract and then split payments into treasure_fund fee and send rest of it to_ .  Will return false if approved_balance < amount
     * @param currency_ ERC20 currency. Seller should specify what exactly currency he/she want to out
     */
    function _forwardFunds(CurrenciesERC20.CurrencyERC20 currency_, address from_, address to_, uint256 amount) internal returns (bool){
       
        IERC20 _currency_token = _currency_contract.get_hardcoded_currency(currency_);
        uint256 approved_balance = _currency_token.allowance(from_, address(this));
        if(approved_balance < amount) {
           // revert("Bad buy offer");
           return false;    // return false if spender have not approved balance for deal
        }

        uint256 scale = 1000;
        uint256 fees = calculateFee(amount,scale);
        uint256 net_amount = amount - fees;
        require(_currency_token.transferFrom(from_, address(this), amount), "MetaMarketplace: ERC20: transferFrom buyer to metamarketplace contract failed ");  // pull funds
        _currency_token.transfer(to_, net_amount);      // forward funds
        _currency_token.transfer(_treasure_fund, fees); // collect fees
        uint256 r = amount + fees;
        emit CalculatedFees(r,fees,amount,_treasure_fund);
        return true;
    }

    // Unsafe refund
    function _sendRefund(CurrenciesERC20.CurrencyERC20 currency_, address to_, uint256 amount_) internal {
        IERC20 _currency_token = _currency_contract.get_hardcoded_currency(currency_);
        require(_currency_token.transfer(to_, amount_), "Can't send refund");
    }


    modifier marketplaceSetted(address mplace_) {
        require(Marketplaces[mplace_].initialized == true,
            "Marketplace for this token is not setup yet!");
        _; 
    }



    modifier isMarketable(uint256 tokenId, address nft_contract_) {
        require(Marketplaces[nft_contract_].initialized == true,
            "Marketplace for this token is not setup yet!");
        IERC721Enumerable token = IERC721Enumerable(nft_contract_);
        require(token.getApproved(tokenId) == address(this),
            "Not approved");
        _;
    }

    // TODO: check this 
    modifier tokenOwnerOnly(uint256 tokenId, address nft_contract_) {
       IERC721 token = IERC721(nft_contract_);
        require(token.ownerOf(tokenId) == msg.sender,
            "Not token owner");
        _;
    }

    modifier tokenOwnerForbidden(uint256 tokenId,address nft_contract_) {
        IERC721 token = IERC721(nft_contract_);
        require(token.ownerOf(tokenId) != msg.sender,
            "Token owner not allowed");
        _;
    }


    modifier lastBuyOfferExpired(uint256 tokenId,address nft_contract_,CurrenciesERC20.CurrencyERC20 currency_) {
       Marketplace storage metainfo = Marketplaces[nft_contract_];
        require(
            metainfo.activeBuyOffers[tokenId][currency_].createTime < (block.timestamp - 1 days),   // TODO: check this
            "Buy offer not expired");
        _;
    }

}