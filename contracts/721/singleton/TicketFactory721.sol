pragma solidity ^0.8.0;
//"SPDX-License-Identifier: UNLICENSED"
//import './zeppeline/token/ERC20/ERC20Mintable.sol';



import './MSNFT.sol';
import './TicketSale721.sol';
//import './TicketSalePluggable.sol';



contract TicketFactory721 {

// constant
address master_template;

address payable treasure_fund;

// event
// TODO : rework events completely
event SaleCreated(address indexed organizer, uint price, uint256 indexed event_id, string indexed event_JID);
event SaleCreatedHuman(address organizer, uint price, uint256 event_id, string event_JID, uint ticket_type);
event PluggedSale(address indexed organizer, address indexed orginal_sale, uint256 indexed event_id);
event PluggedSaleHuman(address organizer, address original_sale, uint256 event_id, uint ticket_type);

// mapping from JID to event_id
//mapping (string => uint256) events_jids;

// mapping from author to master


// TODO : invoke createMSNFT when constructor
constructor(address _master, address payable _treasure_fund)  {
   // ticket_template = createMSNFT();
   master_template = _master;
   treasure_fund = _treasure_fund;
}


function createMSNFT() internal returns (address ticket_address) {
 //  address factory_address = address(this);
   string memory name_ = "MoonShardNFT";
   string memory smbl_ = "MSNFT";
   ticket_address = address(new MSNFT(name_,smbl_));
   return ticket_address;
}

// TODO -- work with interface?
function createTicketSale721(address organizer, uint price, MSNFT token,uint sale_limit, TokenSale721.CurrencyERC20 currency, uint _master_id) internal returns(address ticket_sale) {
    // calculate price
    //uint256 cena = calculateRate(price);
   // CurrencyERC20 currency = GetCurrencyEnum(currency_int);
    ticket_sale = address(new TicketSale721(organizer, token, sale_limit,treasure_fund, price, currency, _master_id));
    return ticket_sale;
}

/*
function createTicketSale(address payable organizer, uint price, string memory event_JID, uint sale_limit, uint timeToStart, TokenSale721.CurrencyERC20 currency) public returns (address ticket_sale_adr, uint256 event_id) {

    address ticket_adr = ticket_template;
    require(events_jids[event_JID] == 0, "sale with this JID is already created!");
    MSNFT ticket = MSNFT(ticket_adr);
    ticket_sale_adr = createTicketSale721(organizer, price, ticket,sale_limit, event_JID, timeToStart, currency);
    TicketSale721 ticket_sale = TicketSale721(ticket_sale_adr);

    event_id = ticket_sale.event_id();
    uint ticket_type = ticket_sale.ticket_type();
    events_jids[event_JID] = event_id;
    emit SaleCreated(organizer, price, event_id, event_JID);
    emit SaleCreatedHuman(organizer,price,event_id, event_JID, ticket_type);
    return(ticket_sale_adr, event_id);


}
*/

// supply type -- how much copies can have
// supplyType --> 1= unique, 0 = common, everything else is rare
//
function createMasterItem(string memory link, string memory _description, uint256 _supplyType) public returns (uint256 master_id) {
    address master_adr = master_template;
    address _author = msg.sender;
    MSNFT master = MSNFT(master_adr);
    master_id = master.createMasterCopy(link, _author, _description, _supplyType);
    return master_id;
}

function createItemSale(uint price, uint sale_limit, TokenSale721.CurrencyERC20 currency, uint f_master_id) public returns (address item_sale_adr) {
    address master_adr = master_template;
    address organizer = msg.sender;
    MSNFT item = MSNFT(master_adr);
    uint256 master_id = f_master_id;
    require(organizer == item.get_author(master_id), "you are not own this master to start selling items");
    item_sale_adr = createTicketSale721(organizer, price, item,sale_limit, currency, master_id);
   
   // Plug itemsale address to mastersale map
    item.PlugCrowdSale(organizer, master_id, item_sale_adr);
    return item_sale_adr;

}

/*
function PlugInTicketSale(address payable origin_sale, uint price, uint _sale_limit) public returns(address payable plugin_sale) {
    uint cena = calculateRate(price);
    plugin_sale = address(new TicketSalePluggable(cena,origin_sale, _sale_limit,treasure_fund));
    //TicketSale721 ticket_sale = TicketSale721(origin_sale);
    TicketSalePluggable plugin_sale_instance = TicketSalePluggable(plugin_sale);
    uint256 event_id = plugin_sale_instance.event_id();
    uint ticket_type = plugin_sale_instance.ticket_type();
    emit PluggedSale(msg.sender,origin_sale,event_id);
    emit PluggedSaleHuman(msg.sender, origin_sale, event_id, ticket_type);
    return plugin_sale;
}
*/


function getMasterTemplateAddress() public view returns(address) {
    return master_template;
}


/*
// I know there is a brutal hardcoded cheat, but I need to work fast
function GetCurrencyEnum (uint128 int_cur) public view returns (CurrencyERC20 enum_currency){
    if (int_cur = 0) {
        return enum_currency = CurrencyERC20.USDT;
    }
    if (int_cur = 1) {
        return enum_currency = CurrencyERC20.USDC;
    }
    if (int_cur = 2) {
        return enum_currency = CurrencyERC20.SNM;
    }

}
*/

}