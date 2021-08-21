## `MSNFT`

     MoonShard Non-fungible Token
 @title MSNFT
 @author JackBekket
 @dev MSNFT is a ERC721Enumerable token contract
 ERC721Enumerable stand for singletone pattern, which mean each created NFT is NOT a separate contract, but record in this single contract
When user want's to create NFT -- he creates MasterCopy first (with link to a file), then he can emit items(tokens) or start crowdsale of them
Each token is ITEM. Each item is a link to a MasterCopy
Each NFT have a rarity type (Unique -- only one exist, Rare -- limited edition, Common -- unlimited edition)
createMasterCopy, plugSale, buyItem -- external intefaces to be called from factory contract




### `constructor(string name_, string smbl_)` (public)





### `PlugCrowdSale(address organizer, uint256 _masterId, address _sale)` (public)

 @dev This function 'plug' itemsale contract from factory to mastersales map (works only for MoonShard NFT, should be called after MasterCopy creation)
 @param organizer -- address of seller (author)
 @param _masterId -- Id of mastercopy, which has been created by CreateMasterCopy
 @param _sale -- address of crowdsale contract. Note that this function can be called only from factory.



### `_reserveMasterId(address _author) → uint256 _master_id` (internal)



safely reserve master_id


### `createMasterCopy(string link, address _author, string _description, uint256 _supplyType) → uint256 c_master_id` (public)



create Master Copy of item (without starting sale). It wraps file info into nft and create record in blockchain. Other items(tokens) are just links to master record


### `get_rarity(uint256 _masterId) → enum MSNFT.RarityType` (public)

 @dev get rarity of specific master
 @param _masterId master copy id
 @return RarityType



### `get_author(uint256 _masterId) → address _author` (public)

 @dev get author of master



### `Mint(address to, uint256 m_master_id, uint256 item_id)` (internal)

 @dev Mint new token. Require master_id and item_id
 @param to whom address should mint
 @param m_master_id master copy of item
 @param item_id counter of item. There are no incrementation of this counter here, so make sure this function is purely internal(!)



### `EmitItem(address to, uint256 m_master_id)` (public)



this function emit item outside of buying mechanism, only owner of master can call it


### `buyItem(address buyer, uint256 itemAmount, uint256 master_id)` (public)

 @dev external function for buying items, should be invoked from tokensale contract
 @param buyer address of buyer
 @param itemAmount how much of tokens we want to buy if possible
 @param master_id Master copy id



### `getItemSale(uint256 master_id) → address` (public)



get itemSale contract address tethered to this master_id

### `updateFactoryAdress(address factory_address_)` (public)

 @dev update factory address. as we deploy separately this contract, then factory contract, then we need to update factory address outside of MSNFT constructor
 also, it may be useful if we would need to upgrade tokensale contract (which include upgrade of a factory contract), so it can be used when rollup new versions of factory and sale



### `getFactoryAddress() → address` (public)






### `ItemBought(address buyer, uint256 master_id, uint256 item_id)`



Events about buying item. events named *Human stands for human readability


### `ItemBoughtHuman(address buyer, uint256 master_id, uint256 item_id)`





### `MasterIdReserved(address author, uint256 master_id)`





### `MasterIdReservedHuman(address author, uint256 master_id)`





### `MaterCopyCreated(address author, uint256 master_id, string description, string link)`



event about master-copy creation


### `MasterCopyCreatedHuman(address author, uint256 master_id, string description, string link)`





