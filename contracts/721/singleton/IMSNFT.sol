//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
//import "../../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "../../../node_modules/@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

  // Rarity type
    /**
     * @dev Rarity type of token
     * @param Unique -- only one token can exist. use this type for something unique. high gas costs.
     * @param Limited -- there are limited number of tokens . use this type for multy-asset nft (erc-1155 like). safe gas costs
     * @param Unlimited -- there are unlimited number of tokens. use this when you want to sell 'clones' of your assets. so cheap that even you can afford it
     */
    enum RarityType {Unique, Limited, Unlimited}


     /**
   *                          Item information
   *    @dev ItemInfo contains meta information about Master/Item. 
   *    @param ipfs_link -- unique link to a ipfs
   *    @param author -- address of author
   *    @param rarity -- rarity of an item, see RarityType
   *    @param i_totalSupply -- it is not a total supply. total supply of a token is itemIds[mater_id].lenght
   */
    struct ItemInfo 
    {
    string ipfs_link;

    string description;
    address author;
    RarityType rarity;
  
    uint i_totalSupply; // 0 means infinite, this variable can be used as maximum positionOrder for limited rarity type
    // ACTUAL total supply for specific mastercopy can be getted as itemIds[master_id].lenght

    }


interface IMSNFT {

    /**
     * @dev Events about buying item. events named *Human stands for human readability
     * @param buyer -- user who buy item
     * @param master_id -- unique id of mastercopy
     * @param item_id -- unique id of item
     */
    event ItemBought(address indexed buyer,uint256 indexed master_id, uint256 indexed item_id);
    event ItemBoughtHuman(address buyer,uint256 master_id, uint256 item_id);

    //Mint new token
    event MintNewToken(address to, uint m_master_id, uint item_id);

    // Service event for debug
    event MasterIdReserved(address indexed author, uint256 indexed master_id);
    event MasterIdReservedHuman(address author, uint256 master_id);

    // MasterCopyCreation
    /**
     * @dev event about master-copy creation
     * @param master_id -- unique master id 
     * @param description -- indexed description, which can be key for search. we do not store description info in state, only in event
     * @param link -- link to a file in CDN
     */
    event MaterCopyCreated(address indexed author, uint256 master_id, string indexed description, string indexed link);
    event MasterCopyCreatedHuman(address author, uint256 indexed master_id, string description, string link);

    /**
     *  @dev This function 'plug' itemsale contract from factory to mastersales map (works only for MoonShard NFT, should be called after MasterCopy creation)
     *  @param organizer -- address of seller (author)
     *  @param _masterId -- Id of mastercopy, which has been created by CreateMasterCopy
     *  @param _sale -- address of crowdsale contract. Note that this function can be called only from factory.
     */
    function PlugCrowdSale(address organizer, uint256 _masterId, address _sale) external;
  
    /**
     * @dev create Master Copy of item (without starting sale). It wraps file info into nft and create record in blockchain. Other items(tokens) are just links to master record
     * @param link -- link to a file
     * @param _author -- address of author
     * @param _description -- indexed description to be stored in events
     * @param _supplyType -- type of supply, where 1 is for unique nft, 0 for common nft, anything else is rare. Used to check inside mint func
     * @return c_master_id reserved mastercopy id
     */
    function createMasterCopy(string memory link, address payable _author ,string memory _description, uint256 _supplyType) external returns(uint256 c_master_id);

    /**
     *  @dev get rarity of specific master
     *  @param _masterId master copy id
     *  @return RarityType 
     */
    function get_rarity(uint256 _masterId) external view returns (RarityType);

    /**
     * @dev this function emit item outside of buying mechanism, only owner of master can call it
     * @param to whom minted token will be sent
     * @param m_master_id id of mastercopy
     */
    function EmitItem(address to, uint m_master_id, uint file_order_) external; 

    /**
     *  @dev external function for buying items, should be invoked from tokensale contract
     *  @param buyer address of buyer
     *  
     *  @param master_id Master copy id 
     */
    function buyItem(address buyer, uint256 master_id, uint file_order_) external;

    /**
    *   @dev transfer authorship of mastercopy. authorship allow getting royalties from MetaMarketplace. There are no restriction to rarity type
    */
    function transferAuthorship(uint master_id_) external; 
    
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external; 

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) external;

    // This function is burning tokens. 
    // @deprecated
    /*
    function redeemTicket(address owner,uint256 tokenId, uint256 event_id) external;

    /**
     * @dev get itemSale contract address template
     */
    function getItemSale(uint256 master_id) external view returns(address);

    /**
     *  @dev get author of master
     */
    function get_author(uint256 _masterId) external view returns (address payable _author); 

    function get_master_id_by_link (string memory link_) external view returns (uint256 _masterId); 

    function get_author_by_link(string memory link_) external view returns (address author_); 

    function get_author_by_token_id(uint256 item_id) external view returns (address author_);

    /**
     *  @dev get masterIds array for specific creator address
     *  IMPORTANT -- author_masterids contain only *originally* created master_ids. If authorsip is changed there are no updates in this array
     *  to get *current* authorship of a token use get_author_by_token_id or get_author
     */
    function getMasterIdByAuthor(address _creator) external view returns (uint[] memory);

    /**
     *  @dev get ItemInfo by item id
     *  @param item_id item id (equal to tokenid)
     */
    function getInfobyItemId(uint item_id) external view returns (ItemInfo memory);

    /**
     *  @dev update factory address. as we deploy separately this contract, then factory contract, then we need to update factory address outside of MSNFT constructor
     *  also, it may be useful if we would need to upgrade tokensale contract (which include upgrade of a factory contract), so it can be used when rollup new versions of factory and sale 
     */
    /*

    Interfaces do not support function modifiers, so the onlyOwner modifier was deleted in the function below. Check if it's still may be used only by owner.
    */
    function updateFactoryAddress(address factory_address_) external; 

    function getFactoryAddress() external view returns(address); 

     ///  Informs callers that this contract supports IERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
    external view
    returns (bool); 

    /*
    Usefull tips:
    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // Array with all token ids, used for enumeration
    uint256[] private _allTokens;

    // Mapping from token id to position in the allTokens array
    mapping(uint256 => uint256) private _allTokensIndex;

    Gets the list of token IDs of the requested owner.
     function _tokensOfOwner(address owner) internal view returns (uint256[] storage) {
        return _ownedTokens[owner];
    }
    */

}