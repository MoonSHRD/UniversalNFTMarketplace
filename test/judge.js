const Judge = artifacts.require('Judge');
const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');

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

contract("Judge", async (accounts) => {
    const admin = accounts[0];
    const user = accounts[1];
    let judge, factory, msnftAddress, msnft;
    let linkOne;
    const unlimit = 0;
    const desc = 'Lorem ipsum dolor sit amet';

    before(async () => {
        judge = await Judge.deployed();
        factory = await MasterFactory721.deployed();
        linkOne = 'https://google.com/' + makeRandomLink(11);
    });

    it("should deploy contracts", async () => {
        assert(judge.address != '');
        // assert(factory.address != '');
        msnftAddress = await factory.master_template.call();
        msnft = await MSNFT.at(msnftAddress);
        console.log(msnft);
    });

    it('should create master copy with no limit supply type', async () => {
        const createItemOne = await factory.createMasterItem(linkOne, desc, unlimit);
        assert.equal(createItemOne.receipt.logs.length, 1, 'triggers two events');
        assert.equal(createItemOne.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        midUnlimit = createItemOne.receipt.logs[0].args.master_id;
        const firstLink = createItemOne.receipt.logs[0].args.link;
        assert(firstLink == linkOne);

        let emit = await msnft.EmitItem(user, midUnlimit, 0, {from: admin});

        console.log(emit);


        // let balance = await nft.balanceOf(user);
        let owner = await msnft.ownerOf(midUnlimit);
        assert.equal(owner, user, 'must be equal');
        // console.log(balance.toString());

        // let author_masterids = await nft.authors.call(midUnlimit);

        // console.log(author_masterids);

    });

    it("check", async () => {
        let receipt = await judge.check(admin, msnftAddress, {from: admin});
        console.log(receipt.logs[0].args.mid.toString());
    });
});