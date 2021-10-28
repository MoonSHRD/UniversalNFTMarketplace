const MST = artifacts.require('MST');

contract('MST', accounts => {
    let token;
    let eth = '10';
    const admin = accounts[0];
    const user = accounts[1];
    before(async () => {
        token = await MST.deployed();
    });

    it('should deploy smart contract', async () => {
        assert(token.address != '');
    });

    it('should mint if admin have enough balance', async () => {
        let adminTokenBalanceBefore = await token.balanceOf(admin);
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(eth));
        assert.equal(adminTokenBalanceBefore, 0, 'current admins token balance');
        const receipt = await token.MintERC20(admin, tokensToMint);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].address, token.address, 'minted tokens are transferred from');
        let adminTokenBalanceAfter = await token.balanceOf(admin);
        assert.equal(adminTokenBalanceAfter.toString(), tokensToMint.toString(), 'admins token balance after mint');
    });

    it('should revert mint function', async () => {   
        let tokensToMint = web3.utils.toWei(web3.utils.toBN(eth));
        try {
            await token.MintERC20(user, tokensToMint, {from: user});
        } catch(e) {
            assert(e.message, 'error message must contain revert Ownable');
        }
    });
});