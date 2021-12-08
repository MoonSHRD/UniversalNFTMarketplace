const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const USDTcontract = artifacts.require('TestUSDT');
const USDCcontract = artifacts.require('USDC');
const DAIcontract = artifacts.require('DAI');
const MSTcontract = artifacts.require('MST');
const WETHcontract = artifacts.require('WETH');
const MetaMarketplace = artifacts.require('MetaMarketplace');

const {
    time
} = require('@openzeppelin/test-helpers');

function makeRandomLink(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

contract('MetaMarketplace', accounts => {
    let factory, nft, mst, mMarket;
    let network;
    let tokenIdUnlimitOne, tokenIdUnlimitTwo, tokenIdUnlimitThree, tokenIdUniue;
    let admin, userone, royaltyaddress, userthree;
    const desc = 'Lorem ipsum dolor sit amet';
    let linkOne, linkTwo, linkThree;
    let midUnique, midLimited;
    let tokensTotal = '100';
    const [unique, limited, unlimit] = [1, 2, 0];
    const [MoonShard, Enum, Meta, Common] = [0, 1, 2, 3];
    const [USDT, USDC, DAI, MST, WETH] = [0, 1, 2, 3, 4];
    before(async () => {
        factory = await MasterFactory721.deployed();
        nft = await MSNFT.deployed();
        mMarket = await MetaMarketplace.deployed();
        linkOne = 'https://google.com/' + makeRandomLink(20);
        linkTwo = 'https://google.com/' + makeRandomLink(20);
        linkThree = 'https://google.com/' + makeRandomLink(20);
        network = process.env.NETWORK;
        mst = await MSTcontract.deployed();
        if (network == 'development' || network == 'ganache') {
            usdt = await USDTcontract.deployed();
            usdc = await USDCcontract.deployed();
            dai = await DAIcontract.deployed();
            weth = await WETHcontract.deployed();
            admin = accounts[0];
            royaltyaddress = accounts[1];
            userone = accounts[2];
        } else {
            admin = '0xF87F1eaa6Fd9B65bF41F90afEdF8B64D6487F61E';
            userone = '0x1b7C81DbAF6f34E878686CE6FA9463c48E2185C7';
        }
    });

    it('should fill balances', async () => {
        if (network == 'development' || network == 'ganache') {
            //USDT
            let userUsdtTokenBalanceBefore = await usdt.balanceOf(userone, {
                from: admin
            });
            assert.equal(userUsdtTokenBalanceBefore, 0, 'current admins token balance');
            let usdtTokensToMint = web3.utils.toBN(tokensTotal) * 1e6;
            const receiptUSDT = await usdt.MintERC20(userone, usdtTokensToMint, {
                from: admin
            });
            assert.equal(receiptUSDT.logs.length, 1, 'triggers one event');
            assert.equal(receiptUSDT.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receiptUSDT.logs[0].address, usdt.address, 'minted tokens are transferred from');

            let userUsdtTokenBalanceAfter = await usdt.balanceOf(userone, {
                from: admin
            });
            assert.equal(userUsdtTokenBalanceAfter.toString(), usdtTokensToMint.toString(), 'admins token balance after mint');

            //USDC
            let userUsdcTokenBalanceBefore = await usdc.balanceOf(userone, {
                from: admin
            });
            assert.equal(userUsdcTokenBalanceBefore, 0, 'current admins token balance');

            let usdcTokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receiptUSDC = await usdc.MintERC20(userone, usdcTokensToMint, {
                from: admin
            });
            assert.equal(receiptUSDC.logs.length, 1, 'triggers one event');
            assert.equal(receiptUSDC.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receiptUSDC.logs[0].address, usdc.address, 'minted tokens are transferred from');

            let userUsdcTokenBalanceAfter = await usdc.balanceOf(userone, {
                from: admin
            });
            assert.equal(userUsdcTokenBalanceAfter.toString(), usdcTokensToMint.toString(), 'admins token balance after mint');

            //DAI
            let userDaiTokenBalanceBefore = await dai.balanceOf(userone, {
                from: admin
            });
            assert.equal(userDaiTokenBalanceBefore, 0, 'current admins token balance');

            let daiTokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receiptDAI = await dai.MintERC20(userone, daiTokensToMint, {
                from: admin
            });
            assert.equal(receiptDAI.logs.length, 1, 'triggers one event');
            assert.equal(receiptDAI.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receiptDAI.logs[0].address, dai.address, 'minted tokens are transferred from');

            let userDaiTokenBalanceAfter = await dai.balanceOf(userone, {
                from: admin
            });
            assert.equal(userDaiTokenBalanceAfter.toString(), daiTokensToMint.toString(), 'admins token balance after mint');

            //MST
            let userMstTokenBalanceBefore = await mst.balanceOf(userone, {
                from: admin
            });
            assert.equal(userMstTokenBalanceBefore, 0, 'current admins token balance');

            let mstTokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receiptMST = await mst.MintERC20(userone, mstTokensToMint, {
                from: admin
            });
            assert.equal(receiptMST.logs.length, 1, 'triggers one event');
            assert.equal(receiptMST.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receiptMST.logs[0].address, mst.address, 'minted tokens are transferred from');

            let userMstTokenBalanceAfter = await mst.balanceOf(userone, {
                from: admin
            });
            assert.equal(userMstTokenBalanceAfter.toString(), mstTokensToMint.toString(), 'admins token balance after mint');

            //WETH
            let userWethTokenBalanceBefore = await weth.balanceOf(userone, {
                from: admin
            });
            assert.equal(userWethTokenBalanceBefore, 0, 'current admins token balance');

            let wethTokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receiptWETH = await weth.MintERC20(userone, wethTokensToMint, {
                from: admin
            });
            assert.equal(receiptWETH.logs.length, 1, 'triggers one event');
            assert.equal(receiptWETH.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receiptWETH.logs[0].address, weth.address, 'minted tokens are transferred from');

            let userWethTokenBalanceAfter = await weth.balanceOf(userone, {
                from: admin
            });
            assert.equal(userWethTokenBalanceAfter.toString(), wethTokensToMint.toString(), 'admins token balance after mint');
        }
    });

    it('should create master copy with unlimit supply type', async () => {
        const createItemUnlimit = await factory.createMasterItem(linkOne, desc, unlimit);
        assert.equal(createItemUnlimit.receipt.logs.length, 1, 'triggers one event');
        assert.equal(createItemUnlimit.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');

        if (network == 'development' || network == 'ganache') {
            midUnlimit = '1';
        } else {
            midUnlimit = createItemUnlimit.receipt.logs[0].args.master_id;
        }

        const firstLink = createItemUnlimit.receipt.logs[0].args.link;
        assert(firstLink == linkOne);

        const mintUnlimitTokenOne = await nft.EmitItem(admin, midUnlimit, 0);
        assert.equal(mintUnlimitTokenOne.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintUnlimitTokenOne.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintUnlimitTokenOne.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdUnlimitOne = mintUnlimitTokenOne.receipt.logs[0].args.tokenId.toNumber();

        const mintUnlimitTokenTwo = await nft.EmitItem(admin, midUnlimit, 0);
        assert.equal(mintUnlimitTokenTwo.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintUnlimitTokenTwo.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintUnlimitTokenTwo.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdUnlimitTwo = mintUnlimitTokenTwo.receipt.logs[0].args.tokenId.toNumber();

        const mintUnlimitTokenThree = await nft.EmitItem(admin, midUnlimit, 0);
        assert.equal(mintUnlimitTokenThree.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintUnlimitTokenThree.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintUnlimitTokenThree.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdUnlimitThree = mintUnlimitTokenThree.receipt.logs[0].args.tokenId.toNumber();
        
        const mintUnlimitTokenFour = await nft.EmitItem(admin, midUnlimit, 0);
        assert.equal(mintUnlimitTokenFour.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintUnlimitTokenFour.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintUnlimitTokenFour.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdUnlimitFour = mintUnlimitTokenFour.receipt.logs[0].args.tokenId.toNumber();
    });

    it('should create master copy with unique supply type', async () => {
        const createItemUnique = await factory.createMasterItem(linkTwo, desc, unique);
        assert.equal(createItemUnique.receipt.logs.length, 1, 'triggers one event');
        assert.equal(createItemUnique.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');

        if (network == 'development' || network == 'ganache') {
            midUnique = '2';
        } else {
            midUnique = createItemUnique.receipt.logs[0].args.master_id;
        }

        const uniqueLink = createItemUnique.receipt.logs[0].args.link;
        assert(uniqueLink == linkTwo);

        const mintUniqueToken = await nft.EmitItem(admin, midUnique, 0);
        assert.equal(mintUniqueToken.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintUniqueToken.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintUniqueToken.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdUniue = mintUniqueToken.receipt.logs[0].args.tokenId.toNumber();
    });

    // Unlimited cases

    //*****************************************/

    it('should make buy offer to token with unlimit supply type without created sale and accept it by owner', async () => {
        if (network == 'development' || network == 'ganache') {
            //Set token price
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitOne);
            assert.equal(owner, admin, "owned by admin");

            // Approve mst tokens from userone to meta market address
            const approveMstTokens = await mst.approve(mMarket.address, tokenMstPrice, {
                from: userone
            });
            assert.equal(approveMstTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveMstTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveMstTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveMstTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenMstPrice.toString(), approveMstTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await mst.allowance(userone, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenMstPrice.toString());

            //Userone make buy offer
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdUnlimitOne, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'must be the NewBuyOffer event');
            assert.equal(tokenIdUnlimitOne, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitOne, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitOne.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdUnlimitOne);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');

            const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenIdUnlimitOne, MST, {
                from: admin
            });

            assert.equal(acceptOfferByOwner.receipt.logs.length, 2, 'triggers two events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'Sale', 'must be the Sale event');

            const mMstBalance = await mst.balanceOf(mMarket.address);
            const uMstBalance = await mst.balanceOf(userone);
            const royaltyMstBalance = await mst.balanceOf(royaltyaddress);
            const aMstBalance = await mst.balanceOf(admin);
            
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.fees.toString(), royaltyMstBalance.toString(), 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.feeAddress, royaltyaddress,'must be admin address to get royalty');
            const authorBalance = acceptOfferByOwner.receipt.logs[0].args.transfered_amount - acceptOfferByOwner.receipt.logs[0].args.fees;
            assert.equal(authorBalance.toString(), aMstBalance.toString(), 'must be equal');
            assert.equal(mMstBalance.toString(), 0, 'must be zero after buy offer acception');
            
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.tokenId, tokenIdUnlimitOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.value.toString(), tokenMstPrice.toString(), 'must be equal');
        }
    });

    it('should withdraw buy offer with unlimit supply type without created sale', async () => {
        if (network == 'development' || network == 'ganache') {
            const tokenDaiPriceStr = '10';
            let tokenDaiPrice = web3.utils.toWei(web3.utils.toBN(tokenDaiPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitTwo);
            assert.equal(owner, admin, "owned by admin");

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitTwo, {from: admin});
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitTwo.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdUnlimitTwo);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');

            // Approve mst tokens from userone to meta market address
            const approveDaiTokens = await dai.approve(mMarket.address, tokenDaiPrice, {
                from: userone
            });
            assert.equal(approveDaiTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveDaiTokens.receipt.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(userone, approveDaiTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveDaiTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenDaiPrice.toString(), approveDaiTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await dai.allowance(userone, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenDaiPrice.toString());

            //User make buy offer
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdUnlimitTwo, DAI, tokenDaiPrice, {
                from: userone
            });
            assert.equal(tokenIdUnlimitTwo, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenDaiPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            await time.increase(time.duration.days(2));
            const withdrawBuyOffer = await mMarket.withdrawBuyOffer(nft.address, tokenIdUnlimitTwo, DAI, {
                from: userone
            });
            assert.equal(withdrawBuyOffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawBuyOffer.receipt.logs[0].event, 'BuyOfferWithdrawn', 'must be the BuyOfferWithdrawn event');
            assert.equal(tokenIdUnlimitTwo, withdrawBuyOffer.receipt.logs[0].args.tokenId, 'must be owner');
            assert.equal(userone, withdrawBuyOffer.receipt.logs[0].args.buyer, 'userone must be buyer');
        }
    });

    it('should make sell offer with unlimit supply type and withdraw it', async () => {
        const tokenWethPriceStr = '10';
        let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        const owner = await nft.ownerOf(tokenIdUnlimitThree);
        assert.equal(owner, admin, "owned by admin");

        const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
            from: admin
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
            from: admin
        });
        assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
        assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
        assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
        assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

        const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUnlimitThree, {
            from: admin
        });
        assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');
        assert.equal(withdrawselloffer.receipt.logs[0].args.tokenId, tokenIdUnlimitThree, 'must be equal');
        assert.equal(withdrawselloffer.receipt.logs[0].args.seller, admin, 'seller must be admin');
    });

    it('should make sell offer with unlimit supply type', async () => {
        const tokenWethPriceStr = '10';
        let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        const owner = await nft.ownerOf(tokenIdUnlimitThree);
        assert.equal(owner, admin, "owned by admin");

        const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
            from: admin
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
            from: admin
        });
        assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
        assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
        assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
        assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

        const approveWethTokens = await weth.approve(mMarket.address, tokenWethPrice, {
            from: userone
        });
        assert.equal(approveWethTokens.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveWethTokens.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(userone, approveWethTokens.logs[0].args.owner, 'must be owner');
        assert.equal(mMarket.address, approveWethTokens.logs[0].args.spender, 'must be spender');
        assert.equal(tokenWethPrice.toString(), approveWethTokens.logs[0].args.value.toString(), 'must be equal');

        //Check approved value
        const checkAllowance = await weth.allowance(userone, mMarket.address);
        assert.equal(checkAllowance.toString(), tokenWethPrice.toString());

        const purchase = await mMarket.purchase(nft.address, tokenIdUnlimitThree, WETH, tokenWethPrice, {
            from: userone
        });

        const mWethBalance = await weth.balanceOf(mMarket.address);
        const uMstBalance = await weth.balanceOf(userone);
        const royaltyWethBalance = await weth.balanceOf(royaltyaddress);
        const aWethBalance = await weth.balanceOf(admin);

        assert.equal(purchase.receipt.logs.length, 2, 'triggers one events');
        assert.equal(purchase.receipt.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');
        assert.equal(purchase.receipt.logs[0].args.fees.toString(), royaltyWethBalance.toString(), 'should be the CalculatedFees event');
        assert.equal(purchase.receipt.logs[0].args.feeAddress, royaltyaddress, 'should be the CalculatedFees event');

        const authorBalance = purchase.receipt.logs[0].args.transfered_amount - purchase.receipt.logs[0].args.fees;
        assert.equal(authorBalance.toString(), aWethBalance.toString(), 'must be equal');
        assert.equal(mWethBalance.toString(), 0, 'must be zero after buy offer acception');

        assert.equal(purchase.receipt.logs[1].event, 'Sale', 'should be the Sale event');
        assert.equal(purchase.receipt.logs[1].args.nft_contract_, nft.address, 'must be nft contract address');
        assert.equal(purchase.receipt.logs[1].args.tokenId, tokenIdUnlimitThree, 'must be equal');
        assert.equal(purchase.receipt.logs[1].args.seller, admin, 'seller must be admin');
        assert.equal(purchase.receipt.logs[1].args.buyer, userone, 'buyer must be userone');
        assert.equal(purchase.receipt.logs[1].args.value.toString(), tokenWethPrice.toString(), 'must be equal');

    });

    it('should make sell offer with unlimit supply type by new owner and withdraw it', async () => {
        const tokenWethPriceStr = '2';
        let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        const owner = await nft.ownerOf(tokenIdUnlimitThree);
        assert.equal(owner, userone, "owned by userone");

        const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
            from: userone
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
            from: userone
        });
        assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
        assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
        assert.equal(userone, selloffer.logs[0].args.seller, 'userone must seller');
        assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

        // const approveUsdcTokens = await usdc.approve(mMarket.address, tokenUsdcPrice, {
        //     from: admin
        // });
        // assert.equal(approveUsdcTokens.receipt.logs.length, 1, 'triggers one events');
        // assert.equal(approveUsdcTokens.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        // assert.equal(admin, approveUsdcTokens.logs[0].args.owner, 'must be owner');
        // assert.equal(mMarket.address, approveUsdcTokens.logs[0].args.spender, 'must be spender');
        // assert.equal(tokenUsdcPrice.toString(), approveUsdcTokens.logs[0].args.value.toString(), 'must be equal');

        //Check approved value
        // const checkAllowance = await usdc.allowance(admin, mMarket.address);
        // assert.equal(checkAllowance.toString(), tokenUsdcPrice.toString());

        const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUnlimitThree, {
            from: userone
        });
        assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');

    });

    it('should make sell offer with unlimit supply type by new owner', async () => {
        const tokenWethPriceStr = '2';
        let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        const owner = await nft.ownerOf(tokenIdUnlimitThree);
        assert.equal(owner, userone, "owned by userone");

        const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
            from: userone
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        const approveUsdcTokens = await weth.approve(mMarket.address, tokenWethPrice, {
            from: admin
        });
        assert.equal(approveUsdcTokens.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveUsdcTokens.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(admin, approveUsdcTokens.logs[0].args.owner, 'must be owner');
        assert.equal(mMarket.address, approveUsdcTokens.logs[0].args.spender, 'must be spender');
        assert.equal(tokenWethPrice.toString(), approveUsdcTokens.logs[0].args.value.toString(), 'must be equal');
        //Check approved value
        const checkAllowance = await weth.allowance(admin, mMarket.address);
        assert.equal(checkAllowance.toString(), tokenWethPrice.toString());

        const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
            from: userone
        });
        assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
        assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
        assert.equal(userone, selloffer.logs[0].args.seller, 'userone must seller');
        assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

        const purchase = await mMarket.purchase(nft.address, tokenIdUnlimitThree, WETH, tokenWethPrice, {
            from: admin
        });
        assert.equal(purchase.receipt.logs.length, 2, 'triggers one events');
        assert.equal(purchase.receipt.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');
        assert.equal(purchase.receipt.logs[1].event, 'Sale', 'should be the Sale event');

    });



    // Unique cases


    //*****************************************/


    it('should make buy offer to token with unique supply type without created sale and accept it by owner', async () => {
        if (network == 'development' || network == 'ganache') {
            //Set token price
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            assert.equal(owner, admin, "owned by admin");

            // Approve mst tokens from userone to meta market address
            const approveMstTokens = await mst.approve(mMarket.address, tokenMstPrice, {
                from: userone
            });
            assert.equal(approveMstTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveMstTokens.receipt.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(userone, approveMstTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveMstTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenMstPrice.toString(), approveMstTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await mst.allowance(userone, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenMstPrice.toString());

            //Userone make buy offer
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdUniue, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'should be the NewBuyOffer event');
            assert.equal(tokenIdUniue, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdUniue);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');
            
            const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenIdUniue, MST, {
                from: admin
            });

            assert.equal(acceptOfferByOwner.receipt.logs.length, 2, 'triggers two events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'Sale', 'must be the Sale event');

            const mMstBalance = await mst.balanceOf(mMarket.address);
            const royaltyMstBalance = await mst.balanceOf(royaltyaddress);

            assert.equal(acceptOfferByOwner.receipt.logs[0].args.fees.toString(), (royaltyMstBalance/2).toString(), 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.feeAddress, royaltyaddress,'must be admin address to get royalty');
            assert.equal(mMstBalance.toString(), 0, 'must be zero after buy offer acception');
            
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.tokenId, tokenIdUniue, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.value.toString(), tokenMstPrice.toString(), 'must be equal');
        }
    });


    it('should make sell offer with unique supply type and withdraw it', async () => {
        const tokenWethPriceStr = '10';
        let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        const owner = await nft.ownerOf(tokenIdUniue);
        assert.equal(owner, userone, "owned by admin");

        const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
            from: userone
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        const selloffer = await mMarket.makeSellOffer(tokenIdUniue, tokenWethPrice, nft.address, WETH, {
            from: userone
        });
        assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
        assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
        assert.equal(userone, selloffer.logs[0].args.seller, 'admin must seller');
        assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

        const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUniue, {
            from: userone
        });
        assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');
    });

    it('should make sell offer with unique supply type', async () => {
        const tokenWethPriceStr = '1';
        let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        const owner = await nft.ownerOf(tokenIdUniue);
        assert.equal(owner, userone, "owned by admin");

        const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
            from: userone
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        const selloffer = await mMarket.makeSellOffer(tokenIdUniue, tokenWethPrice, nft.address, WETH, {
            from: userone
        });
        assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
        assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
        assert.equal(userone, selloffer.logs[0].args.seller, 'admin must seller');
        assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

        const approveWethTokens = await weth.approve(mMarket.address, tokenWethPrice, {
            from: admin
        });
        assert.equal(approveWethTokens.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveWethTokens.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(admin, approveWethTokens.logs[0].args.owner, 'must be owner');
        assert.equal(mMarket.address, approveWethTokens.logs[0].args.spender, 'must be spender');
        assert.equal(tokenWethPrice.toString(), approveWethTokens.logs[0].args.value.toString(), 'must be equal');

        //Check approved value
        const checkAllowance = await weth.allowance(admin, mMarket.address);
        assert.equal(checkAllowance.toString(), tokenWethPrice.toString());

        const uBalanceBefore = await weth.balanceOf(admin);

        console.log(uBalanceBefore.toString());
        const purchase = await mMarket.purchase(nft.address, tokenIdUniue, WETH, tokenWethPrice, {
            from: admin
        });
        assert.equal(purchase.receipt.logs.length, 2, 'triggers one events');
        assert.equal(purchase.receipt.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');
        assert.equal(purchase.receipt.logs[1].event, 'Sale', 'should be the Sale event');
    });

});