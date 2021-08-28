# UniversalNFTMarketplace
Universal NFT Marketplace

## Key features

 ### ERC721Enumerable as a nft standard
 We use open-zeppeline erc721Enumerable as a standard for base NFT token
 This standard means that every created token are stored and can be operable from one singleton-like contract as **record**
 Instead of creating new instance of contract each time someone create new token
 This help us to save the gas and reduce universe entropy!
 
 For more info see `./contracts/721/singleton/MSNFT.sol `

 ### Currencies erc20
 We use some stable-coins and other erc20 tokens as currencies
 So users can set up and get paid in USDT,USDC,DAI, SNM or other custom currencies

 For more info see `./contracts/721/singleton/CurrenciesERC20.sol`


 ### Tokensale721 for initial crowdsale

 User can start/plug crowdsale for any emitted tokens
 We consider this crowdsale to be the *initial* form of sale

 We also consider, that there should be exchange for secondary market
 (P2P exchange of any NFT's from anywhere else platform)
 Exchange will come to v0.2 (not in first version)

 TokenSale contract is a modified OZ crowdsale contract.
 It has been modified to work with ERC721 token and get ERC20 tokens as payment

 ### MasterCopy and Items
Each token represent some file, so it stores link to the file and some meta-information about NFT as MasterCopy
Any tokens are considered items and attached to specific master-copy, which contain meta-info about NFT
Tokens do not store this info but it can be obtained by links

**So each item (token) is a link to specific master-copy which contain link to the file**




 ## Install, testing and so on

 This is a truffle project, so fist you need to get truffle by
 ` npm install -g truffle `

 Deploy into blockchain / ganache :
 ` truffle migrate --reset `
 (reset flag will do clean migration)

 Dpeloyment scheme can be found in `./migrations/2_deploy_contracts.js`

 Networks configs `./truffle-config.js`

 If you want to test contract locally you may also need ganache

 ## Contracts description