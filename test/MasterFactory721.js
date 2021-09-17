const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const USDTcontract = artifacts.require('TestUSDT');
const USDCcontract = artifacts.require('USDC');
const DAIcontract = artifacts.require('DAI');
const SNMcontract = artifacts.require('SNM');
const WETHcontract = artifacts.require('WETH');
const TokenSale721 = artifacts.require('TokenSale721');

const IERC20Metadata = artifacts.require("../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol");

const {BN,expectEvent} = require('@openzeppelin/test-helpers');

contract('MasterFactory721', accounts => {
    let factory;
    let usdc;
    let tokenSale721;
    const [USDT, USDC, DAI, SNM, WETH] = [0, 1, 2, 3, 4];
    let tokensTotal = '50';
    const admin = accounts[0];
    const user = accounts[1];
    let unlimitLinksArr = [];
    let uniqueLinksArr = [];
    let rareLinksArr = [];
    const linkOne = 'https://ipfs.io/ipfs/Qmegp2nGgFDqtgi2Y2BgYVExBxycx2FL69eBvgWZoBgQjH?filename=image.jpg';
    const linkTwo = 'https://ipfs.io/ipfs/QmdFCbi5zVjWUMkkzFMjmaC82mkgPiXsydVfwzeuRqoS4b?filename=skald-500.jpg';
    const linkThree = 'https://ipfs.io/ipfs/QmWiag3rUdnqNJwop7perc1RHZ6Ua4SPCxeWt9HruTeDxM?filename=nft.json';
    const linkFour = 'https://ipfs.io/ipfs/QmSoB6yijd5dEfBPHXosfJXn9YbcJ7G6wHzH8fcbwzhkeX?filename=photo_2021-01-18_00-49-32.jpg';
    const linkFive = 'https://ipfs.io/ipfs/QmU6FgbzFwGuVffhQJFCTW79jGD8i36VDeYdTd9g7ASZGb?filename=complete_map.jpg';
    const desc = 'Lorem ipsum dolor sit amet';
    const zero_address = "0x0000000000000000000000000000000000000000";
    const [unlimit, unique, rare] = [0, 1, 2];

    before(async () => {
        factory = await MasterFactory721.deployed();
        nft = await MSNFT.deployed();
        usdt = await USDTcontract.deployed();
        usdc = await USDCcontract.deployed();
        dai = await DAIcontract.deployed();
        weth = await WETHcontract.deployed();
        snm = await SNMcontract.deployed();
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
        const createItemTwo = await factory.createMasterItem(linkTwo, desc, unlimit);
        let midtwo = '2';
        const receiptSecondEvent = await expectEvent.inTransaction(createItemTwo.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midtwo,
            description: desc,
            link: linkTwo,
        });
        const secondLink = receiptSecondEvent.args.link;
        assert(secondLink == linkTwo);
		assert.equal(receiptSecondEvent.event, 'MasterCopyCreatedHuman', 'should be the MasterCopyCreatedHuman event');
        assert(firstLink != secondLink);
        unlimitLinksArr.push(firstLink, secondLink);
        assert.equal(unlimitLinksArr.length, 2, 'count of unlimit master copy creations');
    });

    it('should NOT create master copy with no limit supply type', async () => {
        try {
            await factory.createMasterItem(linkOne, desc, unlimit);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
        try {
            await factory.createMasterItem(linkTwo, desc, unlimit);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should create master copy with unique supply type', async () => {
        const createUniqueItem = await factory.createMasterItem(linkThree, desc, unique);
        let midUnique = '3';
        const receiptEvent = await expectEvent.inTransaction(createUniqueItem.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midUnique,
            description: desc,
            link: linkThree,
        });
        const uniqueLink = receiptEvent.args.link;
        assert(uniqueLink == linkThree);
		assert.equal(receiptEvent.event, 'MasterCopyCreatedHuman', 'should be the MasterCopyCreatedHuman event');
        uniqueLinksArr.push(uniqueLink);
        assert(uniqueLinksArr.length == unique);
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
        let midRareOne = '4';
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
        let midRareTwo = '5';
        const receiptSecondRareEvent = await expectEvent.inTransaction(createRareItemTwo.tx, nft, 'MasterCopyCreatedHuman', {
            author: admin,
            master_id: midRareTwo,
            description: desc,
            link: linkFive,
        });
        const secondRareLink = receiptSecondRareEvent.args.link;
        assert(secondRareLink == linkFive);
		assert.equal(receiptSecondRareEvent.event, 'MasterCopyCreatedHuman', 'should be the CreateMasterItem event');
        assert(firstRareLink != secondRareLink);
        rareLinksArr.push(firstRareLink, secondRareLink);
        assert.equal(rareLinksArr.length, rare, 'count of unlimit master copy creations');
    });

    it('should NOT create master copy with rare supply type', async () => {
        try {
            await factory.createMasterItem(linkFour, desc, rare);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
        try {
            await factory.createMasterItem(linkFive, desc, rare);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should buy nft tokens by USDT', async () => {
        let adminTokenBalanceBefore = await usdt.balanceOf(admin);

        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        let tokensToMint = web3.utils.toBN(tokensTotal) * 1e6;

        const receipt = await usdt.MintERC20(admin, tokensToMint);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, usdt.address, 'minted tokens are transferred from');

        let adminTokenBalanceAfter = await usdt.balanceOf(admin);
        assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenUsdtPriceStr = '10';
        let tokenUsdtPrice =  web3.utils.toBN(tokenUsdtPriceStr) * 1e6;

        const receiptItemSale = await factory.createItemSale(tokenUsdtPrice, unlimit, USDT, 1);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(adminTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        const contractAddress = receiptItemSale.receipt.logs[0].args.it_sale;
        
		const approve = await usdt.approve(contractAddress, tokenUsdtPrice, { from: admin });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, admin, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, contractAddress, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value, tokenUsdtPrice, 'logs the transfer amount');

        const allowance = await usdt.allowance(admin,contractAddress);
        assert(allowance == tokenUsdtPrice);

        tokenSale721 = await TokenSale721.at(contractAddress);
        const buyToken = await tokenSale721.buyTokens(admin, 1, USDT);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let adminBalance = await usdt.balanceOf(admin);
        let adminBalanceAfterBuy = adminTokenBalanceAfter - tokenUsdtPrice;
        assert(adminBalance == adminBalanceAfterBuy);
        
        let contractTokenBalanceBeforeSale = await usdt.balanceOf(contractAddress, {from: admin});
        assert(contractTokenBalanceBeforeSale == tokenUsdtPrice);

        let withDrawFunds = await tokenSale721.withDrawFunds(USDT);
        let serviceFees = withDrawFunds.logs[0].args.fees;
        let feeAddress = withDrawFunds.logs[0].args.feeAddress;
        let feeAddressBalanceUsdt = await usdt.balanceOf(feeAddress, {from: admin});
        assert.equal(serviceFees.toString(), feeAddressBalanceUsdt.toString(), 'must be equal');
    });

    it('should buy nft tokens by USDC', async () => {
        let adminTokenBalanceBefore = await usdc.balanceOf(admin);

        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await usdc.MintERC20(admin, tokensToMint);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, usdc.address, 'minted tokens are transferred from');

        let adminTokenBalanceAfter = await usdc.balanceOf(admin);
        assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenUsdcPriceStr = '10';
        let tokenUsdcPrice =  web3.utils.toWei(web3.utils.toBN(tokenUsdcPriceStr));

        const receiptItemSale = await factory.createItemSale(tokenUsdcPrice, unlimit, USDC, 2);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(adminTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        const contractAddress = receiptItemSale.receipt.logs[0].args.it_sale;
        
		const approve = await usdc.approve(contractAddress, tokenUsdcPrice, { from: admin });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, admin, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, contractAddress, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value.toString(), tokenUsdcPrice.toString(), 'logs the transfer amount');

        const allowance = await usdc.allowance(admin,contractAddress);
        assert(allowance.toString() == tokenUsdcPrice.toString());

        tokenSale721 = await TokenSale721.at(contractAddress);
        const buyToken = await tokenSale721.buyTokens(admin, 1, USDC);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let adminBalance = await usdc.balanceOf(admin);
        let adminBalanceAfterBuy = adminTokenBalanceAfter - tokenUsdcPrice;
        assert(adminBalance.toString() == adminBalanceAfterBuy.toString());
        
        let contractTokenBalanceBeforeSale = await usdc.balanceOf(contractAddress, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenUsdcPrice.toString());

        let withDrawFunds = await tokenSale721.withDrawFunds(USDC);
        let serviceFees = withDrawFunds.logs[0].args.fees;
        let feeAddress = withDrawFunds.logs[0].args.feeAddress;
        let feeAddressBalanceUsdt = await usdc.balanceOf(feeAddress, {from: admin});
        assert.equal(serviceFees.toString(), feeAddressBalanceUsdt.toString(), 'must be equal');
    });

    it('should buy nft tokens by DAI', async () => {
        let adminTokenBalanceBefore = await dai.balanceOf(admin);

        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await dai.MintERC20(admin, tokensToMint);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, dai.address, 'minted tokens are transferred from');

        let adminTokenBalanceAfter = await dai.balanceOf(admin);
        assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenDaiPriceStr = '10';
        let tokenDaiPrice =  web3.utils.toWei(web3.utils.toBN(tokenDaiPriceStr));

        const receiptItemSale = await factory.createItemSale(tokenDaiPrice, unique, DAI, 3);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(adminTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        const contractAddress = receiptItemSale.receipt.logs[0].args.it_sale;
        
		const approve = await dai.approve(contractAddress, tokenDaiPrice, { from: admin });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, admin, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, contractAddress, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value.toString(), tokenDaiPrice.toString(), 'logs the transfer amount');

        const allowance = await dai.allowance(admin,contractAddress);
        assert(allowance.toString() == tokenDaiPrice.toString());

        tokenSale721 = await TokenSale721.at(contractAddress);
        const buyToken = await tokenSale721.buyTokens(admin, 1, DAI);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let adminBalance = await dai.balanceOf(admin);
        let adminBalanceAfterBuy = adminTokenBalanceAfter - tokenDaiPrice;
        assert(adminBalance.toString() == adminBalanceAfterBuy.toString());
        
        let contractTokenBalanceBeforeSale = await dai.balanceOf(contractAddress, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenDaiPrice.toString());

        let withDrawFunds = await tokenSale721.withDrawFunds(DAI);
        let serviceFees = withDrawFunds.logs[0].args.fees;
        let feeAddress = withDrawFunds.logs[0].args.feeAddress;
        let feeAddressBalanceUsdt = await dai.balanceOf(feeAddress, {from: admin});
        assert.equal(serviceFees.toString(), feeAddressBalanceUsdt.toString(), 'must be equal');
    });

    it('should buy nft tokens by SNM', async () => {
        let adminTokenBalanceBefore = await snm.balanceOf(admin);

        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await snm.MintERC20(admin, tokensToMint);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, snm.address, 'minted tokens are transferred from');

        let adminTokenBalanceAfter = await snm.balanceOf(admin);

        assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenSnmPriceStr = '10';
        let tokenSnmPrice =  web3.utils.toWei(web3.utils.toBN(tokenSnmPriceStr));

        const receiptItemSale = await factory.createItemSale(tokenSnmPrice, rare, SNM, 4);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(adminTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        const contractAddress = receiptItemSale.receipt.logs[0].args.it_sale;
        
        await snm.approve(contractAddress, 0, { from: admin });

		const approve = await snm.approve(contractAddress, tokenSnmPrice, { from: admin });
        
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, admin, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, contractAddress, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value.toString(), tokenSnmPrice.toString(), 'logs the transfer amount');

        const allowance = await snm.allowance(admin,contractAddress);

        assert(allowance.toString() == tokenSnmPrice.toString());

        tokenSale721 = await TokenSale721.at(contractAddress);
        const buyToken = await tokenSale721.buyTokens(admin, 1, SNM);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let adminBalance = await snm.balanceOf(admin);
        let adminBalanceAfterBuy = adminTokenBalanceAfter - tokenSnmPrice;
        assert(adminBalance.toString() == adminBalanceAfterBuy.toString());
        
        let contractTokenBalanceBeforeSale = await snm.balanceOf(contractAddress, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenSnmPrice.toString());

        let withDrawFunds = await tokenSale721.withDrawFunds(SNM);
        let serviceFees = withDrawFunds.logs[0].args.fees;
        let feeAddress = withDrawFunds.logs[0].args.feeAddress;
        let feeAddressBalanceUsdt = await snm.balanceOf(feeAddress, {from: admin});
        assert.equal(serviceFees.toString(), feeAddressBalanceUsdt.toString(), 'must be equal');
    });

    it('should buy nft tokens by WETH', async () => {
        let adminTokenBalanceBefore = await weth.balanceOf(admin);

        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));

        const receipt = await weth.MintERC20(admin, tokensToMint);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, weth.address, 'minted tokens are transferred from');

        let adminTokenBalanceAfter = await weth.balanceOf(admin);
        assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');

        const tokenWethPriceStr = '10';
        let tokenWethPrice =  web3.utils.toWei(web3.utils.toBN(tokenWethPriceStr));

        const receiptItemSale = await factory.createItemSale(tokenWethPrice, rare, WETH, 5);
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(adminTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        const contractAddress = receiptItemSale.receipt.logs[0].args.it_sale;
        
        await weth.approve(contractAddress, 0, { from: admin });
		const approve = await weth.approve(contractAddress, tokenWethPrice, { from: admin });
        assert.equal(approve.logs.length, 1, 'triggers one event');
		assert.equal(approve.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(approve.logs[0].args.owner, admin, 'logs the account tokens are authorized by');
		assert.equal(approve.logs[0].args.spender, contractAddress, 'logs the account tokens are authorized to');
		assert.equal(approve.logs[0].args.value.toString(), tokenWethPrice.toString(), 'logs the transfer amount');


        const allowance = await weth.allowance(admin,contractAddress);
        assert(allowance.toString() == tokenWethPrice.toString());

        tokenSale721 = await TokenSale721.at(contractAddress);
        const buyToken = await tokenSale721.buyTokens(admin, 1, WETH);
        assert.equal(buyToken.logs.length, 1, 'triggers one event');
		assert.equal(buyToken.logs[0].event, 'TokensPurchased', 'should be the TokensPurchased event');

        let adminBalance = await weth.balanceOf(admin);
        let adminBalanceAfterBuy = adminTokenBalanceAfter - tokenWethPrice;
        
        assert(adminBalance.toString() == adminBalanceAfterBuy.toString());
        
        let contractTokenBalanceBeforeSale = await weth.balanceOf(contractAddress, {from: admin});
        assert(contractTokenBalanceBeforeSale.toString() == tokenWethPrice.toString());

        let withDrawFunds = await tokenSale721.withDrawFunds(WETH, {from: admin});
        let serviceFees = withDrawFunds.logs[0].args.fees;
        let feeAddress = withDrawFunds.logs[0].args.feeAddress;
        let feeAddressBalanceUsdt = await weth.balanceOf(feeAddress, {from: admin});
        assert.equal(serviceFees.toString(), feeAddressBalanceUsdt.toString(), 'must be equal');
    });
});