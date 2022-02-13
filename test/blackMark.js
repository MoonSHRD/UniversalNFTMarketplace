const BlackMark = artifacts.require('BlackMark');

contract("BlackMark", async (accounts) => {
    const mainAdmin = accounts[0];
    const blackAdminOne = accounts[1];
    const blackAdminTwo = accounts[2];
    const bannedOne = accounts[3];
    const bannedTwo = accounts[4];
    let bm;
    const oneToken = 1;
    before(async () => {
        bm = await BlackMark.deployed();
    });

    it("bm was deployed", async () => {
        assert(bm.address != '');
    });

    it("should create a new black admin", async () => {
        let status = await bm.getBlackAdminStatus(blackAdminOne);
        assert.equal(status, false, 'address is not a black admin');

        let permissionsReceipt = await bm.changeBlackAdminStatus(blackAdminOne, {from: mainAdmin});
        assert.equal(permissionsReceipt.logs.length, 1, 'triggers one event');
        assert.equal(permissionsReceipt.logs[0].event, 'BlackAdminStatusChanged', 'should be the BlackAdminStatusChanged event');
        assert.equal(blackAdminOne, permissionsReceipt.logs[0].args.blackAdmin, 'new admin must be created');

        let newStatus = await bm.getBlackAdminStatus(blackAdminOne);
        assert.equal(newStatus, true, 'address is a black admin');
        assert.equal(newStatus, permissionsReceipt.logs[0].args.status, 'must be equal');
    });

    it('should NOT create a new black admin', async () => {
        try {
            await bm.changeBlackAdminStatus(blackAdminTwo, {
                from: blackAdminOne
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it("should mint black mark", async () => {
        let bannedOneBalanceBefore = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceBefore, 0, "must be zero value");

        let tokensToMint = web3.utils.toWei(web3.utils.toBN(oneToken));
        let mintMark = await bm.mintMark(blackAdminOne,bannedOne);
        assert.equal(mintMark.logs.length, 1, 'triggers one event');
        assert.equal(mintMark.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintMark.logs[0].args.value.toString(), tokensToMint.toString(), 'must be 1 black mark');

        let bannedOneBalanceAfter = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceAfter.toString(), tokensToMint.toString(), "must be equal");
    });

    it('should NOT mint black mark if not a black admin', async () => {
        try {
            await bm.mintMark(blackAdminTwo, bannedTwo, {
                from: mainAdmin
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it("should burn black mark", async () => {
        let tokensToBurn = web3.utils.toWei(web3.utils.toBN(oneToken));
        let bannedOneBalanceBefore = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceBefore.toString(), tokensToBurn.toString(), "must be one token");

        let burnMark = await bm.burnMark(blackAdminOne,bannedOne);
        assert.equal(burnMark.logs.length, 1, 'triggers one event');
        assert.equal(burnMark.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(burnMark.logs[0].args.value.toString(), tokensToBurn.toString(), 'must be remove 1 black mark');

        let bannedOneBalanceAfter = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceAfter, 0, "must be equal");
    });

    it('should NOT mint black mark if not a black admin', async () => {
        try {
            await bm.burnMark(blackAdminTwo, bannedTwo, {
                from: mainAdmin
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it("should remove new black admin", async () => {
        let status = await bm.getBlackAdminStatus(blackAdminOne);
        assert.equal(status, true, 'address is a black admin');

        let permissionsReceipt = await bm.changeBlackAdminStatus(blackAdminOne, {from: mainAdmin});
        assert.equal(permissionsReceipt.logs.length, 1, 'triggers one event');
        assert.equal(permissionsReceipt.logs[0].event, 'BlackAdminStatusChanged', 'should be the BlackAdminStatusChanged event');
        assert.equal(blackAdminOne, permissionsReceipt.logs[0].args.blackAdmin, 'admin must be removed');

        let newStatus = await bm.getBlackAdminStatus(blackAdminOne);
        assert.equal(newStatus, false, 'address is not a black admin');
        assert.equal(newStatus, permissionsReceipt.logs[0].args.status, 'must be equal');
    });

    it('should NOT remove black admin', async () => {
        try {
            await bm.changeBlackAdminStatus(blackAdminTwo, {
                from: blackAdminOne
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });
});