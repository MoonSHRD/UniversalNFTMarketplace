const Judge = artifacts.require('Judge');
const MasterFactory721 = artifacts.require('MasterFactory721');
const MSNFT = artifacts.require('MSNFT');
const CurrenciesERC20 = artifacts.require('CurrenciesERC20');
const MetaMarketplace = artifacts.require('MetaMarketplace');

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
    let judge, factory, msnftAddress, msnft, currenciesERC20, metaMarketplace;
    let linkOne;
    const unlimit = 0;
    const desc = 'Lorem ipsum dolor sit amet';

    before(async () => {
        metaMarketplace = await MetaMarketplace.deployed();
        judge = await Judge.deployed();
        factory = await MasterFactory721.deployed();
        currenciesERC20 = await CurrenciesERC20.deployed();
        linkOne = 'https://github.com/MoonSHRD/UniversalNFTMarketplace/blob/feature/license/LICENSE';
        msnftAddress = await factory.master_template.call();
        msnft = await MSNFT.at(msnftAddress);
        await judge.setLicensemasterid(0, {from: admin});
    });

    it("should deploy contracts", async () => {
        assert(judge.address != '');
        assert(factory.address != '');
        assert(currenciesERC20.address != '');
        assert(metaMarketplace.address != '');
        assert(msnft.address != '');
    });

    it('Should mint license nft', async () => {
        const createItemOne = await factory.createMasterItem(linkOne, desc, unlimit);
        assert.equal(createItemOne.receipt.logs.length, 1, 'triggers two events');
        assert.equal(createItemOne.receipt.logs[0].event, 'CreateMasterItem', 'should be the CreateMasterItem event');
        midUnlimitOne = createItemOne.receipt.logs[0].args.master_id;
        const firstLink = createItemOne.receipt.logs[0].args.link;
        assert(firstLink == linkOne);

        await msnft.EmitItem(admin, midUnlimitOne, 0, {from: admin});
    });

    it("check metaMarketplace", async () => {
        let receipt = await judge.check(metaMarketplace.address, msnftAddress, {from: admin});
        assert.equal(admin, receipt.logs[0].args.licenseKeeper, "must be admin");
    });

    it("check msnft", async () => {
        let receipt = await judge.check(msnft.address, msnftAddress, {from: admin});
        assert.equal(admin, receipt.logs[0].args.licenseKeeper, "must be admin");
    });

    it("check currenciesERC20 and mint BlackMark", async () => {
        await judge.setLicensemasterid(1, {from: admin});
        let receipt = await judge.check(currenciesERC20.address, msnftAddress, {from: admin});
        assert.equal(admin, receipt.logs[1].args.blockedLicenseKeeper, "must be equal");
    });

    it("Should NOT check currenciesERC20", async () => {
        try {
            await judge.check(currenciesERC20.address, msnftAddress, {from: user});
        } catch (e) {
            assert(e.message, 'Ownable: caller is not the owner');
        }
    });
});