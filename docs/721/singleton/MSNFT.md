## `MSNFT`

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








### `constructor(string name_, string smbl_)` (public)





### `PlugCrowdSale(address organizer, uint256 _masterId, address _sale)` (public)





### `_reserveMasterId(address _author) → uint256 _master_id` (internal)





### `createMasterCopy(string link, address _author, string _description, uint256 _supplyType) → uint256 c_master_id` (public)





### `get_rarity(uint256 _masterId) → enum MSNFT.RarityType` (public)





### `get_author(uint256 _masterId) → address _author` (public)





### `Mint(address to, uint256 m_master_id, uint256 item_id)` (internal)





### `EmitItem(address to, uint256 m_master_id)` (public)





### `buyItem(address buyer, uint256 itemAmount, uint256 master_id)` (public)





### `getItemSale(uint256 master_id) → address` (public)





### `updateFactoryAdress(address factory_address_)` (public)





### `getFactoryAddress() → address` (public)






### `ItemBought(address buyer, uint256 master_id, uint256 item_id)`





### `ItemBoughtHuman(address buyer, uint256 master_id, uint256 item_id)`





### `MasterIdReserved(address author, uint256 master_id)`





### `MasterIdReservedHuman(address author, uint256 master_id)`





### `MaterCopyCreated(address author, uint256 master_id, string description, string link)`





### `MasterCopyCreatedHuman(address author, uint256 master_id, string description, string link)`





