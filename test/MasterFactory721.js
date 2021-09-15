const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const USDTcontract = artifacts.require('TestUSDT');
const USDCcontract = artifacts.require('USDC');
const DAIcontract = artifacts.require('DAI');
const SNMcontract = artifacts.require('SNM');
const WETHcontract = artifacts.require('WETH');
const TokenSale721 = artifacts.require('TokenSale721');

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
    const [unlimit, unique, rare] = [0, 1, 2];

    before(async () => {
        factory = await MasterFactory721.deployed();
        nft = await MSNFT.deployed();
        usdt = await USDTcontract.deployed();
        usdc = await USDCcontract.deployed();
        dai = await DAIcontract.deployed();
        snm = await SNMcontract.deployed();
        weth = await WETHcontract.deployed();
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
        assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
		assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
		assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        assert(userTokenBalanceAfter >= receiptItemSale.receipt.logs[0].args.price);

        const contractAddress = receiptItemSale.receipt.logs[0].address;
        tokenSale721 = await TokenSale721.at(contractAddress);
        const buyToken = await tokenSale721.buyTokens(user, 1, USDT);
        
        console.log('buyToken '+ Object.keys(buyToken));
        
    });

    // it('should buy nft tokens by USDC', async () => {
    //     let adminTokenBalanceBefore = await usdc.balanceOf(admin);
    //     assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
    //     let tokensToMint = web3.utils.toWei(web3.utils.toBN(tokensTotal));
    //     const receipt = await usdc.MintERC20(admin, tokensToMint);
    //     assert.equal(receipt.logs.length, 1, 'triggers one event');
	// 	assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
    //     assert.equal(receipt.logs[0].address, usdc.address, 'minted tokens are transferred from');

    //     let adminTokenBalanceAfter = await usdc.balanceOf(admin);
    //     assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');
    //     const tokenUsdcPriceStr = '10';
    //     let tokenUsdcPrice =  web3.utils.toWei(web3.utils.toBN(tokenUsdcPriceStr));
    //     const receiptItemSale = await factory.createItemSale(tokenUsdcPrice, unlimit, USDC, 2);
    //     assert.equal(receiptItemSale.receipt.logs.length, 2, 'triggers two events');
	// 	assert.equal(receiptItemSale.receipt.logs[0].event, 'SaleCreated', 'should be the SaleCreated event');
	// 	assert.equal(receiptItemSale.receipt.logs[1].event, 'SaleCreatedHuman', 'should be the SaleCreatedHuman event');
        
    //     // // tokenSale721 = await MasterFactory721.at(address);
    //     // console.log('tokenSale721  '+ Object.keys(receiptItemSale.receipt.logs[0]));
    // });
});