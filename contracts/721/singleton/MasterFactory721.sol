pragma solidity ^0.8.0;
//"SPDX-License-Identifier: UNLICENSED"
//import './zeppeline/token/ERC20/ERC20Mintable.sol';



import './MSNFT.sol';
import './TokenSale721.sol';

contract MasterFactory721 {

// constant
address public master_template;

address payable treasure_fund;

// event
event SaleCreated(address indexed author, uint price, CurrenciesERC20.CurrencyERC20 indexed currency, uint256 indexed master_id);
event SaleCreatedHuman(address author, uint price, CurrenciesERC20.CurrencyERC20 currency,uint256 master_id);



constructor(address msnft_,address payable _treasure_fund)  {
   // ticket_template = createMSNFT();
 //  master_template = createMSNFT();
   master_template = msnft_;
   treasure_fund = _treasure_fund;
}


/*
function createMSNFT() internal returns (address ticket_address) {
 //  address factory_address = address(this);
   string memory name_ = "MoonShardNFT";
   string memory smbl_ = "MSNFT";
   ticket_address = address(new MSNFT(name_,smbl_));
   return ticket_address;
}
*/

function createItemSale721(address organizer, uint price, MSNFT token,uint sale_limit, CurrenciesERC20.CurrencyERC20 currency, uint _master_id) internal returns(address ticket_sale) {
    // calculate price
    //uint256 cena = calculateRate(price);
   // CurrencyERC20 currency = GetCurrencyEnum(currency_int);
    ticket_sale = address(new TokenSale721(organizer, token, sale_limit,treasure_fund, price, currency, _master_id));
    return ticket_sale;
}


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

function createItemSale(uint price, uint sale_limit, CurrenciesERC20.CurrencyERC20 currency, uint f_master_id) public returns (address item_sale_adr) {
    address master_adr = master_template;
    address organizer = msg.sender;
    MSNFT item = MSNFT(master_adr);
    uint256 master_id = f_master_id;
    require(organizer == item.get_author(master_id), "you are not own this master to start selling items");
    item_sale_adr = createItemSale721(organizer, price, item,sale_limit, currency, master_id);
   
   // Plug itemsale address to mastersale map
    item.PlugCrowdSale(organizer, master_id, item_sale_adr);
    emit SaleCreated(msg.sender, price, currency, master_id);
    emit SaleCreatedHuman(msg.sender, price, currency, master_id);
    return item_sale_adr;

}


function getMasterTemplateAddress() public view returns(address) {
    return master_template;
}


}