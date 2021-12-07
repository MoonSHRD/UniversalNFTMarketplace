const MasterFactory721 = artifacts.require('MasterFactory721');
const NftTemplate = artifacts.require('NftTemplate');
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
    let tokenIdUnlimitOne, tokenIdUnlimitTwo, tokenIdUnlimitThree, tokenIdLimit, tokenIdUniue;
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
        nft = await NftTemplate.deployed();
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
    it('should create nft', async () => {

        const createItemUnlimit = await nft.mintNft(admin);
        const tokenId = createItemUnlimit.logs[1].args.tokenId;
        console.log(createItemUnlimit.logs[0].args);
        console.log(createItemUnlimit.logs[1].args.tokenId);

        const balance = await nft.balanceOf(admin);
        console.log(balance.toString());

        //Set token price
        const tokenMstPriceStr = '2';
        let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
        const owner = await nft.ownerOf(tokenId);
        assert.equal(owner, admin, "owned by admin");

        await mMarket.SetUpMarketplace(nft.address, Enum);

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
        const saleoffer = await mMarket.makeBuyOffer(nft.address, tokenId, MST, tokenMstPrice, {
            from: userone
        });

        assert.equal(saleoffer.receipt.logs.length, 1, 'triggers one events');
        assert.equal(saleoffer.receipt.logs[0].event, 'NewBuyOffer', 'should be the NewBuyOffer event');
        assert.equal(tokenId.toString(), saleoffer.logs[0].args.tokenId.toString(), 'must be equal');
        assert.equal(userone, saleoffer.logs[0].args.buyer, 'offer must be called by userone');
        assert.equal(tokenMstPrice.toString(), saleoffer.logs[0].args.value.toString(), 'must be equal');

        const approveNftToken = await nft.approve(mMarket.address, tokenId, {
            from: admin
        });
        assert.equal(approveNftToken.receipt.logs.length, 1, 'triggers one events');
        assert.equal(approveNftToken.receipt.logs[0].event, 'Approval', 'should be the Approval event');
        assert.equal(admin, approveNftToken.logs[0].args.owner, 'must be equal');
        assert.equal(mMarket.address, approveNftToken.logs[0].args.approved, 'must be equal');
        assert.equal(tokenId.toString(), approveNftToken.logs[0].args.tokenId.toString(), 'must be equal');

        //Check approved address
        const approvedAddress = await nft.getApproved(tokenId);
        assert.equal(mMarket.address, approvedAddress, 'must be equal');

        const acceptOfferByOwner = await mMarket.acceptBuyOffer(nft.address, tokenId, MST, {
            from: admin
        });

        const mMstBalance = await mst.balanceOf(mMarket.address);
        const royaltyMstBalance = await mst.balanceOf(royaltyaddress);
        const aMstBalance = await mst.balanceOf(admin);

        assert.equal(acceptOfferByOwner.receipt.logs.length, 2, 'triggers two events');
        assert.equal(acceptOfferByOwner.receipt.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');
        assert.equal(acceptOfferByOwner.receipt.logs[1].event, 'Sale', 'should be the Sale event');

        assert.equal(acceptOfferByOwner.receipt.logs[0].args.fees.toString(), royaltyMstBalance.toString(), 'must be equal');
        assert.equal(acceptOfferByOwner.receipt.logs[0].args.feeAddress, royaltyaddress, 'must be admin address to get royalty');
        const authorBalance = acceptOfferByOwner.receipt.logs[0].args.transfered_amount - acceptOfferByOwner.receipt.logs[0].args.fees;
        assert.equal(authorBalance.toString(), aMstBalance.toString(), 'must be equal');
        assert.equal(mMstBalance.toString(), 0, 'must be zero after buy offer acception');

        const expectedTokenId = acceptOfferByOwner.receipt.logs[1].args.tokenId;
        assert.equal(acceptOfferByOwner.receipt.logs[1].args.nft_contract_, nft.address, 'must be nft contract address');
        // assert.equal(expectedTokenId, tokenId, 'must be equal');
        assert.equal(acceptOfferByOwner.receipt.logs[1].args.seller, admin, 'seller must be admin');
        assert.equal(acceptOfferByOwner.receipt.logs[1].args.buyer, userone, 'buyer must be userone');
        assert.equal(acceptOfferByOwner.receipt.logs[1].args.value.toString(), tokenMstPrice.toString(), 'must be equal');
    });

});