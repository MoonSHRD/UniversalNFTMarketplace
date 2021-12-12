//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
//import "../../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "../../../node_modules/@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";


/**
 *      MoonShard Non-fungible Token
 *  @title MSNFT
 *  @author JackBekket
 *  @dev MSNFT is a ERC721Enumerable token contract
 *  ERC721Enumerable stand for singletone pattern, which mean each created NFT is NOT a separate contract, but record in this single contract
 * When user want's to create NFT -- he creates MasterCopy first (with link to a file), then he can emit items(tokens) or start crowdsale of them
 * Each token is ITEM. Each item is a link to a MasterCopy
 * Each NFT have a rarity type (Unique -- only one exist, Rare -- limited edition, Common -- unlimited edition)
 * createMasterCopy, plugSale, buyItem -- external intefaces to be called from factory contract 
*/
contract MSNFT is ERC721Enumerable, Ownable {

   using Counters for Counters.Counter;

    // Master -- Mastercopy, abstraction
    // Item -- originate from mastercopy (nft-token)
    
    //events
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

    // transfer authorship
    event AuthorshipTransferred(address old_author, address new_author, uint master_id);


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
     * @dev Global counters for item_id and master_id. They are replacing atomic lock algo for reserving id
     */
    Counters.Counter _item_id_count;
    Counters.Counter _master_id_count;


    // Motherland
    address private factory_address;    // ITS A VERY IMPORTANT TO KEEP THIS SAFE!!  THIS CONTRACT DO NOT KNOW ABOUT FACTORY CODE SO IT COULD BE REPLACED BY UNKNOWN CONTRACT AND GET ACCESS TO SERVICE FUNCTIONS
    // HOWEVER IT'S THE ONLY WAY TO MAKE THIS CONTRACT UPGRADABLE AND INDEPENDENT FROM FACTORY.



    // Ticket lifecycle @TODO: Maybe useful for migration in future
    //enum TicketState {Non_Existed, Paid, Fulfilled, Cancelled}

    // Rarity type
    /**
     * @dev Rarity type of token
     * @param Unique -- only one token can exist. use this type for something unique. high gas costs.
     * @param Limited -- there are limited number of tokens . use this type for multy-asset nft (erc-1155 like). safe gas costs
     * @param Unlimited -- there are unlimited number of tokens. use this when you want to sell 'clones' of your assets. so cheap that even you can afford it
     */
    enum RarityType {Unique, Limited, Unlimited}

    // map from mastercopy_id  to itemsale address
    mapping(uint256 => address) public mastersales;



     /*
                    @NOTE
            if we mint 3rd item for some master (and already have two minted items) then
            item_id is global counter and can't be determine (think of it as random). let's assume that we have our third token item_id = 245, and we minting for master_id = 18
            itemIndex[245] = itemIds[18].lenght // = 2
            itemIds[18] = itemIds[18].push(245) // = [x , y, 245] (3 elements array)
            
            itemIds is a map which return you array of items tethered to specific master
            arrays starts with 0, so item 245 will be stored as third element of array from itemIds[18] and can be getted from there 

        */

    // map from master_id to item ids
    mapping (uint256 => uint256[]) public itemIds; // -- length of this array can be used as totalSupply!  (total number of specific token (items) can be getted as itemIds[master].length)

    // map from token ID to its index in itemIds
    mapping (uint256 => uint256) itemIndex;         // -- each token have a position in itemIds array. itemIndex is help to track where exactly stored itemId in itemIds array. 

    
    
    // map from masterId to author address
    mapping(uint256 => address payable) public authors;

    // map from author address to masterIds array
    mapping(address => uint[]) public author_masterids; // can be used to get all objects created by one author. @note -- it contains array of ORIGINALLY created master_ids, if authorship was transfered this array will NOT change

    // map from itemId to masterId
    mapping(uint256 => uint256) public ItemToMaster;

    // map from link to master_id
    mapping(string => uint256) public links;

    // map from master id to fileOrder to itemId. Should be 0 if it is not collection. positionOrder is a file position order inside IPFS directory. Think of it as ancient CDROM's from 1990-s.
    mapping(uint256 => mapping(uint256 => uint256)) public positionOrder;

    // map from MasterCopyId to Meta info
    mapping(uint256 => ItemInfo) public MetaInfo;

    /**
   *                                                            Item information
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

    bytes4 private _INTERFACE_ID_IERC721ENUMERABLE = 0x780e9d63;


    constructor(string memory name_, string memory smbl_) ERC721(name_,smbl_) ERC721Enumerable() {
       // ERC721Enumerable._registerInterface(_INTERFACE_ID_IERC721ENUMERABLE);
    }

    //@todo should be changed visibility to external?
    /**
     *  @dev This function 'plug' itemsale contract from factory to mastersales map (works only for MoonShard NFT, should be called after MasterCopy creation)
     *  @param organizer -- address of seller (author)
     *  @param _masterId -- Id of mastercopy, which has been created by CreateMasterCopy
     *  @param _sale -- address of crowdsale contract. Note that this function can be called only from factory.
     */
    function PlugCrowdSale(address organizer, uint256 _masterId, address _sale) public {
        // only factory knows about crowdsale contracts and only she should have access to this
        require(msg.sender == factory_address, "MSNFT: only factory contract can plug crowdsale");
        // only author of asset can plug crowdsale
        ItemInfo memory meta;
        meta = MetaInfo[_masterId];
        address author = meta.author;
        require(author == organizer, "you don't own to this master id");
        require(mastersales[_masterId] == address(0), "MSNFT: you already have plugged sale ");

        // we set address just for ocasion if we deploy new version of tokensale in future
        mastersales[_masterId] = _sale;

    }

    /**
     * @dev safely reserve master_id
     * @param _author -- address of author
     * @return _master_id 
     */
    function _reserveMasterId(address _author) internal returns(uint256 _master_id) {
        _master_id_count.increment();
        _master_id = _master_id_count.current();

        emit MasterIdReserved(_author,_master_id);
        emit MasterIdReservedHuman(_author,_master_id);

        return _master_id;
    }


    // 
    /**
     * @dev create Master Copy of item (without starting sale). It wraps file info into nft and create record in blockchain. Other items(tokens) are just links to master record
     * @param link -- link to a file
     * @param _author -- address of author
     * @param _description -- indexed description to be stored in events
     * @param _supplyType -- type of supply, where 1 is for unique nft, 0 for common nft, anything else is rare. Used to check inside mint func
     * @return c_master_id reserved mastercopy id
     */
    function createMasterCopy(string memory link, address payable _author ,string memory _description, uint256 _supplyType) public returns(uint256 c_master_id){

        require(msg.sender == factory_address, "MSNFT: only factory contract can create mastercopy");

        uint256 mid = _reserveMasterId(_author);
        require(links[link] == 0, "MSNFT: file with that link already have been tethered");

        RarityType _rarity = set_rarity(_supplyType);
        uint m_totalSupply;
        if (_rarity == RarityType.Limited){
            m_totalSupply = _supplyType;
        } if (_rarity == RarityType.Unique) {
            m_totalSupply = 1;
        } if (_rarity == RarityType.Unlimited) {
            m_totalSupply = 0;  // infinite. which means it is not really totalSupply
        }
        MetaInfo[mid] = ItemInfo(link, _description,_author,_rarity, m_totalSupply);
        authors[mid] = _author;
        links[link] = mid;
        author_masterids[_author].push(mid);
        emit MaterCopyCreated(_author, mid, _description, link);
        emit MasterCopyCreatedHuman(_author,mid,_description,link);
        // return mastercopy id
        return mid;
    }

    

     /**
     * @dev setting rarity for token
     * @param _supplyType type of supply, see createMasterCopy
     * @return _rarity type of rarity based at supplyType
     */
     function set_rarity(uint256 _supplyType) private pure returns(RarityType _rarity) {

        if (_supplyType == 1) {         // Only one token exist
            _rarity = RarityType.Unique;
        }
        if (_supplyType == 0) {         // Unlimited sale
            _rarity = RarityType.Unlimited;
        } else {
            _rarity = RarityType.Limited;  // Limited sale
        }
        
        return _rarity;
    }


    /**
     *  @dev get rarity of specific master
     *  @param _masterId master copy id
     *  @return RarityType 
     */
    function get_rarity(uint256 _masterId) public view returns (RarityType) {
        
        ItemInfo memory meta;
        meta = MetaInfo[_masterId];
        RarityType _rarity_type = meta.rarity;
        return _rarity_type;
    }


    /**
     *  @dev Mint new token. Require master_id and item_id
     *  @param to whom address should mint
     *  @param m_master_id master copy of item
     *  @param item_id counter of item. There are no incrementation of this counter here, so make sure this function is purely internal(!)
     */
    function Mint(address to, uint m_master_id, uint item_id, uint file_order_) internal {

        ItemInfo memory meta;
        meta = MetaInfo[m_master_id];
     
        // Check rarity vs itemAmount
        if (meta.rarity == RarityType.Unique) {
            require(itemIds[m_master_id].length == 0 , "MSNFT: MINT: try to mint more than one of Unique Items");
        }
        if (meta.rarity == RarityType.Limited) {
            require(itemIds[m_master_id].length < meta.i_totalSupply," MSNFT: MINT: try to mint more than totalSupply of Limited token");
            require(positionOrder[m_master_id][file_order_] == 0, "MSNFT: limited item with this file_order_ is already minted");
            positionOrder[m_master_id][file_order_] = item_id;
        }
        
        _mint(to,item_id);

        /*
            
            if we mint 3rd item for some master (and already have two minted items) then
            item_id is global counter and can't be determine (think of it as random). let's assume that we have our third token item_id = 245, and we minting for master_id = 18
            itemIndex[245] = itemIds[18].lenght // = 2
            itemIds[18] = itemIds[18].push(245) // = [x , y, 245] (3 elements array)
            
            itemIds is a map which return you array of items tethered to specific master
            arrays starts with 0, so item 245 will be stored as third element of array from itemIds[18] and can be getted from there 

        */
        itemIndex[item_id] = itemIds[m_master_id].length;   // this item_id will be stored at itemIds[m_master_id] at this *position order*.  
        itemIds[m_master_id].push(item_id);               // this item is stored at itemIds and tethered to master_id
        ItemToMaster[item_id] = m_master_id;            // here we can store and obtain what mid is tethered to specific token id, so we can get MetaInfo for specific token fast

        positionOrder[m_master_id][0] = 0; // should be always zero if it is not limited rarity type
        emit MintNewToken(to, m_master_id, item_id);
    }


    /**
     * @dev this function emit item outside of buying mechanism, only owner of master can call it
     * @param to whom minted token will be sent
     * @param m_master_id id of mastercopy
     */
    function EmitItem(address to, uint m_master_id, uint file_order_) public {
        ItemInfo memory meta;
        meta = MetaInfo[m_master_id];
        require(msg.sender == meta.author, "MSNFT: only author can emit items outside of sale");

        _item_id_count.increment();
        uint256 item_id = _item_id_count.current();
        Mint(to, m_master_id, item_id,file_order_);
    }


    // @todo -- make external instead of public?
    /**
     *  @dev external function for buying items, should be invoked from tokensale contract
     *  @param buyer address of buyer
     *  
     *  @param master_id Master copy id 
     */
    function buyItem(address buyer, uint256 master_id, uint file_order_) public{
        address _sale = mastersales[master_id];
        require(_sale == msg.sender, "MSNFT: you should call buyItem from itemsale contract");

      
            _item_id_count.increment();
            uint256 item_id = _item_id_count.current();

            Mint(buyer, master_id, item_id, file_order_);
            
            emit ItemBought(buyer,master_id,item_id);
            emit ItemBoughtHuman(buyer,master_id,item_id);
    }


    /**
    *   @dev transfer authorship of mastercopy. authorship allow getting royalties from MetaMarketplace. There are no restriction to rarity type
    */
    function transferAuthorship(uint master_id_, address new_author_) public {
        require(authors[master_id_] == msg.sender, "MSNFT: you are not author of this master_id");
        address old_author_ = msg.sender;
        authors[master_id_] = payable(new_author_);
        emit AuthorshipTransferred(old_author_, new_author_, master_id_);
    }
    

    /**
    *   @dev update authorship for *unique* rarity token (setting owner of token to author), authors have privelege to 
    */
    function updateAuthorsip(uint tokenId) internal {

        uint _master_id = ItemToMaster[tokenId];
        address old_author_ = authors[_master_id];
        RarityType rarity_ = get_rarity(_master_id);
        if (rarity_ == RarityType.Unique) 
        {
            address owner_ = ownerOf(tokenId);
            authors[_master_id] = payable(owner_);
            emit AuthorshipTransferred(old_author_, owner_, _master_id);
        }

    }

    //override all token transfers, to update authorship automatically if appliciable

     function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
      super.transferFrom(from,to,tokenId);
      updateAuthorsip(tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
       super.safeTransferFrom(from,to,tokenId);
       updateAuthorsip(tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {

       super.safeTransferFrom(from,to,tokenId, _data);
       updateAuthorsip(tokenId);
    }

    /**
     * @dev See ERC721 _safeTransfer()
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal virtual override {
      super._safeTransfer(from,to,tokenId,_data);
      updateAuthorsip(tokenId);
    }

     /**
     * @dev See ERC721 _transfer()
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._transfer(from,to,tokenId);
        updateAuthorsip(tokenId);
    }


    // This function is burning tokens. 
    // @deprecated
    /*
    function redeemTicket(address owner,uint256 tokenId, uint256 event_id) public{
        require(eventsales[event_id] == msg.sender, "caller doesn't match with event_id");
        super._burn(owner,tokenId); 

       // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
       // then delete the last slot (swap and pop).


        uint256 ticket_index = ticketIndex[tokenId];
        uint256 lastTicketIndex = ticketIds[event_id].length.sub(1);

      //  uint256[] storage ticketIdArray = ticketIds[event_id];
      //  uint256 lastTicketId = ticketIdArray[lastTicketIndex];

        uint256 lastTicketId = ticketIds[event_id][lastTicketIndex];


        ticketIds[event_id][ticket_index] = lastTicketId; // Move the last token to the slot of the to-delete token
        ticketIndex[lastTicketId] = ticket_index;         // Update the moved token's index

        ticketIds[event_id].length--;  // remove last element in array
        ticketIndex[tokenId] = 0;


    }
    */


    /**
     * @dev get itemSale contract address template
     */
    function getItemSale(uint256 master_id) public view returns(address) {
        address sale = mastersales[master_id];
        return sale;
    }


    /**
     *  @dev get author of master
     */
    function get_author(uint256 _masterId) public view returns (address payable _author) {
        _author = authors[_masterId];
        return _author;
    }

    function get_master_id_by_link (string memory link_) public view returns (uint256 _masterId) {
        _masterId = links[link_];
        return _masterId;
    }

    function get_author_by_link(string memory link_) public view returns (address author_) {
        uint256 _masterId = get_master_id_by_link(link_);
        author_ = authors[_masterId];
        return author_;
    }

    function get_author_by_token_id(uint256 item_id) public view returns (address author_) {
        uint _master_id = ItemToMaster[item_id];
        author_ = authors[_master_id];
        return author_;
    }

    /**
     *  @dev get masterIds array for specific creator address
     *  IMPORTANT -- author_masterids contain only *originally* created master_ids. If authorsip is changed there are no updates in this array
     *  to get *current* authorship of a token use get_author_by_token_id or get_author
     */
    function getMasterIdByAuthor(address _creator) public view returns (uint[] memory) {
        return author_masterids[_creator];
    }

    /**
     *  @dev get ItemInfo by item id
     *  @param item_id item id (equal to tokenid)
     */
    function getInfobyItemId(uint item_id) public view returns (ItemInfo memory){
        uint master_id = ItemToMaster[item_id];
        ItemInfo memory _itemInfo = MetaInfo[master_id];
        return _itemInfo;
    }


    /**
     *  @dev update factory address. as we deploy separately this contract, then factory contract, then we need to update factory address outside of MSNFT constructor
     *  also, it may be useful if we would need to upgrade tokensale contract (which include upgrade of a factory contract), so it can be used when rollup new versions of factory and sale
     */
    function updateFactoryAddress(address factory_address_) public onlyOwner() {
        factory_address = factory_address_;
    }

    function getFactoryAddress() public view returns(address) {
        return factory_address;
    }


     ///  Informs callers that this contract supports IERC721Enumerable
    function supportsInterface(bytes4 interfaceId)
    public view override(ERC721Enumerable)
    returns (bool) {
       // return interfaceId == type(IERC2981).interfaceId ||
       // return interfaceId == super.supportsInterface(interfaceId);
       return interfaceId == type(IERC721Enumerable).interfaceId ||
       super.supportsInterface(interfaceId);
    }


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