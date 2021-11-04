const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const USDTcontract = artifacts.require('TestUSDT');
const USDCcontract = artifacts.require('USDC');
const DAIcontract = artifacts.require('DAI');
const MSTcontract = artifacts.require('MST');
const WETHcontract = artifacts.require('WETH');
const TokenSaleSingleton = artifacts.require('TokenSaleSingleton');

const IERC20Metadata = artifacts.require("../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol");

const {BN,expectEvent} = require('@openzeppelin/test-helpers');

contract('MasterFactory721', accounts => {
    let factory;
    let feeAddress;
    let usdc;
    let tokenSaleSingleton;
    const [USDT, USDC, DAI, MST, WETH] = [0, 1, 2, 3, 4];
    let tokensTotal = '50';
    const admin = accounts[0];
    const user = accounts[2];
    let uniqueLinksArr = [];
    const linkOne = 'https://ipfs.io/ipfs/Qmegp2nGgFDqtgi2Y2BgYVExBxycx2FL69eBvgWZoBgQjH?filename=image.jpg';
    const linkThree = 'https://ipfs.io/ipfs/QmWiag3rUdnqNJwop7perc1RHZ6Ua4SPCxeWt9HruTeDxM?filename=nft.json';
    const linkFour = 'https://ipfs.io/ipfs/QmSoB6yijd5dEfBPHXosfJXn9YbcJ7G6wHzH8fcbwzhkeX?filename=photo_2021-01-18_00-49-32.jpg';
    const linkFive = 'https://google.com';
    const desc = 'Lorem ipsum dolor sit amet';
    const [unlimit, unique, rare] = [0, 1, 2];

    let saletemplate;

    before(async () => {
        factory = await MasterFactory721.deployed();
        nft = await MSNFT.deployed();
        usdt = await USDTcontract.deployed();
        usdc = await USDCcontract.deployed();
        dai = await DAIcontract.deployed();
        weth = await WETHcontract.deployed();
        mst = await MSTcontract.deployed();
    });

    it('should create master copy with no limit supply type', async () => {
        const createItemOne = await factory.createMasterItem(linkOne, desc, unlimit);
        let midone = '1';
        const receiptFirstEvent = await expectEvent.inTransaction(createItemOne.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midone,
            description: desc,
            link: linkOne,
        });
        const firstLink = receiptFirstEvent.args.link;
        assert(firstLink == linkOne);
		assert.equal(receiptFirstEvent.event, 'MasterCopyCreatedHuman', 'should be the MasterCopyCreatedHuman event');

    });

    it('should NOT create master copy with no limit supply type', async () => {
        try {
            await factory.createMasterItem(linkOne, desc, unlimit);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should create master copy with unique supply type', async () => {
        const createUniqueItem = await factory.createMasterItem(linkThree, desc, unique);
        let midUnique = '2';
        const receiptEvent = await expectEvent.inTransaction(createUniqueItem.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midUnique,
            description: desc,
            link: linkThree,
        });
        const uniqueLink = receiptEvent.args.link;
        assert(uniqueLink == linkThree);
		assert.equal(receiptEvent.event, 'MasterCopyCreatedHuman', 'should be the MasterCopyCreatedHuman event');
    });

    it('should NOT create master copy with unique supply type', async () => {
        try {
            await factory.createMasterItem(linkThree, desc, unique);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should create master copy with rare supply type', async () => {
        const createRareItemOne = await factory.createMasterItem(linkFour, desc, rare);
        let midRareOne = '3';
        const receiptFirstRareEvent = await expectEvent.inTransaction(createRareItemOne.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midRareOne,
            description: desc,
            link: linkFour,
        });
        const firstRareLink = receiptFirstRareEvent.args.link;
        assert(firstRareLink == linkFour);
		assert.equal(receiptFirstRareEvent.event, 'MasterCopyCreatedHuman', 'should be the MasterCopyCreatedHuman event');

        const createRareItemTwo = await factory.createMasterItem(linkFive, desc, rare);
        let midRareTwo = '4';
        const receiptSecondRareEvent = await expectEvent.inTransaction(createRareItemTwo.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midRareTwo,
            description: desc,
            link: linkFive,
        });
        const secondRareLink = receiptSecondRareEvent.args.link;
        assert(secondRareLink == linkFive);
		assert.equal(receiptSecondRareEvent.event, 'MasterCopyCreatedHuman', 'should be the MasterCopyCreatedHuman event');
    });

    it('should NOT create master copy with rare supply type', async () => {
        try {
            await factory.createMasterItem(linkFour, desc, rare);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should buy nft tokens by USDT', async () => {
        let userTokenBalanceBefore = await usdt.balanceOf(user, {from: admin});

        assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');
        let tokensToMint = web3.utils.toBN(tokensTotal) * 1e6;

        const receipt = await usdt.MintERC20(user, tokensToMint, {from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, usdt.address, 'minted tokens are transferred from');

        let userTokenBalanceAfter = await usdt.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenUsdtPriceStr = '10';
        let tokenUsdtPrice =  web3.utils.toBN(tokenUsdtPriceStr) * 1e6;

        const receiptItemSale = await factory.createItemSale(tokenUsdtPrice, unlimit, USDT, 1);
        saletemplate = await factory.sale_template.call();
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(userTokenBalanceAfter.toString() >= receiptItemSale.receipt.logs[0].args.price.toString());
        
		const approve = await usdt.approve(saletemplate, tokenUsdtPrice, { from: user });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value, tokenUsdtPrice, 'logs the transfer amount');

        const allowance = await usdt.allowance(user,saletemplate);
        assert(allowance == tokenUsdtPrice);

        tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
        const buyToken = await tokenSaleSingleton.buyTokens(user, 1, USDT, 1);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let userBalance = await usdt.balanceOf(user, {from: admin});
        let userBalanceAfterBuy = userTokenBalanceAfter - tokenUsdtPrice;
        assert(userBalance == userBalanceAfterBuy);
        
        let contractTokenBalanceBeforeSale = await usdt.balanceOf(saletemplate, {from: admin});
        assert(contractTokenBalanceBeforeSale == tokenUsdtPrice);

        const balance = await nft.totalSupply();
        assert.equal(balance, 1, 'balance has been replenished');

        const destroyReceipt = await tokenSaleSingleton.withDrawFunds(USDT, 1);
        const checkCreatorBalance = await usdt.balanceOf(admin, {from: admin});
        const contractAddressBalance = await usdt.balanceOf(saletemplate, {from: admin});
        const feeAddress = destroyReceipt.logs[0].args.feeAddress;
        const feeAddressBalance = await usdt.balanceOf(feeAddress, {from: admin});
        assert(checkCreatorBalance.toString() == destroyReceipt.logs[0].args.transfered_amount.toString());
        assert(feeAddressBalance.toString() == destroyReceipt.logs[0].args.fees.toString());
        assert(contractAddressBalance.toString() == '0');
        
    });

    it('should buy nft tokens by USDC', async () => {
        let userTokenBalanceBefore = await usdc.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');
        
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await usdc.MintERC20(user, tokensToMint, {from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, usdc.address, 'minted tokens are transferred from');

        let userTokenBalanceAfter = await usdc.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenUsdcPriceStr = '10';
        let tokenUsdcPrice =  web3.utils.toWei(web3.utils.toBN(tokenUsdcPriceStr));

        tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
		await usdc.approve(saletemplate, 0, { from: user });
        
		const approve = await usdc.approve(saletemplate, tokenUsdcPrice, { from: user });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value, tokenUsdcPrice.toString(), 'logs the transfer amount');

        const allowance = await usdc.allowance(user,saletemplate);
        assert(allowance.toString() == tokenUsdcPrice.toString());

        const buyToken = await tokenSaleSingleton.buyTokens(user, 1, USDC, 1);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');
        let userBalance = await usdc.balanceOf(user, {from: admin});
        let userBalanceAfterBuy = userTokenBalanceAfter - tokenUsdcPrice;
        assert(userBalance == userBalanceAfterBuy);
        
        let contractTokenBalanceBeforeSale = await usdc.balanceOf(saletemplate, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenUsdcPrice.toString());
        
        const balance = await nft.totalSupply();
        assert.equal(balance, 2, 'balance has been replenished');

        const destroyReceipt = await tokenSaleSingleton.withDrawFunds(USDC, 1);
        const checkCreatorBalance = await usdc.balanceOf(admin, {from: admin});
        const contractAddressBalance = await usdc.balanceOf(saletemplate, {from: admin});
        const feeAddress = destroyReceipt.logs[0].args.feeAddress;
        const feeAddressBalance = await usdc.balanceOf(feeAddress, {from: admin});
        assert(checkCreatorBalance.toString() == destroyReceipt.logs[0].args.transfered_amount.toString());
        assert(feeAddressBalance.toString() == destroyReceipt.logs[0].args.fees.toString());
        assert(contractAddressBalance.toString() == '0');

    });

    it('should buy nft tokens by DAI', async () => {
        let userTokenBalanceBefore = await dai.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');
        
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await dai.MintERC20(user, tokensToMint, {from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, dai.address, 'minted tokens are transferred from');

        let userTokenBalanceAfter = await dai.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        
        console.log('userTokenBalanceAfter');
        console.log(userTokenBalanceAfter.toString());

        const tokenDaiPriceStr = '10';
        let tokenDaiPrice =  web3.utils.toWei(web3.utils.toBN(tokenDaiPriceStr));

        const receiptItemSale = await factory.createItemSale(tokenDaiPrice, unique, DAI, 2);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

		await dai.approve(saletemplate, 0, { from: user });
        
		const approve = await dai.approve(saletemplate, tokenDaiPrice, { from: user });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

		assert.equal(approve.logs[0].args.value, tokenDaiPrice.toString(), 'logs the transfer amount');

        const allowance = await dai.allowance(user,saletemplate);
        assert(allowance.toString() == tokenDaiPrice.toString());

        tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);

        const buyToken = await tokenSaleSingleton.buyTokens(user, 1, DAI, 2);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let userBalance = await dai.balanceOf(user, {from: admin});
        let userBalanceAfterBuy = userTokenBalanceAfter - tokenDaiPrice;
        assert(userBalance == userBalanceAfterBuy);

        console.log('userBalance');
        console.log(userBalance.toString());
        
        let contractTokenBalanceBeforeSale = await dai.balanceOf(saletemplate, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenDaiPrice.toString());

        const balance = await nft.totalSupply();
        assert.equal(balance, 3, 'balance has been replenished');

        const destroyReceipt = await tokenSaleSingleton.withDrawFunds(DAI, 2);
        const checkCreatorBalance = await dai.balanceOf(admin, {from: admin});
        const contractAddressBalance = await dai.balanceOf(saletemplate, {from: admin});
        const feeAddress = destroyReceipt.logs[0].args.feeAddress;
        const feeAddressBalance = await dai.balanceOf(feeAddress, {from: admin});
        assert(checkCreatorBalance.toString() == destroyReceipt.logs[0].args.transfered_amount.toString());
        assert(feeAddressBalance.toString() == destroyReceipt.logs[0].args.fees.toString());
        assert(contractAddressBalance.toString() == '0');
    });

    it('should buy nft tokens by MST', async () => {
        let userTokenBalanceBefore = await mst.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');
        
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await mst.MintERC20(user, tokensToMint, {from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, mst.address, 'minted tokens are transferred from');

        let userTokenBalanceAfter = await mst.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenSnmPriceStr = '10';
        let tokenMstPrice =  web3.utils.toWei(web3.utils.toBN(tokenSnmPriceStr));

        const receiptItemSale = await factory.createItemSale(tokenMstPrice, rare, MST, 3);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
        
		await mst.approve(saletemplate, 0, { from: user });
        
		const approveFirst = await mst.approve(saletemplate, tokenMstPrice, { from: user });
        assert.equal(approveFirst.logs.length, 1, 'triggers one event');
		assert.equal(approveFirst.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approveFirst.logs[0].args.owner, user, 'logs the account tokens are authorized by');
		assert.equal(approveFirst.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

		assert.equal(approveFirst.logs[0].args.value, tokenMstPrice.toString(), 'logs the transfer amount');

        const allowanceFirst = await mst.allowance(user,saletemplate);
        assert(allowanceFirst.toString() == tokenMstPrice.toString());

        const buyTokenFirst = await tokenSaleSingleton.buyTokens(user, 1, MST, 3);
        assert.equal(buyTokenFirst.logs.length, 1, 'triggers one event');
		assert.equal(buyTokenFirst.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let userBalanceAfterFistPurchase = await mst.balanceOf(user, {from: admin});
        let userBalanceAfterFirstBuy = userTokenBalanceAfter - tokenMstPrice;
        assert(userBalanceAfterFistPurchase == userBalanceAfterFirstBuy);
        
        let contractTokenBalanceBeforeFirstSale = await mst.balanceOf(saletemplate, {from: admin});
        assert(contractTokenBalanceBeforeFirstSale.toString() == tokenMstPrice.toString());


        await mst.approve(saletemplate, 0, { from: user });
        
		const approveSecond = await mst.approve(saletemplate, tokenMstPrice, { from: user });
        assert.equal(approveSecond.logs.length, 1, 'triggers one event');
		assert.equal(approveSecond.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approveSecond.logs[0].args.owner, user, 'logs the account tokens are authorized by');
		assert.equal(approveSecond.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

		assert.equal(approveSecond.logs[0].args.value, tokenMstPrice.toString(), 'logs the transfer amount');

        const allowanceSecond = await mst.allowance(user,saletemplate);
        assert(allowanceSecond.toString() == tokenMstPrice.toString());

        const buyTokenSecond = await tokenSaleSingleton.buyTokens(user, 1, MST, 3);
        assert.equal(buyTokenSecond.logs.length, 1, 'triggers one event');
		assert.equal(buyTokenSecond.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let userBalanceAfterSecondPurchase = await mst.balanceOf(user, {from: admin});
        let userBalanceAfterSecondBuy = userBalanceAfterFirstBuy - tokenMstPrice;
        assert(userBalanceAfterSecondPurchase.toString() == userBalanceAfterSecondBuy.toString());
        
        let contractTokenBalanceBeforeSecondSale = await mst.balanceOf(saletemplate, {from: admin});
        assert(contractTokenBalanceBeforeSecondSale.toString() == (tokenMstPrice*2).toString());

        const balance = await nft.totalSupply();
        assert.equal(balance, 5, 'balance has been replenished');

        const destroyReceipt = await tokenSaleSingleton.withDrawFunds(MST, 3);
        const checkCreatorBalance = await mst.balanceOf(admin, {from: admin});
        const contractAddressBalance = await mst.balanceOf(saletemplate, {from: admin});
        const feeAddress = destroyReceipt.logs[0].args.feeAddress;
        const feeAddressBalance = await mst.balanceOf(feeAddress, {from: admin});
        assert(checkCreatorBalance.toString() == destroyReceipt.logs[0].args.transfered_amount.toString());
        assert(feeAddressBalance.toString() == destroyReceipt.logs[0].args.fees.toString());
        assert(contractAddressBalance.toString() == '0');
        
    });

    it('should buy nft tokens by WETH', async () => {
        let userTokenBalanceBefore = await weth.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceBefore, 0, 'current admins token balance');
        
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await weth.MintERC20(user, tokensToMint, {from: admin});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, weth.address, 'minted tokens are transferred from');

        let userTokenBalanceAfter = await weth.balanceOf(user, {from: admin});
        assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenWethPriceStr = '10';
        let tokenWethPrice =  web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));
        
        const receiptItemSale = await factory.createItemSale(tokenWethPrice, rare, WETH, 4);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        console.log('price weth');
        console.log(receiptItemSale.receipt.logs[0].args.price.toString());

		await weth.approve(saletemplate, 0, { from: user });
        
		const approve = await weth.approve(saletemplate, tokenWethPrice, { from: user });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, user, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, saletemplate, 'logs the account tokens are authorized to');

		assert.equal(approve.logs[0].args.value, tokenWethPrice.toString(), 'logs the transfer amount');

        const allowance = await weth.allowance(user,saletemplate);
        assert(allowance.toString() == tokenWethPrice.toString());

        tokenSaleSingleton = await TokenSaleSingleton.at(saletemplate);
        const buyToken = await tokenSaleSingleton.buyTokens(user, 1, WETH, 4);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let userBalance = await weth.balanceOf(user, {from: admin});
        console.log('userBalance');
        console.log(userBalance.toString());
        let userBalanceAfterBuy = userTokenBalanceAfter - tokenWethPrice;
        assert(userBalance == userBalanceAfterBuy);
        
        let contractTokenBalanceBeforeSale = await weth.balanceOf(saletemplate, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenWethPrice.toString());
        
        const balance = await nft.totalSupply();
        assert.equal(balance, 6, 'balance has been replenished');

        const destroyReceipt = await tokenSaleSingleton.withDrawFunds(WETH, 4);
        const checkCreatorBalance = await weth.balanceOf(admin, {from: admin});
        const contractAddressBalance = await weth.balanceOf(saletemplate, {from: admin});
        const feeAddress = destroyReceipt.logs[0].args.feeAddress;
        const feeAddressBalance = await weth.balanceOf(feeAddress, {from: admin});
        assert(checkCreatorBalance.toString() == destroyReceipt.logs[0].args.transfered_amount.toString());
        assert(feeAddressBalance.toString() == destroyReceipt.logs[0].args.fees.toString());
        assert(contractAddressBalance.toString() == '0');

        /* this test get info about nft's created by author, we need to test getting boughted items by user, we need to rework this test
        const userNfts =  await nft.getMasterIdByAddress(admin);
        console.log('userNfts ');

        for (let index = 0; index < userNfts.length; index++) { 
            console.log(userNfts[index]);
        }
        */
        
    });
});