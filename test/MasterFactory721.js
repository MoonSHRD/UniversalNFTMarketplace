const MasterFactory721 = artifacts.require('MasterFactory721');

contract('MasterFactory721', accounts => {
    let factory;
    let unlimitLinksArr = [];
    let uniqueLinksArr = [];
    let rareLinksArr = [];
    const admin = accounts[0];
    const user = accounts[1];
    const linkOne = 'https://ipfs.io/ipfs/Qmegp2nGgFDqtgi2Y2BgYVExBxycx2FL69eBvgWZoBgQjH?filename=image.jpg';
    const linkTwo = 'https://ipfs.io/ipfs/QmdFCbi5zVjWUMkkzFMjmaC82mkgPiXsydVfwzeuRqoS4b?filename=skald-500.jpg';
    const linkThree = 'https://ipfs.io/ipfs/QmWiag3rUdnqNJwop7perc1RHZ6Ua4SPCxeWt9HruTeDxM?filename=nft.json';
    const linkFour = 'https://ipfs.io/ipfs/QmSoB6yijd5dEfBPHXosfJXn9YbcJ7G6wHzH8fcbwzhkeX?filename=photo_2021-01-18_00-49-32.jpg';
    const linkFive = 'https://ipfs.io/ipfs/QmU6FgbzFwGuVffhQJFCTW79jGD8i36VDeYdTd9g7ASZGb?filename=complete_map.jpg';
    const desc = 'Lorem ipsum dolor sit amet';
    const [unlimit, unique, rare] = [0, 1, 2];

    before(async () => {
        factory = await MasterFactory721.deployed();
    });

    it('should create master copy with no limit supply type', async () => {
        const receiptOne = await factory.createMasterItem(linkOne, desc, unlimit);
        assert.equal(receiptOne.receipt.logs.length, 1, 'triggers one event');
		assert.equal(receiptOne.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        assert.equal(receiptOne.receipt.logs[0].args.link, linkOne, 'master copy creation link');
        const firstLink = receiptOne.receipt.logs[0].args.link;
        assert(firstLink == linkOne);
        const receiptTwo = await factory.createMasterItem(linkTwo, desc, unlimit);
        assert.equal(receiptTwo.receipt.logs.length, 1, 'triggers one event');
		assert.equal(receiptTwo.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        assert.equal(receiptTwo.receipt.logs[0].args.link, linkTwo, 'master copy creation link');
        const secondLink = receiptTwo.receipt.logs[0].args.link;
        assert(secondLink == linkTwo);
        assert(firstLink != secondLink);
        for (let index = 0; index < 2; index++) {
            let creatorLink = await factory.getCreatorLinks(admin, index);
            unlimitLinksArr.push(creatorLink);
        }
        assert.equal(unlimitLinksArr.length, 2, 'count of unlimit master copy creations');
    });

    // it('should NOT create master copy with no limit supply type', async () => {
        
    // });

    it('should create master copy with unique supply type', async () => {
        const receiptUnique = await factory.createMasterItem(linkThree, desc, unique);
        assert.equal(receiptUnique.receipt.logs.length, 1, 'triggers one event');
		assert.equal(receiptUnique.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        assert.equal(receiptUnique.receipt.logs[0].args.link, linkThree, 'master copy creation link');
        const uniqueLink = receiptUnique.receipt.logs[0].args.link;
        assert(uniqueLink == linkThree);
        uniqueLinksArr.push(uniqueLink);
        assert(uniqueLinksArr.length == unique);
    });

    // it('should NOT create master copy with unique supply type', async () => {

    // });

    it('should create master copy with rare supply type', async () => {
        const receiptRareOne = await factory.createMasterItem(linkFour, desc, rare);
        assert.equal(receiptRareOne.receipt.logs.length, 1, 'triggers one event');
		assert.equal(receiptRareOne.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        assert.equal(receiptRareOne.receipt.logs[0].args.link, linkFour, 'master copy creation link');
        const firstRareLink = receiptRareOne.receipt.logs[0].args.link;
        assert(firstRareLink == linkFour);
        const receiptRareTwo = await factory.createMasterItem(linkFive, desc, rare);
        assert.equal(receiptRareTwo.receipt.logs.length, 1, 'triggers one event');
		assert.equal(receiptRareTwo.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        assert.equal(receiptRareTwo.receipt.logs[0].args.link, linkFive, 'master copy creation link');
        const secondRareLink = receiptRareTwo.receipt.logs[0].args.link;
        assert(secondRareLink == linkFive);
        assert(firstRareLink != secondRareLink);
        for (let index = 0; index < rare; index++) {
            let creatorLink = await factory.getCreatorLinks(admin, index);
            rareLinksArr.push(creatorLink);
        }
        assert.equal(rareLinksArr.length, rare, 'count of rare master copy creations');
    });

    // it('should NOT create master copy with rare supply type', async () => {

    // });
});