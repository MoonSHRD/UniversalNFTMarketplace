pragma solidity ^0.8.0;
//"SPDX-License-Identifier: UNLICENSED"
//import './zeppeline/token/ERC20/ERC20Mintable.sol';

import './MSNFT.sol';
import './TokenSale721.sol';

/**
 *  Master Factory
 * @title MasterFactory721
 * @dev This contract is a public interfaceble end-point for users
 * Each time user want to create NFT he/she should cast createMasterItem
 * Each time user want to set up a tokensale he/she should cast createItemSale (with obtained master-id) from creation of Master-Item
 * It will create new tokensale contract and plug it to MSNFT (Master Token contract)
 * This contract doesn't deploy MSNFT itself, only TokenSale
 * 
 * If there is a need to upgrade tokensale mechanism it is required to upgrade and redeploy this factory, but not required to upgrade and redeploy Master (MSNFT) and vice-versa
 * 
 */
contract MasterFactory721 {

// constant
address public master_template;

address payable treasure_fund;

address public currencies_router;

// event
event SaleCreated(address indexed author, uint price, CurrenciesERC20.CurrencyERC20 indexed currency, uint256 indexed master_id, address it_sale);
event SaleCreatedHuman(address author, uint price, CurrenciesERC20.CurrencyERC20 currency,uint256 master_id, address it_sale);
event CreateMasterItem(string link, string _description, uint256 _supplyType, uint256 master_id);
/**
 * @param msnft_ address of Master token contract
 * @param currencies_router_ address of ERC20 currency router
 */
constructor(address msnft_,address payable _treasure_fund, address currencies_router_)  {
   master_template = msnft_;
   treasure_fund = _treasure_fund;
   currencies_router = currencies_router_;
}

/**
 *  @dev Create Item Sale for obtained master copy id
 */
function createItemSale721(address organizer, uint price, MSNFT token,uint sale_limit, CurrenciesERC20.CurrencyERC20 currency, uint _master_id) internal returns(address ticket_sale) {
    ticket_sale = address(new TokenSale721(organizer, token, sale_limit,treasure_fund, price, currency, _master_id,currencies_router));
    return ticket_sale;
}

/**
    @dev Creates Master copy of item, store its meta in blockchain
     supply type -- how much copies can have
     supplyType --> 1= unique, 0 = common, everything else is rare

    @param link magnet/ipfs link to file 
    @param _description of a file, stored in EVENTS, not in state
    @param _supplyType see above
    @return master_id id of a mastercopy
 */
function createMasterItem(string memory link, string memory _description, uint256 _supplyType) public payable returns (uint256 master_id) {
    address master_adr = master_template;
    address _author = msg.sender;
    MSNFT master = MSNFT(master_adr);
    master_id = master.createMasterCopy(link, _author, _description, _supplyType);
    emit CreateMasterItem(link, _description, _supplyType, master_id);
    return master_id;
}

/**
 @dev deploy new tokensale contract, for specific master_id and plug this sale to Master contract
 @param price in wei or least decimal (check this twice for USDT!)
 @param sale_limit how much tokens we want to sell, will fail if there are no consistency with rarity
 @param currency erc20 currency to set price, set equal price for all stables
 @param f_master_id master copy id, which we got from createMasterItem
 @return item_sale_adr address of deployed tokensale contract
 */
function createItemSale(uint price, uint sale_limit, CurrenciesERC20.CurrencyERC20 currency, uint f_master_id) public returns (address item_sale_adr) {
    address master_adr = master_template;
    address organizer = msg.sender;
    MSNFT item = MSNFT(master_adr);
    uint256 master_id = f_master_id;
    require(organizer == item.get_author(master_id), "you are not own this master to start selling items");
    item_sale_adr = createItemSale721(organizer, price, item,sale_limit, currency, master_id);
   
   // Plug itemsale address to mastersale map
    item.PlugCrowdSale(organizer, master_id, item_sale_adr);
    emit SaleCreated(msg.sender, price, currency, master_id, item_sale_adr);
    emit SaleCreatedHuman(msg.sender, price, currency, master_id, item_sale_adr);
    return item_sale_adr;
}

/**
    @dev return address of Master
 */
function getMasterTemplateAddress() public view returns(address) {
    return master_template;
}

}