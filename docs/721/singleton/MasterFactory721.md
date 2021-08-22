## `MasterFactory721`

 Master Factory


This contract is a public interfaceble end-point for users
Each time user want to create NFT he/she should cast createMasterItem
Each time user want to set up a tokensale he/she should cast createItemSale (with obtained master-id) from creation of Master-Item
It will create new tokensale contract and plug it to MSNFT (Master Token contract)
This contract doesn't deploy MSNFT itself, only TokenSale

If there is a need to upgrade tokensale mechanism it is required to upgrade and redeploy this factory, but not required to upgrade and redeploy Master (MSNFT) and vice-versa



### `constructor(address msnft_, address payable _treasure_fund, address currencies_router_)` (public)





### `createItemSale721(address organizer, uint256 price, contract MSNFT token, uint256 sale_limit, enum CurrenciesERC20.CurrencyERC20 currency, uint256 _master_id) → address ticket_sale` (internal)

 @dev Create Item Sale for obtained master copy id



### `createMasterItem(string link, string _description, uint256 _supplyType) → uint256 master_id` (public)



Creates Master copy of item, store its meta in blockchain
     supply type -- how much copies can have
     supplyType --> 1= unique, 0 = common, everything else is rare

    @param link magnet/ipfs link to file 
    @param _description of a file, stored in EVENTS, not in state
    @param _supplyType see above
    @return master_id id of a mastercopy

### `createItemSale(uint256 price, uint256 sale_limit, enum CurrenciesERC20.CurrencyERC20 currency, uint256 f_master_id) → address item_sale_adr` (public)



deploy new tokensale contract, for specific master_id and plug this sale to Master contract
    @param price in wei or least decimal (check this twice for USDT!)
    @param sale_limit how much tokens we want to sell, will fail if there are no consistency with rarity
    @param currency erc20 currency to set price, set equal price for all stables
    @param f_master_id master copy id, which we got from createMasterItem
    @return item_sale_adr address of deployed tokensale contract

### `getMasterTemplateAddress() → address` (public)



return address of Master


### `SaleCreated(address author, uint256 price, enum CurrenciesERC20.CurrencyERC20 currency, uint256 master_id)`





### `SaleCreatedHuman(address author, uint256 price, enum CurrenciesERC20.CurrencyERC20 currency, uint256 master_id)`





