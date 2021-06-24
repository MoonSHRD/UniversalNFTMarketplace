pragma solidity ^0.8.0;

import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "../../../node_modules/@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";







// Ticket is ERC721 (NFT) token with  availability to reedem tickets

/**

    ERC-721 is non-fungible token.  So, each tokenID is a unique ticket

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



 **/

contract MSNFT is ERC721Enumerable {
   using SafeMath for uint256;
   using Counters for Counters.Counter;



    // Master -- Mastercopy, abstraction
    // Item -- originate from mastercopy (nft-token)



    //events
    event ItemBought(address indexed visitor_wallet,uint256 indexed event_id, uint256 indexed ticket_id);
    event ItemBoughtHuman(address visitor_wallet,uint256 event_id, uint256 ticket_id);
 //   event TicketFulfilled(address indexed visitor_wallet,uint256 indexed event_id, uint256 indexed ticket_id);   // FIXME: add date to event?
   // event TicketFulfilledHuman(address visitor_wallet,uint256 event_id, uint256 ticket_id);
    event MasterIdReserved(address indexed ticket_sale, uint256 indexed event_id);
    event MasterIdReservedHuman(address ticket_sale, uint256 event_id);

    // Global counters for ticket_id and event_id
    Counters.Counter _item_id_count;
    Counters.Counter _master_id_count;


    // Motherland
    address factory_address;



    // Ticket lifecycle
    enum TicketState {Non_Existed, Paid, Fulfilled, Cancelled}

    // Rarity type
    // Unique -- the one
    // Rare -- limited
    // Common -- unlimited
    enum RarityType {Unique, Rare, Common}

    // map from event id to ticketsale address
    // TIP: ticket type = array.length
    mapping(uint256 => address[]) public mastersales;
    // map from event id to ticket ids
    mapping (uint256 => uint256[]) public itemIds;
    // map fron token ID to its index in ticketIds
    mapping (uint256 => uint256) itemIndex;
    // map from ticket id to ticket info
    mapping (uint256 => ItemInfo) public itemInfoStorage;
    // map from sale address to organizer
    mapping(address => address) retailers;
    // map from event id to event JID
    mapping(uint256 => string) public JIDs;


    // map from MasterCopyId to Meta info
    mapping(uint256 => ItemInfo) public MetaInfo;


    /**
   * Ticket information
   */

    struct ItemInfo {
    
    string description;
    address author;
    //uint price;
  //  TicketState state;
    RarityType rarity;
   // Counters.Counter ticket_type;
    uint ticket_type;
  //  string event_JID;
  //  address sale_address;
  }



    
    constructor(string memory name_, string memory smbl_) ERC721(name_,smbl_) ERC721Enumerable() {
      //  _addMinter(address(this));
        factory_address = msg.sender;
    }

    /*
    // FIXME: approve for ticketsale, not factory
    function setApprovalForEvent(address _owner, address ticketsale) internal{
        bool approved;
        super._operatorApprovals[_owner][ticketsale] = approved;
        emit ApprovalForAll(_owner, ticketsale, approved);
    }
    */

    function _transferFromTicket(address from, address to, uint256 tokenId) public {
        super.safeTransferFrom(from, to, tokenId);
    }

    // TODO - check for event_id already existed
    function reserveMasterIdForSale(address orginizer, string memory jid) public returns(uint256 master_id){
       
        master_id = _reserveMasterId();

      //  eventsales[event_id] = msg.sender;
        mastersales[master_id].push(msg.sender);
        retailers[msg.sender] = orginizer;
        JIDs[master_id] = jid;
        // Roles for minting has been removed in zeppeline 0.8.0 erc721
        //_addMinter(msg.sender);

        // Rarity set



        
        return master_id;
    }

    function PlugCrowdSale(address organizer, uint256 _masterId, address _sale) public {
        // only factory knows about crowdsale contracts and only she should have access to this
        require(msg.sender == factory_address, "only factory can plug crowdsale");
        // only author of asset can plug crowdsale
        ItemInfo memory meta;
        meta = MetaInfo[_masterId];
        address author = meta.author;
        require(author == organizer, "you don't own to this master id");
        mastersales[_masterId].push(_sale);

    }

    function _reserveMasterId() internal returns(uint256 _master_id) {
        _master_id_count.increment();
        _master_id = _master_id_count.current();

        emit MasterIdReserved(msg.sender,_master_id);
        emit MasterIdReservedHuman(msg.sender,_master_id);

        return _master_id;
    }

    function createMasterCopy(address _author ,string memory _description, uint256 _supplyType) public returns(uint256 master_copy_id){


        // TODO
        // Add security check, should be only factory(?)

        uint256 mid = _reserveMasterId();
        RarityType _rarity = set_rarity(_supplyType);
        MetaInfo[mid] = ItemInfo(_description,_author,_rarity,1);
        
        // TODO -- emit event about master copy creation?


        // return mastercopy id
        return mid;
    }

     function set_rarity(uint256 _supplyType) private returns(RarityType _rarity) {
       
        // only one token exist
        if (_supplyType == 1) {
            _rarity = RarityType.Unique;
        }
        // Unlimited sale
        if (_supplyType == 0) {
            _rarity = RarityType.Common;
        } else {
            // Limited sale
            _rarity = RarityType.Rare;
        }
        return _rarity;


    }

/*
    function get_rarity() public view returns (MSNFT.RarityType) {
        return _rarity_type;
    }

*/

/*
    // plug additional sale for selling different types of ticket by one event
    function plugSale(uint256 event_id, address orginizer) public returns(uint) {
        address[] memory _sales = eventsales[event_id];
        address _sale = _sales[0];
        require(retailers[_sale] == orginizer, "only orginizer can plug item");
        eventsales[event_id].push(msg.sender);
        uint type_count = getTicketTypeCount(event_id);
        return type_count;
    }
    */

    //TODO - return ticketIDs(?)
    function buyTicket(address buyer, uint256 itemAmount, uint256 master_id, uint _ticket_type) public{
        address[] memory _sales = mastersales[master_id];
        address _sale = _sales[_ticket_type - 1]; // array start from 0
        require(_sale == msg.sender, "you should call buyTicket from ticketsale contract");
        for (uint256 i = 0; i < itemAmount; i++ ){
            _item_id_count.increment();
            uint256 item_id = _item_id_count.current();

            _mint(buyer,item_id);
            string memory jid = getJidbyEventID(master_id);
            itemInfoStorage[item_id] = ItemInfo(TicketState.Paid,RarityType.State,_ticket_type, jid,_sale);
            itemIndex[item_id] = itemIds[master_id].length;
            itemIds[master_id].push(item_id);
            // approve for ticketsale (msg.sender = ticketsale)
          //  approve(msg.sender, ticket_id);
         //   setApprovalForEvent(buyer,msg.sender);
            emit ItemBought(buyer,master_id,item_id);
            emit ItemBoughtHuman(buyer,master_id,item_id);
        }

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


/*          Deprecated as there are no Tickets anymore.
            Can be revived if there are a need for 'expiration' mode

     function redeemTicket(address visitor, uint256 tokenId, uint256 event_id) public{
        address[] memory _sales = eventsales[event_id];
        TicketInfo memory info = ticketInfoStorage[tokenId];
        address _sale = _sales[info.ticket_type - 1];
        require(_sale == msg.sender, "you should call scan from ticketsale contract");
        require(ticketInfoStorage[tokenId].state == TicketState.Paid, "Ticket state must be Paid");
        info.state = TicketState.Fulfilled;
        ticketInfoStorage[tokenId] = info;
        emit TicketFulfilled(visitor,event_id,tokenId);
        emit TicketFulfilledHuman(visitor, event_id,tokenId);
    }

    function refundTicket(address visitor,uint256 tokenId, uint256 event_id) public returns(bool) {
        address[] memory _sales = eventsales[event_id];
        TicketInfo memory info = ticketInfoStorage[tokenId];
        address _sale = _sales[info.ticket_type - 1];
        require(_sale == msg.sender, "you should call refund from ticketsale contract");
        // check status
        TicketState status = getTicketStatus(tokenId);
        require(status == TicketState.Paid, "ticket status is not valid");
        _transferFromTicket(visitor, msg.sender, tokenId);
        info.state = TicketState.Cancelled;
        ticketInfoStorage[tokenId] = info;
        return true;
    }
    */

/*
    function getTicketTypeCount(uint256 event_id) public view returns(uint) {
        address[] memory _sales = eventsales[event_id];
        uint ticket_type = _sales.length;
        return ticket_type;
    }
*/

//                  FIXME: fix get items of owner
/*
  //  Gets the list of token IDs of the requested owner.
     function _tokensOfOwner(address owner) internal view returns (uint256[] storage) {
        return super._ownedTokens[owner];
    }



    function getTicketByOwner(address _owner) public view returns(uint256[] memory) {
        uint256[] storage tickets = _tokensOfOwner(_owner);
        return tickets;
    }
*/


    function getTicketSales(uint256 master_id) public view returns(address[] memory) {
        address[] memory sales = mastersales[master_id];
        return sales;
    }

    function getJidbyEventID(uint256 master_id) public view returns (string memory jid) {
        jid = JIDs[master_id];
        return jid;
    }

    function getJidByTicketId(uint item_id) public view returns (string memory jid) {
        ItemInfo memory info = itemInfoStorage[item_id];
        jid = info.event_JID;
        return jid;
    }

    function getTicketStatus(uint item_id) public view returns (TicketState status) {
        ItemInfo memory info = itemInfoStorage[item_id];
        status = info.state;
        return status;
    }
}