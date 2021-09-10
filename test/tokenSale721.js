const TokenSale721 = artifacts.require('TokenSale721');

contract('TokenSale721', accounts => {
    before(async () => {
        tokenSale = await TokenSale721.deployed();
    });

    it('should deploy', async () => {
        assert(tokenSale.address != '');
    });
});