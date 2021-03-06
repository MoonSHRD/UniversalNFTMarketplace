const TestUSDT = artifacts.require('TestUSDT');

contract('TestUSDT', accounts => {
    let token, network;
    let eth = '10';
    const admin = accounts[0];
    const user = accounts[1];
    before(async () => {
        token = await TestUSDT.deployed();
        network = process.env.NETWORK;
    });

    it('should deploy smart contract', async () => {
        if (network == 'development' || network == 'ganache') {
            assert(token.address != '');
        }
    });

    it('should mint if admin have enough balance', async () => {
        let adminTokenBalanceBefore = await token.balanceOf(admin);
        let tokensToMint = web3.utils.toBN(eth);
        let tokensToDegree = tokensToMint * 1e6;
        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        const receipt = await token.MintERC20(admin, tokensToDegree);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, token.address, 'minted tokens are transferred from');
        let adminTokenBalanceAfter = await token.balanceOf(admin);
        assert.equal(adminTokenBalanceAfter, tokensToDegree, 'admins token balance after mint');
    });

    it('should revert mint function', async () => {
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(eth));
        try {
            await token.MintERC20(user, tokensToMint, {
                from: user
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert Ownable');
        }
    });
});