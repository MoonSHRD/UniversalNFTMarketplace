const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const USDTcontract = artifacts.require('TestUSDT');
const USDCcontract = artifacts.require('USDC');
const DAIcontract = artifacts.require('DAI');
const MSTcontract = artifacts.require('MST');
const WETHcontract = artifacts.require('WETH');
const TokenSaleSingleton = artifacts.require('TokenSaleSingleton');

const IERC20Metadata = artifacts.require("../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol");

const {
    BN,
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

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
   }
   return result;
}

contract('MasterFactory721', accounts => {
    let factory, network, tokenSaleSingleton, feeAddress, nft, mst, usdt, dai, usdc, weth;
    let midUnlimit, midRareOne, midRareTwo;
    const [USDT, USDC, DAI, MST, WETH] = [0, 1, 2, 3, 4];
    let tokensTotal = '50';
    let linkOne, linkTwo, linkThree, linkFour;
    let admin, user;
    const desc = 'Lorem ipsum dolor sit amet';
    const [limited, unlimit] = [2, 0];

    let saletemplate;

    before(async () => {
        factory = await MasterFactory721.deployed();
        nft = await MSNFT.deployed();
        mst = await MSTcontract.deployed();
        linkOne = 'https://google.com/' + makeRandomLink(11);
        linkTwo = 'https://google.com/' + makeRandomLink(11);
        linkThree = 'https://google.com/' + makeRandomLink(11);
        linkFour = 'https://google.com/' + makeRandomLink(11);
        network = process.env.NETWORK;
        if (network == 'development' || network == 'ganache') {
            usdt = await USDTcontract.deployed();
            usdc = await USDCcontract.deployed();
            dai = await DAIcontract.deployed();
            weth = await WETHcontract.deployed();
            admin = accounts[0];
            user = accounts[2];
        } else if (network == 'ropsten'){
            admin = '0xF87F1eaa6Fd9B65bF41F90afEdF8B64D6487F61E';
            user = '0x1b7C81DbAF6f34E878686CE6FA9463c48E2185C7';
        }
    });

    it('should create master copy with no limit supply type', async () => {
        const createItemOne = await factory.createMasterItem(linkOne, desc, unlimit);
        assert.equal(createItemOne.receipt.logs.length, 1, 'triggers two events');
        assert.equal(createItemOne.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        if (network == 'development' || network == 'ganache') {
            midUnlimit = '1';
        } else {
            midUnlimit = createUniqueItem.receipt.logs[0].args.master_id;
        }
        const firstLink = createItemOne.receipt.logs[0].args.link;
        assert(firstLink == linkOne);

    });

    it('should NOT create master copy with no limit supply type', async () => {
        try {
            await factory.createMasterItem(linkOne, desc, unlimit);
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should create master copy with limited supply type', async () => {
        const createRareItemOne = await factory.createMasterItem(linkThree, desc, limited);
        assert.equal(createRareItemOne.receipt.logs.length, 1, 'triggers two events');
        assert.equal(createRareItemOne.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        if (network == 'development' || network == 'ganache') {
            midRareOne = '2';
        } else {
            midRareOne = createUniqueItem.receipt.logs[0].args.master_id;
        }
        const firstRareLink = createRareItemOne.receipt.logs[0].args.link;
        assert(firstRareLink == linkThree);

        const createRareItemTwo = await factory.createMasterItem(linkFour, desc, limited);
        console.log(createRareItemTwo.receipt.logs[0].args);
        assert.equal(createRareItemTwo.receipt.logs.length, 1, 'triggers two events');
        assert.equal(createRareItemTwo.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        if (network == 'development' || network == 'ganache') {
            midRareTwo = '3';
        } else {
            midRareTwo = createUniqueItem.receipt.logs[0].args.master_id;
        }
        const secondRareLink = createRareItemTwo.receipt.logs[0].args.link;
        assert(secondRareLink == linkFour);
    });

    it('should NOT create master copy with limited supply type', async () => {
        try {
            await factory.createMasterItem(linkFour, desc, limited);
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should buy nft tokens by USDT', async () => {

        if (network == 'development' || network == 'ganache') {
            let userTokenBalanceBefore = await usdt.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');
            let tokensToMint = web3.utils.toBN(tokensTotal) * 1e6;
            const receipt = await usdt.MintERC20(user, tokensToMint, {
                from: admin
            });
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].address, usdt.address, 'minted tokens are transferred from');

            let userTokenBalanceAfter = await usdt.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

            const tokenUsdtPriceStr = '10';
            let tokenUsdtPrice = web3.utils.toBN(tokenUsdtPriceStr) * 1e6;

            const receiptItemSale = await factory.createItemSale(tokenUsdtPrice, unlimit, USDT, midUnlimit);
            saletemplate = await factory.sale_template.call();
            assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
            assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
            assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
            assert(userTokenBalanceAfter.toString() >= receiptItemSale.receipt.logs[0].args.price.toString());

            const approve = await usdt.approve(saletemplate, tokenUsdtPrice, {
                from: user
            });
            assert.equal(approve.logs.length, 1, 'triggers one event');
            assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
            assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');
            assert.equal(approve.logs[0].args.value, tokenUsdtPrice, 'logs the transfer amount');

            const allowance = await usdt.allowance(user, saletemplate);
            assert(allowance == tokenUsdtPrice);


            tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);

            //check sold count before buyTokens
            let scBefore = await tokenSaleSingleton.MSaleInfo.call(midUnlimit);
            assert.equal(scBefore._sold_count.toString(), 0, 'should be zero');
            console.log("scBefore");
            console.log(scBefore._sold_count.toString());

            const buyToken = await tokenSaleSingleton.buyTokens(user, USDT, midUnlimit, 0);
            assert.equal(buyToken.logs.length, 1, 'triggers one event');
            assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

            //check sold count before buyTokens
            let scAfter = await tokenSaleSingleton.MSaleInfo.call(midUnlimit);
            assert.equal(scAfter._sold_count.toString(), 1, 'should be one');
            console.log("scAfter");
            console.log(scAfter._sold_count.toString());
            
            let userBalance = await usdt.balanceOf(user, {
                from: admin
            });
            let userBalanceAfterBuy = userTokenBalanceAfter - tokenUsdtPrice;
            assert(userBalance == userBalanceAfterBuy);

            const balanceUsdtBeforeWithdraw = await tokenSaleSingleton.getBalances(USDT, midUnlimit);
            assert.equal(balanceUsdtBeforeWithdraw.toString(), tokenUsdtPrice.toString(), "must be equal");

            const balance = await nft.totalSupply();
            assert.equal(balance, 1, 'balance has been replenished');

            const withDrawFunds = await tokenSaleSingleton.withDrawFunds(USDT, midUnlimit);
            assert.equal(withDrawFunds.logs.length, 1, 'triggers one event');
            assert.equal(withDrawFunds.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');

            const balanceUsdtAfterWithdraw = await tokenSaleSingleton.getBalances(USDT, midUnlimit);

            assert.equal(balanceUsdtAfterWithdraw, 0, "must be zero after withdraw funds");

            const checkCreatorBalance = await usdt.balanceOf(admin, {
                from: admin
            });

            const feeAddress = withDrawFunds.logs[0].args.feeAddress;
            const feeAddressBalance = await usdt.balanceOf(feeAddress, {
                from: admin
            });
            assert(checkCreatorBalance.toString() == withDrawFunds.logs[0].args.transfered_amount.toString());
            assert(feeAddressBalance.toString() == withDrawFunds.logs[0].args.fees.toString());
        }
    });

    it('should buy nft tokens by USDC', async () => {

        if (network == 'development' || network == 'ganache') {
            let userTokenBalanceBefore = await usdc.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');

            let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receipt = await usdc.MintERC20(user, tokensToMint, {
                from: admin
            });
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].address, usdc.address, 'minted tokens are transferred from');

            let userTokenBalanceAfter = await usdc.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

            const tokenUsdcPriceStr = '10';
            let tokenUsdcPrice = web3.utils.toWei(web3.utils.toBN(tokenUsdcPriceStr));

            tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
            await usdc.approve(saletemplate, 0, {
                from: user
            });

            const approve = await usdc.approve(saletemplate, tokenUsdcPrice, {
                from: user
            });
            assert.equal(approve.logs.length, 1, 'triggers one event');
            assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
            assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');
            assert.equal(approve.logs[0].args.value, tokenUsdcPrice.toString(), 'logs the transfer amount');

            const allowance = await usdc.allowance(user, saletemplate);
            assert(allowance.toString() == tokenUsdcPrice.toString());

            const buyToken = await tokenSaleSingleton.buyTokens(user, USDC, midUnlimit, 0);
            assert.equal(buyToken.logs.length, 1, 'triggers one event');
            assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');
            let userBalance = await usdc.balanceOf(user, {
                from: admin
            });
            let userBalanceAfterBuy = userTokenBalanceAfter - tokenUsdcPrice;
            assert(userBalance == userBalanceAfterBuy);

            const balanceUsdcBeforeWithdraw = await tokenSaleSingleton.getBalances(USDC, midUnlimit);
            assert.equal(balanceUsdcBeforeWithdraw.toString(), tokenUsdcPrice.toString(), "must be equal");

            const balance = await nft.totalSupply();
            assert.equal(balance, 2, 'balance has been replenished');

            const withDrawFunds = await tokenSaleSingleton.withDrawFunds(USDC, midUnlimit);
            assert.equal(withDrawFunds.logs.length, 1, 'triggers one event');
            assert.equal(withDrawFunds.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');

            const balanceUsdcAfterWithdraw = await tokenSaleSingleton.getBalances(USDC, midUnlimit);

            assert.equal(balanceUsdcAfterWithdraw, 0, "must be zero after withdraw funds");

            const checkCreatorBalance = await usdc.balanceOf(admin, {
                from: admin
            });

            const feeAddress = withDrawFunds.logs[0].args.feeAddress;
            const feeAddressBalance = await usdc.balanceOf(feeAddress, {
                from: admin
            });
            assert(checkCreatorBalance.toString() == withDrawFunds.logs[0].args.transfered_amount.toString());
            assert(feeAddressBalance.toString() == withDrawFunds.logs[0].args.fees.toString());
        }
    });

    // it('should buy nft tokens by DAI', async () => {

    //     if (network == 'development' || network == 'ganache') {
    //         let userTokenBalanceBefore = await dai.balanceOf(user, {
    //             from: admin
    //         });
    //         assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');

    //         let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

    //         const receipt = await dai.MintERC20(user, tokensToMint, {
    //             from: admin
    //         });
    //         assert.equal(receipt.logs.length, 1, 'triggers one event');
    //         assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
    //         assert.equal(receipt.logs[0].address, dai.address, 'minted tokens are transferred from');

    //         let userTokenBalanceAfter = await dai.balanceOf(user, {
    //             from: admin
    //         });
    //         assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

    //         const tokenDaiPriceStr = '10';
    //         let tokenDaiPrice = web3.utils.toWei(web3.utils.toBN(tokenDaiPriceStr));

    //         const receiptItemSale = await factory.createItemSale(tokenDaiPrice, unique, DAI, midUnique);
    //         assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
    //         assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
    //         assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
    //         assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

    //         await dai.approve(saletemplate, 0, {
    //             from: user
    //         });

    //         const approve = await dai.approve(saletemplate, tokenDaiPrice, {
    //             from: user
    //         });
    //         assert.equal(approve.logs.length, 1, 'triggers one event');
    //         assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
    //         assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
    //         assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

    //         assert.equal(approve.logs[0].args.value, tokenDaiPrice.toString(), 'logs the transfer amount');

    //         const allowance = await dai.allowance(user, saletemplate);
    //         assert(allowance.toString() == tokenDaiPrice.toString());

    //         tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);

    //         const buyToken = await tokenSaleSingleton.buyTokens(user, DAI, midUnique, unique);
    //         assert.equal(buyToken.logs.length, 1, 'triggers one event');
    //         assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

    //         let userBalance = await dai.balanceOf(user, {
    //             from: admin
    //         });
    //         let userBalanceAfterBuy = userTokenBalanceAfter - tokenDaiPrice;
    //         assert(userBalance == userBalanceAfterBuy);

    //         const balanceDaiBeforeWithdraw = await tokenSaleSingleton.getBalances(DAI, midUnique);
    //         assert.equal(balanceDaiBeforeWithdraw.toString(), tokenDaiPrice.toString(), "must be equal");

    //         const balance = await nft.totalSupply();
    //         assert.equal(balance, 3, 'balance has been replenished');

    //         const withDrawFunds = await tokenSaleSingleton.withDrawFunds(DAI, midUnique);
    //         assert.equal(withDrawFunds.logs.length, 1, 'triggers one event');
    //         assert.equal(withDrawFunds.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');

    //         const balanceDaiAfterWithdraw = await tokenSaleSingleton.getBalances(DAI, midUnique);
    //         assert.equal(balanceDaiAfterWithdraw, 0, "must be zero after withdraw funds");
    //         const checkCreatorBalance = await dai.balanceOf(admin, {
    //             from: admin
    //         });

    //         const feeAddress = withDrawFunds.logs[0].args.feeAddress;
    //         const feeAddressBalance = await dai.balanceOf(feeAddress, {
    //             from: admin
    //         });
    //         assert(checkCreatorBalance.toString() == withDrawFunds.logs[0].args.transfered_amount.toString());
    //         assert(feeAddressBalance.toString() == withDrawFunds.logs[0].args.fees.toString());
    //     }
    // });

    it('should buy nft tokens by MST', async () => {
        if (network == 'development' || network == 'ganache') {
            let userTokenBalanceBefore = await mst.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');

            let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receipt = await mst.MintERC20(user, tokensToMint, {
                from: admin
            });
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].address, mst.address, 'minted tokens are transferred from');

            let userTokenBalanceAfter = await mst.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));

            const receiptItemSale = await factory.createItemSale(tokenMstPrice, limited, MST, midRareOne);
            assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
            assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
            assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
            assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

            tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);

            await mst.approve(saletemplate, 0, {
                from: user
            });

            const approveFirst = await mst.approve(saletemplate, tokenMstPrice, {
                from: user
            });
            assert.equal(approveFirst.logs.length, 1, 'triggers one event');
            assert.equal(approveFirst.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(approveFirst.logs[0].args.owner, user, 'logs the account tokens are authorized by');
            assert.equal(approveFirst.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

            assert.equal(approveFirst.logs[0].args.value, tokenMstPrice.toString(), 'logs the transfer amount');

            const allowanceFirst = await mst.allowance(user, saletemplate);
            assert(allowanceFirst.toString() == tokenMstPrice.toString());

            const buyTokenFirst = await tokenSaleSingleton.buyTokens(user, MST, midRareOne, 0);
            assert.equal(buyTokenFirst.logs.length, 1, 'triggers one event');
            assert.equal(buyTokenFirst.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');
            
            const checklimone = await tokenSaleSingleton.sold_count(midRareOne);
            console.log(checklimone.toString());

            let userBalanceAfterFistPurchase = await mst.balanceOf(user, {
                from: admin
            });
            let userBalanceAfterFirstBuy = userTokenBalanceAfter - tokenMstPrice;
            assert(userBalanceAfterFistPurchase == userBalanceAfterFirstBuy);

            const balanceMstAfterFirstSale = await tokenSaleSingleton.getBalances(MST, midRareOne);
            assert.equal(balanceMstAfterFirstSale.toString(), tokenMstPrice.toString(), "must be equal");

            await mst.approve(saletemplate, 0, {
                from: user
            });

            const approveSecond = await mst.approve(saletemplate, tokenMstPrice, {
                from: user
            });
            assert.equal(approveSecond.logs.length, 1, 'triggers one event');
            assert.equal(approveSecond.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(approveSecond.logs[0].args.owner, user, 'logs the account tokens are authorized by');
            assert.equal(approveSecond.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

            assert.equal(approveSecond.logs[0].args.value, tokenMstPrice.toString(), 'logs the transfer amount');

            const allowanceSecond = await mst.allowance(user, saletemplate);
            assert(allowanceSecond.toString() == tokenMstPrice.toString());


            const buyTokenSecond = await tokenSaleSingleton.buyTokens(user, MST, midRareOne, 1);
            assert.equal(buyTokenSecond.logs.length, 1, 'triggers one event');
            assert.equal(buyTokenSecond.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

            
            const checklimtwo = await tokenSaleSingleton.sold_count(midRareOne);
            console.log(checklimtwo.toString());

            let userBalanceAfterSecondPurchase = await mst.balanceOf(user, {
                from: admin
            });
            let userBalanceAfterSecondBuy = userBalanceAfterFirstBuy - tokenMstPrice;
            assert(userBalanceAfterSecondPurchase.toString() == userBalanceAfterSecondBuy.toString());


            const balanceMstAfterSecondSale = await tokenSaleSingleton.getBalances(MST, midRareOne);
            assert.equal(balanceMstAfterSecondSale.toString(), (tokenMstPrice * 2).toString(), "must be equal");

            const balance = await nft.totalSupply();
            assert.equal(balance, 4, 'balance has been replenished');

            const withDrawFunds = await tokenSaleSingleton.withDrawFunds(MST, midRareOne);
            assert.equal(withDrawFunds.logs.length, 1, 'triggers one event');
            assert.equal(withDrawFunds.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');
            const checkCreatorBalance = await mst.balanceOf(admin, {
                from: admin
            });

            const balanceMstAfterWithdraw = await tokenSaleSingleton.getBalances(MST, midRareOne);
            assert.equal(balanceMstAfterWithdraw, 0, "must be zero after withdraw funds");

            const feeAddress = withDrawFunds.logs[0].args.feeAddress;
            const feeAddressBalance = await mst.balanceOf(feeAddress, {
                from: admin
            });
            assert(checkCreatorBalance.toString() == withDrawFunds.logs[0].args.transfered_amount.toString());
            assert(feeAddressBalance.toString() == withDrawFunds.logs[0].args.fees.toString());
        } else {

            let userTokenBalance = await mst.balanceOf(user, {
                from: admin
            });
            let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receipt = await mst.MintERC20(user, tokensToMint, {
                from: admin
            });
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].address, mst.address, 'minted tokens are transferred from');

            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));

            const receiptItemSale = await factory.createItemSale(tokenMstPrice, unlimit, MST, midOne);
            saletemplate = await factory.sale_template.call();
            assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
            assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
            assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
            assert(userTokenBalance, receiptItemSale.receipt.logs[0].args.price, 'balance must be above the price');

            tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
            await mst.approve(saletemplate, 0, {
                from: user
            });

            const approve = await mst.approve(saletemplate, tokenMstPrice, {
                from: user
            });
            assert.equal(approve.logs.length, 1, 'triggers one event');
            assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
            assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

            assert(approve.logs[0].args.value.toString() == tokenMstPrice.toString());

            const allowance = await mst.allowance(user, saletemplate);
            assert(allowance.toString() == tokenMstPrice.toString());

            const buyToken = await tokenSaleSingleton.buyTokens(user, 1, MST, midOne);
            assert.equal(buyToken.logs.length, 1, 'triggers one event');
            assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

            const balanceMstAfterSecondSale = await tokenSaleSingleton.getBalances(MST, midOne);
            assert.equal(balanceMstAfterSecondSale.toString(), tokenMstPrice.toString(), "must be equal");

            let withDrawFunds = await tokenSaleSingleton.withDrawFunds(MST, midOne);
            assert.equal(withDrawFunds.logs.length, 1, 'triggers one event');
            assert.equal(withDrawFunds.logs[0].event, 'CalculatedFees', 'should be the CalculatedFees event');
            
            const balanceMstAfterWithdraw = await tokenSaleSingleton.getBalances(MST, midOne);
            assert.equal(balanceMstAfterWithdraw, 0, "must be zero after withdraw funds");

            // let serviceFees = withDrawFunds.logs[0].args.fees;
            // let feeAddressBalanceUsdt = await mst.balanceOf(feeAddress);
            const feeAddressRopsten = withDrawFunds.logs[0].args.feeAddress;
            const feeAddressBalance = await mst.balanceOf(feeAddressRopsten, {
                from: admin
            });
            console.log("transfered_amount " + withDrawFunds.logs[0].args.transfered_amount.toString());
            console.log("fees " + withDrawFunds.logs[0].args.fees.toString());
            console.log("feeAddressBalance " + feeAddressBalance.toString());
            // assert(checkCreatorBalance.toString() == withDrawFunds.logs[0].args.transfered_amount.toString());
            // assert(feeAddressBalance.toString() == withDrawFunds.logs[0].args.fees.toString());

            const balance = await nft.totalSupply();
            assert.equal(balance, 1, 'balance has been replenished');
        }
    });

    it('should NOT buy limited nft tokens because of cup', async () => {
        try {
            const tokenMstPriceStr = '10';
            let tokenMstPrice = web3.utils.toWei(web3.utils.toBN(tokenMstPriceStr));
            await mst.approve(saletemplate, 0, {
                from: user
            });
            await mst.approve(saletemplate, tokenMstPrice, {
                from: user
            });
            await mst.allowance(user, saletemplate);
            await tokenSaleSingleton.buyTokens(user, MST, midRareOne, 0);
        } catch (e) {
            assert(e.message, 'try to mint more than totalSupply of Limited tokent');
        }
    });

    it('should buy nft tokens by WETH', async () => {

        if (network == 'development' || network == 'ganache') {
            let userTokenBalanceBefore = await weth.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');

            let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

            const receipt = await weth.MintERC20(user, tokensToMint, {
                from: admin
            });
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].address, weth.address, 'minted tokens are transferred from');

            let userTokenBalanceAfter = await weth.balanceOf(user, {
                from: admin
            });
            assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

            const tokenWethPriceStr = '10';
            let tokenWethPrice = web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));

            const receiptItemSale = await factory.createItemSale(tokenWethPrice, limited, WETH, midRareTwo);
            assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
            assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
            assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
            assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

            await weth.approve(saletemplate, 0, {
                from: user
            });

            const approve = await weth.approve(saletemplate, tokenWethPrice, {
                from: user
            });
            assert.equal(approve.logs.length, 1, 'triggers one event');
            assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
            assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

            assert.equal(approve.logs[0].args.value, tokenWethPrice.toString(), 'logs the transfer amount');

            const allowance = await weth.allowance(user, saletemplate);
            assert(allowance.toString() == tokenWethPrice.toString());

            tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
            const buyToken = await tokenSaleSingleton.buyTokens(user, WETH, midRareTwo, 0);
            assert.equal(buyToken.logs.length, 1, 'triggers one event');
            assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

            let userBalance = await weth.balanceOf(user, {
                from: admin
            });
            let userBalanceAfterBuy = userTokenBalanceAfter - tokenWethPrice;
            assert(userBalance == userBalanceAfterBuy);

            const balanceWethAfterSecondSale = await tokenSaleSingleton.getBalances(WETH, midRareTwo);
            assert.equal(balanceWethAfterSecondSale.toString(), tokenWethPrice.toString(), "must be equal");

            const balance = await nft.totalSupply();
            assert.equal(balance, 5, 'balance has been replenished');

            const withDrawFunds = await tokenSaleSingleton.withDrawFunds(WETH, midRareTwo);

            const balanceWethAfterWithdraw = await tokenSaleSingleton.getBalances(WETH, midRareTwo);
            assert.equal(balanceWethAfterWithdraw, 0, "must be zero after withdraw funds");

            const checkCreatorBalance = await weth.balanceOf(admin, {
                from: admin
            });
            const feeAddress = withDrawFunds.logs[0].args.feeAddress;
            const feeAddressBalance = await weth.balanceOf(feeAddress, {
                from: admin
            });
            assert(checkCreatorBalance.toString() == withDrawFunds.logs[0].args.transfered_amount.toString());
            assert(feeAddressBalance.toString() == withDrawFunds.logs[0].args.fees.toString());

            /* this test get info about nft's created by author, we need to test getting boughted items by user, we need to rework this test
            const userNfts =  await nft.getMasterIdByAddress(admin);
            console.log('userNfts ');

            for (let index = 0; index < userNfts.length; index++) { 
                console.log(userNfts[index]);
            }
            */
        }
    });
});