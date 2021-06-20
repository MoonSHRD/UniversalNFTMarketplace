pragma solidity ^0.8.0;

//import "../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
//import '../../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Mintable.sol';
import "../../../node_modules/@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
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

contract Ticket721 is ERC721PresetMinterPauserAutoId {
   using SafeMath for uint256;
   using Counters for Counters.Counter;


    //events
    event TicketBought(address indexed visitor_wallet,uint256 indexed event_id, uint256 indexed ticket_id);
    event TicketBoughtHuman(address visitor_wallet,uint256 event_id, uint256 ticket_id);
    event TicketFulfilled(address indexed visitor_wallet,uint256 indexed event_id, uint256 indexed ticket_id);   // FIXME: add date to event?
    event TicketFulfilledHuman(address visitor_wallet,uint256 event_id, uint256 ticket_id);
    event EventIdReserved(address indexed ticket_sale, uint256 indexed event_id);
    event EventIdReservedHuman(address ticket_sale, uint256 event_id);

    // Global counters for ticket_id and event_id
    Counters.Counter _ticket_id_count;
    Counters.Counter _event_id_count;

    // Ticket lifecycle
    enum TicketState {Non_Existed, Paid, Fulfilled, Cancelled}

    // map from event id to ticketsale address
    // TIP: ticket type = array.length
    mapping(uint256 => address[]) public eventsales;
    // map from event id to ticket ids
    mapping (uint256 => uint256[]) public ticketIds;
    // map fron token ID to its index in ticketIds
    mapping (uint256 => uint256) ticketIndex;
    // map from ticket id to ticket info
    mapping (uint256 => TicketInfo) public ticketInfoStorage;
    // map from sale address to organizer
    mapping(address => address) retailers;
    // map from event id to event JID
    mapping(uint256 => string) public JIDs;


    /**
   * Ticket information
   */

    struct TicketInfo {
    //string description;
    //uint price;
    TicketState state;
   // Counters.Counter ticket_type;
    uint ticket_type;
    string event_JID;
    address sale_address;
  }

   // TicketInfo[] internal ticketStorage;



    //FIXME: invoke constructor from 721(?)
    constructor() public {
      //  _addMinter(address(this));
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
    function reserveEventId(address orginizer, string memory jid) public returns(uint256 event_id){
        _event_id_count.increment();
        event_id = _event_id_count.current();
      //  eventsales[event_id] = msg.sender;
        eventsales[event_id].push(msg.sender);
        retailers[msg.sender] = orginizer;
        JIDs[event_id] = jid;
        // Roles for minting has been removed in zeppeline 0.8.0 erc721
        //_addMinter(msg.sender);
        emit EventIdReserved(msg.sender,event_id);
        emit EventIdReservedHuman(msg.sender,event_id);
        return event_id;
    }

    // plug additional sale for selling different types of ticket by one event
    function plugSale(uint256 event_id, address orginizer) public returns(uint) {
        address[] memory _sales = eventsales[event_id];
        address _sale = _sales[0];
        require(retailers[_sale] == orginizer, "only orginizer can plug item");
        eventsales[event_id].push(msg.sender);
        uint type_count = getTicketTypeCount(event_id);
        return type_count;
    }

    //TODO - return ticketIDs(?)
    function buyTicket(address buyer, uint256 ticketAmount, uint256 event_id, uint _ticket_type) public{
        address[] memory _sales = eventsales[event_id];
        address _sale = _sales[_ticket_type - 1]; // array start from 0
        require(_sale == msg.sender, "you should call buyTicket from ticketsale contract");
        for (uint256 i = 0; i < ticketAmount; i++ ){
            _ticket_id_count.increment();
            uint256 ticket_id = _ticket_id_count.current();

            _mint(buyer,ticket_id);
            string memory jid = getJidbyEventID(event_id);
            ticketInfoStorage[ticket_id] = TicketInfo(TicketState.Paid,_ticket_type, jid,_sale);
            ticketIndex[ticket_id] = ticketIds[event_id].length;
            ticketIds[event_id].push(ticket_id);
            // approve for ticketsale (msg.sender = ticketsale)
          //  approve(msg.sender, ticket_id);
         //   setApprovalForEvent(buyer,msg.sender);
            emit TicketBought(buyer,event_id,ticket_id);
            emit TicketBoughtHuman(buyer,event_id,ticket_id);
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

    function getTicketTypeCount(uint256 event_id) public view returns(uint) {
        address[] memory _sales = eventsales[event_id];
        uint ticket_type = _sales.length;
        return ticket_type;
    }


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


    function getTicketSales(uint256 event_id) public view returns(address[] memory) {
        address[] memory sales = eventsales[event_id];
        return sales;
    }

    function getJidbyEventID(uint256 event_id) public view returns (string memory jid) {
        jid = JIDs[event_id];
        return jid;
    }

    function getJidByTicketId(uint ticket_id) public view returns (string memory jid) {
        TicketInfo memory info = ticketInfoStorage[ticket_id];
        jid = info.event_JID;
        return jid;
    }

    function getTicketStatus(uint ticket_id) public view returns (TicketState status) {
        TicketInfo memory info = ticketInfoStorage[ticket_id];
        status = info.state;
        return status;
    }
}