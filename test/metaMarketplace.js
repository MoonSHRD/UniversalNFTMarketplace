const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const USDTcontract = artifacts.require('TestUSDT');
const USDCcontract = artifacts.require('USDC');
const DAIcontract = artifacts.require('DAI');
const MSTcontract = artifacts.require('MST');
const WETHcontract = artifacts.require('WETH');
const MetaMarketplace = artifacts.require('MetaMarketplace');

const {
    time,
    expectEvent
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

function getTotalItems() {
    const json = '{"item_1": 1, "item_2": 2, "item_3": 3}';
    const obj = JSON.parse(json);
    let count = Object.keys(obj).length;
    return count;
}

contract('MetaMarketplace', accounts => {
    let factory, nft, mst, mMarket;
    let network;
    let tokenIdUnlimitOne, tokenIdUnlimitTwo, tokenIdUnlimitThree, tokenIdUniue, tokenIdLimitedOne, tokenIdLimitedTwo, tokenIdLimitedThree;
    let admin, userone, royaltyaddress, userthree;
    const desc = 'Lorem ipsum dolor sit amet';
    let linkOne, linkTwo, linkThree;
    let midUnique, midUnlimit, midLimited;
    let tokensTotal = '100';
    let lim = getTotalItems();
    const [unique, unlimit, limited] = [1, 0, lim];
    const [MoonShard, Enum, Meta, Common] = [0, 1, 2, 3];
    const [USDT, USDC, DAI, MST, WETH] = [0, 1, 2, 3, 4];
    before(async () => {
        factory = await MasterFactory721.deployed();
        nft = await MSNFT.deployed();
        mMarket = await MetaMarketplace.deployed();
        linkOne = 'https://ipfs.io/ipfs/' + makeRandomLink(20);
        linkTwo = 'https://ipfs.io/ipfs/' + makeRandomLink(21);

        //Folder link
        linkThree = 'https://ipfs.io/ipfs/' + makeRandomLink(20);
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
        } else {
            let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receipt = await mst.MintERC20(userone, tokensToMint, {
                from: admin
            });
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].address, mst.address, 'minted tokens are transferred from');
        }
    });

    it('should create master copy with limited supply type', async () => {
        const createItemLimited = await factory.createMasterItem(linkThree, desc, limited);

        assert.equal(createItemLimited.receipt.logs.length, 1, 'triggers one event');
        assert.equal(createItemLimited.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');

        midLimited = createItemLimited.receipt.logs[0].args.master_id;

        const receiptFirstEvent = await expectEvent.inTransaction(createItemLimited.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midLimited,
            description: desc,
            link: linkThree
        });

        console.log(receiptFirstEvent);

        const limitedLink = createItemLimited.receipt.logs[0].args.link;
        assert(limitedLink == linkThree);

        const mintLimOneToken = await nft.EmitItem(admin, midLimited, 1);
        assert.equal(mintLimOneToken.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintLimOneToken.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintLimOneToken.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdLimitedOne = mintLimOneToken.receipt.logs[0].args.tokenId.toNumber();

        const mintLimTwoToken = await nft.EmitItem(admin, midLimited, 2);
        assert.equal(mintLimTwoToken.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintLimTwoToken.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintLimTwoToken.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdLimitedTwo = mintLimTwoToken.receipt.logs[0].args.tokenId.toNumber();

        const mintLimThreeToken = await nft.EmitItem(admin, midLimited, 3);
        assert.equal(mintLimThreeToken.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintLimThreeToken.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintLimThreeToken.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdLimitedThree = mintLimThreeToken.receipt.logs[0].args.tokenId.toNumber();

        // const mintLimFourToken = await nft.EmitItem(admin, midLimited, 4);
        // assert.equal(mintLimFourToken.receipt.logs.length, 2, 'triggers two events');
        // assert.equal(mintLimFourToken.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        // assert.equal(mintLimFourToken.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        // // tokenIdLimitedThree = mintLimThreeToken.receipt.logs[0].args.tokenId.toNumber();
    });

    it('should create master copy with unique supply type', async () => {
        const createItemUnique = await factory.createMasterItem(linkTwo, desc, unique);

        assert.equal(createItemUnique.receipt.logs.length, 1, 'triggers one event');
        assert.equal(createItemUnique.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');

        midUnique = createItemUnique.receipt.logs[0].args.master_id;

        const receiptFirstEvent = await expectEvent.inTransaction(createItemUnique.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midUnique,
            description: desc,
            link: linkTwo
        });

        // console.log(receiptFirstEvent);

        const uniqueLink = createItemUnique.receipt.logs[0].args.link;
        assert(uniqueLink == linkTwo);

        const mintUniqueToken = await nft.EmitItem(admin, midUnique, 0);
        assert.equal(mintUniqueToken.receipt.logs.length, 2, 'triggers two events');
        assert.equal(mintUniqueToken.receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintUniqueToken.receipt.logs[1].event, 'MintNewToken', 'should be the MintNewToken event');
        tokenIdUniue = mintUniqueToken.receipt.logs[0].args.tokenId.toNumber();
    });

    it('should create master copy with unlimit supply type', async () => {
        const createItemUnlimit = await factory.createMasterItem(linkOne, desc, unlimit);
        assert.equal(createItemUnlimit.receipt.logs.length, 1, 'triggers one event');
        assert.equal(createItemUnlimit.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');

        midUnlimit = createItemUnlimit.receipt.logs[0].args.master_id;

        const receiptFirstEvent = await expectEvent.inTransaction(createItemUnlimit.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midUnlimit,
            description: desc,
            link: linkOne
        });
        // console.log(receiptFirstEvent);

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

            assert.equal(acceptOfferByOwner.receipt.logs.length, 3, 'triggers three events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');

            let amount = acceptOfferByOwner.receipt.logs[1].args.initial_value;
            let fees = acceptOfferByOwner.receipt.logs[1].args.fees;
            let netAmount = acceptOfferByOwner.receipt.logs[1].args.transfered_amount;

            console.log("CalculatedFees args");
            
            console.log("amount");
            console.log(amount.toString());
            console.log("fees");
            console.log(fees.toString());
            console.log("netAmount");
            console.log(netAmount.toString());

            let royaltyAmount = amount * 0.015;
            console.log("royaltyAmount");
            console.log(royaltyAmount.toString());

            
            assert.equal(royaltyAmount.toString(), fees.toString(), 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            // console.log("args 1 ==================");
            // console.log(acceptOfferByOwner.receipt.logs[0].args);

            const mMstBalance = await mst.balanceOf(mMarket.address);
            const uMstBalance = await mst.balanceOf(userone);
            const royaltyMstBalance = await mst.balanceOf(royaltyaddress);
            const aMstBalance = await mst.balanceOf(admin);


            assert.equal(acceptOfferByOwner.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.tokenId, tokenIdUnlimitOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.recepient, admin, 'recepient must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.value.toString(), royaltyMstBalance.toString(), 'must be equal');

            assert.equal(acceptOfferByOwner.receipt.logs[1].args.fees.toString(), royaltyMstBalance.toString(), 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.feeAddress, royaltyaddress, 'must be admin address to get royalty');
            const authorBalance = tokenMstPrice - acceptOfferByOwner.receipt.logs[1].args.fees;
            assert.equal(authorBalance.toString(), aMstBalance.toString(), 'must be equal');
            assert.equal(mMstBalance.toString(), 0, 'must be zero after buy offer acception');

            assert.equal(acceptOfferByOwner.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.tokenId, tokenIdUnlimitOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.value.toString(), tokenMstPrice.toString(), 'must be equal');

            const ownership = await nft.ownerOf(tokenIdUnlimitOne);
            console.log(ownership);
        } else {
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

            assert.equal(acceptOfferByOwner.receipt.logs.length, 3, 'triggers three events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            // console.log("args 1 ==================");
            // console.log(acceptOfferByOwner.receipt.logs[0].args);

            assert.equal(acceptOfferByOwner.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.tokenId, tokenIdUnlimitOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.recepient, admin, 'recepient must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.feeAddress, admin, 'must be admin address to get royalty');

            assert.equal(acceptOfferByOwner.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.tokenId, tokenIdUnlimitOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.buyer, userone, 'buyer must be userone');

            const ownership = await nft.ownerOf(tokenIdUnlimitOne);
            console.log(ownership);
        }
    });

    it('should withdraw buy offer with unlimit supply type without created sale', async () => {
        if (network == 'development' || network == 'ganache') {
            const tokenDaiPriceStr = '10';
            let tokenDaiPrice = web3.utils.toWei(web3.utils.toBN(tokenDaiPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitTwo);
            assert.equal(owner, admin, "owned by admin");

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitTwo, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
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
            assert.equal(approveDaiTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
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
        } else {
            // const tokenMstPriceStr = '10';
            // let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            // const owner = await nft.ownerOf(tokenIdUnlimitTwo);
            // assert.equal(owner, admin, "owned by admin");

            // // Approve nft token from admin to meta market address
            // const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitTwo, {
            //     from: admin
            // });
            // assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            // assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            // assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            // assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            // assert.equal(tokenIdUnlimitTwo.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            // //Check approved address
            // const approvedAddress = await nft.getApproved(tokenIdUnlimitTwo);
            // assert.equal(mMarket.address, approvedAddress, 'must be equal');

            // // Approve mst tokens from userone to meta market address
            // const approveMstTokens = await mst.approve(mMarket.address, tokenMstPrice, {
            //     from: userone
            // });
            // assert.equal(approveMstTokens.receipt.logs.length, 1, 'triggers one events');
            // assert.equal(approveMstTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            // assert.equal(userone, approveMstTokens.logs[0].args.owner, 'must be owner');
            // assert.equal(mMarket.address, approveMstTokens.logs[0].args.spender, 'must be spender');
            // assert.equal(tokenMstPrice.toString(), approveMstTokens.logs[0].args.value.toString(), 'must be equal');

            // //Check approved value
            // const checkAllowance = await mst.allowance(userone, mMarket.address);
            // assert.equal(checkAllowance.toString(), tokenMstPrice.toString());

            // //User make buy offer
            // const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdUnlimitTwo, MST, tokenMstPrice, {
            //     from: userone
            // });
            // assert.equal(tokenIdUnlimitTwo, saleoffer.logs[0].args.tokenId, 'must be equal');
            // assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            // assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // await time.increase(time.duration.days(2));
            // const withdrawBuyOffer = await mMarket.withdrawBuyOffer(nft.address, tokenIdUnlimitTwo, MST, {
            //     from: userone
            // });
            // assert.equal(withdrawBuyOffer.receipt.logs.length, 1, 'triggers one events');
            // assert.equal(withdrawBuyOffer.receipt.logs[0].event, 'BuyOfferWithdrawn', 'must be the BuyOfferWithdrawn event');
            // assert.equal(tokenIdUnlimitTwo, withdrawBuyOffer.receipt.logs[0].args.tokenId, 'must be owner');
            // assert.equal(userone, withdrawBuyOffer.receipt.logs[0].args.buyer, 'userone must be buyer');
        }
    });

    it('should make sell offer with unlimit supply type and withdraw it', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '10';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUnlimitThree, {
                from: admin
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'must be the SellOfferWithdrawn event');
            assert.equal(withdrawselloffer.receipt.logs[0].args.tokenId, tokenIdUnlimitThree, 'must be equal');
            assert.equal(withdrawselloffer.receipt.logs[0].args.seller, admin, 'seller must be admin');
        } else {
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenMstPrice, nft.address, MST, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUnlimitThree, {
                from: admin
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'must be the SellOfferWithdrawn event');
            assert.equal(withdrawselloffer.receipt.logs[0].args.tokenId, tokenIdUnlimitThree, 'must be equal');
            assert.equal(withdrawselloffer.receipt.logs[0].args.seller, admin, 'seller must be admin');
        }
    });

    it('should make sell offer with unlimit supply type', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '10';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const approveWethTokens = await weth.approve(mMarket.address, tokenWethPrice, {
                from: userone
            });
            assert.equal(approveWethTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveWethTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
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

            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');

            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(purchase.receipt.logs[0].args.tokenId, tokenIdUnlimitThree, 'must be equal');
            assert.equal(purchase.receipt.logs[0].args.recepient, admin, 'recepient must be admin');
            assert.equal(purchase.receipt.logs[0].args.value.toString(), royaltyWethBalance.toString(), 'must be equal');

            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[1].args.fees.toString(), royaltyWethBalance.toString(), 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[1].args.feeAddress, royaltyaddress, 'must be the CalculatedFees event');

            const authorBalance = tokenWethPrice - purchase.receipt.logs[1].args.fees;
            assert.equal(authorBalance.toString(), aWethBalance.toString(), 'must be equal');
            assert.equal(mWethBalance.toString(), 0, 'must be zero after buy offer acception');

            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
            assert.equal(purchase.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(purchase.receipt.logs[2].args.tokenId, tokenIdUnlimitThree, 'must be equal');
            assert.equal(purchase.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(purchase.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(purchase.receipt.logs[2].args.value.toString(), tokenWethPrice.toString(), 'must be equal');

            const ownership = await nft.ownerOf(tokenIdUnlimitThree);
            console.log("ownership " + ownership);
        } else {
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenMstPrice, nft.address, MST, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

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

            const purchase = await mMarket.purchase(nft.address, tokenIdUnlimitThree, MST, tokenMstPrice, {
                from: userone
            });

            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');

            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(purchase.receipt.logs[0].args.tokenId, tokenIdUnlimitThree, 'must be equal');
            assert.equal(purchase.receipt.logs[0].args.recepient, admin, 'recepient must be admin');

            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[1].args.feeAddress, admin, 'must be the CalculatedFees event');

            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
            assert.equal(purchase.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(purchase.receipt.logs[2].args.tokenId, tokenIdUnlimitThree, 'must be equal');
            assert.equal(purchase.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(purchase.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(purchase.receipt.logs[2].args.value.toString(), tokenMstPrice.toString(), 'must be equal');

            const ownership = await nft.ownerOf(tokenIdUnlimitThree);
            console.log("ownership " + ownership);
        }

    });

    it('should make sell offer with unlimit supply type by new owner and withdraw it', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '2';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, userone, "owned by userone");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenWethPrice, nft.address, WETH, {
                from: userone
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'userone must seller');
            assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUnlimitThree, {
                from: userone
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'must be the SellOfferWithdrawn event');
        } else {
            const tokenMstPriceStr = '2';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, userone, "owned by userone");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenMstPrice, nft.address, MST, {
                from: userone
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'userone must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUnlimitThree, {
                from: userone
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'must be the SellOfferWithdrawn event');
        }
    });

    it('should make sell offer with unlimit supply type by new owner', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '2';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, userone, "owned by userone");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const approveUsdcTokens = await weth.approve(mMarket.address, tokenWethPrice, {
                from: admin
            });
            assert.equal(approveUsdcTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveUsdcTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
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
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'userone must seller');
            assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const purchase = await mMarket.purchase(nft.address, tokenIdUnlimitThree, WETH, tokenWethPrice, {
                from: admin
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
        } else {
            const tokenMstPriceStr = '2';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUnlimitThree);
            assert.equal(owner, userone, "owned by userone");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUnlimitThree, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUnlimitThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const approveUsdcTokens = await mst.approve(mMarket.address, tokenMstPrice, {
                from: admin
            });
            assert.equal(approveUsdcTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveUsdcTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveUsdcTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveUsdcTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenMstPrice.toString(), approveUsdcTokens.logs[0].args.value.toString(), 'must be equal');
            //Check approved value
            const checkAllowance = await mst.allowance(admin, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenMstPrice.toString());

            const selloffer = await mMarket.makeSellOffer(tokenIdUnlimitThree, tokenMstPrice, nft.address, MST, {
                from: userone
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'userone must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const purchase = await mMarket.purchase(nft.address, tokenIdUnlimitThree, MST, tokenMstPrice, {
                from: admin
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
        }
    });



    // // Unique cases

    // //*****************************************/


    it('should make buy offer to token with unique supply type without created sale and accept it by owner', async () => {
        if (network == 'development' || network == 'ganache') {
            //Set token price
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            console.log("owner before " + owner);
            assert.equal(owner, admin, "owned by admin");

            const getAuthorBeforePurchase = await nft.get_author(midUnique);
            console.log("author before " + getAuthorBeforePurchase);
            assert.equal(getAuthorBeforePurchase, admin, "must be equal");

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
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdUniue, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'must be the NewBuyOffer event');
            assert.equal(tokenIdUniue, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdUniue);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');

            const rarity = await nft.get_rarity(midUnique);
            console.log("rarity " + rarity.toString());

            const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenIdUniue, MST, {
                from: admin
            });

            const newOwner = await nft.ownerOf(tokenIdUniue);
            console.log("owner after " + newOwner);

            assert.equal(acceptOfferByOwner.receipt.logs.length, 3, 'triggers two events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            const mMstBalance = await mst.balanceOf(mMarket.address);
            const royaltyMstBalance = await mst.balanceOf(royaltyaddress);

            assert.equal(acceptOfferByOwner.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.tokenId, tokenIdUniue, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.recepient, admin, 'recepient must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.value.toString(), (royaltyMstBalance / 2).toString(), 'must be equal');

            assert.equal(acceptOfferByOwner.receipt.logs[1].args.fees.toString(), (royaltyMstBalance / 2).toString(), 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.feeAddress, royaltyaddress, 'must be admin address to get royalty');
            assert.equal(mMstBalance.toString(), 0, 'must be zero after buy offer acception');

            assert.equal(acceptOfferByOwner.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.tokenId, tokenIdUniue, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.value.toString(), tokenMstPrice.toString(), 'must be equal');

            const getAuthorAfterPurchase = await nft.get_author(midUnique);
            assert.equal(getAuthorAfterPurchase, userone, "must be a new author");
        } else {
            //Set token price
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            assert.equal(owner, admin, "owned by admin");

            const getAuthorBeforePurchase = await nft.get_author(midUnique);
            assert.equal(getAuthorBeforePurchase, admin, "must be equal");

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
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdUniue, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'must be the NewBuyOffer event');
            assert.equal(tokenIdUniue, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdUniue);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');

            const rarity = await nft.get_rarity(midUnique);
            console.log("rarity " + rarity.toString());

            const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenIdUniue, MST, {
                from: admin
            });

            assert.equal(acceptOfferByOwner.receipt.logs.length, 3, 'triggers two events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            assert.equal(acceptOfferByOwner.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.tokenId, tokenIdUniue, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.recepient, admin, 'recepient must be admin');

            assert.equal(acceptOfferByOwner.receipt.logs[1].args.feeAddress, admin, 'must be admin address to get royalty');

            assert.equal(acceptOfferByOwner.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.tokenId, tokenIdUniue, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.value.toString(), tokenMstPrice.toString(), 'must be equal');

            const getAuthorAfterPurchase = await nft.get_author(midUnique);
            assert.equal(getAuthorAfterPurchase, userone, "must be a new author");
        }
    });

    it('should make sell offer with unique supply type and withdraw it', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '10';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            assert.equal(owner, userone, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUniue, tokenWethPrice, nft.address, WETH, {
                from: userone
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUniue, {
                from: userone
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');
        } else {
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            assert.equal(owner, userone, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUniue, tokenMstPrice, nft.address, MST, {
                from: userone
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdUniue, {
                from: userone
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');
        }
    });

    it('should make sell offer with unique supply type', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '1';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            assert.equal(owner, userone, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
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
            assert.equal(approveWethTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveWethTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveWethTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenWethPrice.toString(), approveWethTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await weth.allowance(admin, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenWethPrice.toString());

            const purchase = await mMarket.purchase(nft.address, tokenIdUniue, WETH, tokenWethPrice, {
                from: admin
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            const getAuthorAfterPurchase = await nft.get_author(midUnique);
            assert.equal(getAuthorAfterPurchase, admin, "must be a new author");
        } else {
            const tokenMstPriceStr = '1';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdUniue);
            assert.equal(owner, userone, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdUniue, {
                from: userone
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdUniue.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdUniue, tokenMstPrice, nft.address, MST, {
                from: userone
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(userone, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const approveMstTokens = await mst.approve(mMarket.address, tokenMstPrice, {
                from: admin
            });
            assert.equal(approveMstTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveMstTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveMstTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveMstTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenMstPrice.toString(), approveMstTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await mst.allowance(admin, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenMstPrice.toString());

            const purchase = await mMarket.purchase(nft.address, tokenIdUniue, MST, tokenMstPrice, {
                from: admin
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            const getAuthorAfterPurchase = await nft.get_author(midUnique);
            assert.equal(getAuthorAfterPurchase, admin, "must be a new author");
        }
    });


    // // Limited cases

    // //*****************************************/

    it('should make buy offer to token with limited supply type without created sale and accept it by owner', async () => {
        if (network == 'development' || network == 'ganache') {
            //Set token price
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedOne);
            console.log("owner before " + owner);
            assert.equal(owner, admin, "owned by admin");

            const getAuthorBeforePurchase = await nft.get_author(midLimited);
            console.log("author before " + getAuthorBeforePurchase);
            assert.equal(getAuthorBeforePurchase, admin, "must be equal");

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
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdLimitedOne, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'must be the NewBuyOffer event');
            assert.equal(tokenIdLimitedOne, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedOne, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedOne.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdLimitedOne);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');

            const balanceOfAdmin = await nft.balanceOf(admin);
            console.log(balanceOfAdmin);

            // const rarity = await nft.get_rarity(midUnique);
            // console.log("rarity " + rarity.toString());

            const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenIdLimitedOne, MST, {
                from: admin
            });

            const newOwner = await nft.ownerOf(tokenIdLimitedOne);
            console.log("owner after " + newOwner);

            assert.equal(acceptOfferByOwner.receipt.logs.length, 3, 'triggers two events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            const mMstBalance = await mst.balanceOf(mMarket.address);
            const royaltyMstBalance = await mst.balanceOf(royaltyaddress);

            assert.equal(acceptOfferByOwner.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.tokenId, tokenIdLimitedOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.recepient, admin, 'recepient must be admin');
            // assert.equal(acceptOfferByOwner.receipt.logs[0].args.value.toString(), (royaltyMstBalance / 3).toString(), 'must be equal');

            // assert.equal(acceptOfferByOwner.receipt.logs[1].args.fees.toString(), (royaltyMstBalance / 3).toString(), 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[1].args.feeAddress, royaltyaddress, 'must be admin address to get royalty');
            assert.equal(mMstBalance.toString(), 0, 'must be zero after buy offer acception');

            assert.equal(acceptOfferByOwner.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.tokenId, tokenIdLimitedOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.value.toString(), tokenMstPrice.toString(), 'must be equal');

            const getOwnerOfToken = await nft.ownerOf(tokenIdLimitedOne);
            console.log(getOwnerOfToken);
            // assert.equal(getAuthorAfterPurchase, admin, "must be a new author");
        } else {
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedOne);
            assert.equal(owner, admin, "owned by admin");

            const getAuthorBeforePurchase = await nft.get_author(midLimited);
            assert.equal(getAuthorBeforePurchase, admin, "must be equal");

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
            const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenIdLimitedOne, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'must be the NewBuyOffer event');
            assert.equal(tokenIdLimitedOne, saleoffer.logs[0].args.tokenId, 'must be equal');
            assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
            assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

            // Approve nft token from admin to meta market address
            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedOne, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedOne.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            //Check approved address
            const approvedAddress = await nft.getApproved(tokenIdLimitedOne);
            assert.equal(mMarket.address, approvedAddress, 'must be equal');

            const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenIdLimitedOne, MST, {
                from: admin
            });

            const newOwner = await nft.ownerOf(tokenIdLimitedOne);
            console.log("owner after " + newOwner);

            assert.equal(acceptOfferByOwner.receipt.logs.length, 3, 'triggers two events');
            assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(acceptOfferByOwner.receipt.logs[2].event, 'Sale', 'must be the Sale event');

            assert.equal(acceptOfferByOwner.receipt.logs[0].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.tokenId, tokenIdLimitedOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[0].args.recepient, admin, 'recepient must be admin');

            assert.equal(acceptOfferByOwner.receipt.logs[1].args.feeAddress, admin, 'must be admin address to get royalty');

            assert.equal(acceptOfferByOwner.receipt.logs[2].args.nft_contract_, nft.address, 'must be nft contract address');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.tokenId, tokenIdLimitedOne, 'must be equal');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.seller, admin, 'seller must be admin');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.buyer, userone, 'buyer must be userone');
            assert.equal(acceptOfferByOwner.receipt.logs[2].args.value.toString(), tokenMstPrice.toString(), 'must be equal');

            const getOwnerOfToken = await nft.ownerOf(tokenIdLimitedOne);
            console.log(getOwnerOfToken);
        }
    });

    it('should make sell offer with limited supply type and withdraw it', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '10';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedTwo);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedTwo, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedTwo.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdLimitedTwo, tokenWethPrice, nft.address, WETH, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenWethPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdLimitedTwo, {
                from: admin
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');
        } else {
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedTwo);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedTwo, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedTwo.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdLimitedTwo, tokenMstPrice, nft.address, MST, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'must be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const withdrawselloffer = await mMarket.withdrawSellOffer(nft.address, tokenIdLimitedTwo, {
                from: admin
            });
            assert.equal(withdrawselloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(withdrawselloffer.receipt.logs[0].event, 'SellOfferWithdrawn', 'should be the SellOfferWithdrawn event');
        }
    });

    it('should make sell offer with limited supply type', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenUsdtPriceStr = '1';
            let tokenUsdtPrice = tokenUsdtPriceStr * 1e6;
            const owner = await nft.ownerOf(tokenIdLimitedThree);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedThree, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdLimitedThree, tokenUsdtPrice, nft.address, USDT, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenUsdtPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

            const approveUsdtTokens = await usdt.approve(mMarket.address, tokenUsdtPrice, {
                from: userone
            });
            assert.equal(approveUsdtTokens.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveUsdtTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveUsdtTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveUsdtTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenUsdtPrice.toString(), approveUsdtTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await usdt.allowance(userone, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenUsdtPrice.toString());

            const userBalance = await usdt.balanceOf(userone);
            console.log(userBalance);

            const purchase = await mMarket.purchase(nft.address, tokenIdLimitedThree, USDT, tokenUsdtPrice, {
                from: userone
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
        } else {
            const tokenMstPriceStr = '3';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedThree);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedThree, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedThree.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdLimitedThree, tokenMstPrice, nft.address, MST, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

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

            const purchase = await mMarket.purchase(nft.address, tokenIdLimitedThree, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
        }
    });

    it('should make sell offer with limited supply type', async () => {

        if (network == 'development' || network == 'ganache') {
            const tokenWethPriceStr = '1';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedTwo);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedTwo, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedTwo.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdLimitedTwo, tokenWethPrice, nft.address, WETH, {
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
            assert.equal(approveWethTokens.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(userone, approveWethTokens.logs[0].args.owner, 'must be owner');
            assert.equal(mMarket.address, approveWethTokens.logs[0].args.spender, 'must be spender');
            assert.equal(tokenWethPrice.toString(), approveWethTokens.logs[0].args.value.toString(), 'must be equal');

            //Check approved value
            const checkAllowance = await weth.allowance(userone, mMarket.address);
            assert.equal(checkAllowance.toString(), tokenWethPrice.toString());

            const purchase = await mMarket.purchase(nft.address, tokenIdLimitedTwo, WETH, tokenWethPrice, {
                from: userone
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
        } else {
            const tokenMstPriceStr = '1';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            const owner = await nft.ownerOf(tokenIdLimitedTwo);
            assert.equal(owner, admin, "owned by admin");

            const approveNftToken = await nft.approve(mMarket.address, tokenIdLimitedTwo, {
                from: admin
            });
            assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
            assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'must be the Approval event');
            assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
            assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
            assert.equal(tokenIdLimitedTwo.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

            const selloffer = await mMarket.makeSellOffer(tokenIdLimitedTwo, tokenMstPrice, nft.address, MST, {
                from: admin
            });
            assert.equal(selloffer.receipt.logs.length, 1, 'triggers one events');
            assert.equal(selloffer.receipt.logs[0].event, 'NewSellOffer', 'should be the NewSellOffer event');
            assert.equal(nft.address, selloffer.logs[0].args.nft_contract_, 'must msnft contract address');
            assert.equal(admin, selloffer.logs[0].args.seller, 'admin must seller');
            assert.equal(tokenMstPrice.toString(), selloffer.logs[0].args.value.toString(), 'must be equal');

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

            const purchase = await mMarket.purchase(nft.address, tokenIdLimitedTwo, MST, tokenMstPrice, {
                from: userone
            });
            assert.equal(purchase.receipt.logs.length, 3, 'triggers three events');
            assert.equal(purchase.receipt.logs[0].event, 'RoyaltiesPaid', 'must be the RoyaltiesPaid event');
            assert.equal(purchase.receipt.logs[1].event, 'CalculatedFees', 'must be the CalculatedFees event');
            assert.equal(purchase.receipt.logs[2].event, 'Sale', 'must be the Sale event');
        }
    });

});