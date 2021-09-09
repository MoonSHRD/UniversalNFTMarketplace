const MasterFactory721 = artifacts.require('MasterFactory721');

contract('MasterFactory721', accounts => {
    let token;
    const admin = accounts[0];
    const link = 'https://ipfs.io/ipfs/Qmegp2nGgFDqtgi2Y2BgYVExBxycx2FL69eBvgWZoBgQjH?filename=image.jpg';
    const desc = 'Lorem ipsum dolor sit amet';
    const [unlimit, rare, spec] = [0, 1, 2];

    before(async () => {
        token = await MasterFactory721.deployed();
    });

    it('should create master copy with no limit supply type', async () => {

        // const master_template = await token.master_template;
        const master_template_address = await token.getMasterTemplateAddress();
        const master_id = await token.createMasterItem(link, desc, unlimit);
        // console.log('master_id '+ Object.keys(master_id));
        console.log('master_id '+ master_id.receipt.logs.length);
    });

    // it('should NOT create master copy with no limit supply type', async () => {

    // });

    // it('should create master copy with unique supply type', async () => {

    // });

    // it('should NOT create master copy with unique supply type', async () => {

    // });

    // it('should create master copy with specific supply type', async () => {

    // });

    // it('should NOT create master copy with specific supply type', async () => {

    // });
});