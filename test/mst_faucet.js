const MST = artifacts.require('MST');

contract('MST', accounts => {
    let token, network;
    let eth = '10';
    const admin = accounts[0];
    const user = accounts[1];
    before(async () => {
        token = await MST.deployed();
        network = process.env.NETWORK;
    });

    it('should deploy smart contract', async () => {
        if (network == 'development' || network == 'ganache') {
            assert(token.address != '');
        }
    });

    it('should be possible to mint for user', async () => {
        let userTokenBalanceBefore = await token.balanceOf(user);
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(eth));
        assert.equal(userTokenBalanceBefore, 0, 'current user token balance');
        const receipt = await token.MintERC20(user, tokensToMint, { from: user });
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, token.address, 'minted tokens are transferred from');
        let userTokenBalanceAfter = await token.balanceOf(user);
        assert.equal(userTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');
    });
});