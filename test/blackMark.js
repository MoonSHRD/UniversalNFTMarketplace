const BlackMark = artifacts.require('BlackMark');

contract("BlackMark", async (accounts) => {
    const mainAdmin = accounts[0];
    const adminOne = accounts[1];
    const adminTwo = accounts[2];
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

    it("should create a new admin", async () => {
        let status = await bm.getAdminStatus(adminOne);
        assert.equal(status, false, 'address is not an admin');

        let permissionsReceipt = await bm.changeAdminStatus(adminOne, {from: mainAdmin});
        assert.equal(permissionsReceipt.logs.length, 1, 'triggers one event');
        assert.equal(permissionsReceipt.logs[0].event, 'AdminStatusChanged', 'should be the AdminStatusChanged event');
        assert.equal(adminOne, permissionsReceipt.logs[0].args.admin, 'new admin must be created');

        let newStatus = await bm.getAdminStatus(adminOne);
        assert.equal(newStatus, true, 'address is an admin');
        assert.equal(newStatus, permissionsReceipt.logs[0].args.status, 'must be equal');
    });

    it('should NOT create a new admin', async () => {
        try {
            await bm.changeAdminStatus(adminTwo, {
                from: adminOne
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it("should mint black mark", async () => {
        let bannedOneBalanceBefore = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceBefore, 0, "must be zero value");

        let tokensToMint = web3.utils.toWei(web3.utils.toBN(oneToken));
        let mintMark = await bm.mintMark(bannedOne, {from: adminOne});
        assert.equal(mintMark.logs.length, 1, 'triggers one event');
        assert.equal(mintMark.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(mintMark.logs[0].args.value.toString(), tokensToMint.toString(), 'must be 1 black mark');

        let bannedOneBalanceAfter = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceAfter.toString(), tokensToMint.toString(), "must be equal");
    });

    it('should NOT mint black mark if not an admin', async () => {
        try {
            await bm.mintMark(bannedTwo, {
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

        let burnMark = await bm.burnMark(bannedOne, {from: adminOne});
        assert.equal(burnMark.logs.length, 1, 'triggers one event');
        assert.equal(burnMark.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(burnMark.logs[0].args.value.toString(), tokensToBurn.toString(), 'must be remove 1 black mark');

        let bannedOneBalanceAfter = await bm.balanceOf(bannedOne);
        assert.equal(bannedOneBalanceAfter, 0, "must be equal");
    });

    it('should NOT mint black mark if not an admin', async () => {
        try {
            await bm.burnMark(bannedTwo, {
                from: mainAdmin
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it("should remove admin", async () => {
        let status = await bm.getAdminStatus(adminOne);
        assert.equal(status, true, 'address is an admin');

        let permissionsReceipt = await bm.changeAdminStatus(adminOne, {from: mainAdmin});
        assert.equal(permissionsReceipt.logs.length, 1, 'triggers one event');
        assert.equal(permissionsReceipt.logs[0].event, 'AdminStatusChanged', 'should be the AdminStatusChanged event');
        assert.equal(adminOne, permissionsReceipt.logs[0].args.admin, 'admin must be removed');

        let newStatus = await bm.getAdminStatus(adminOne);
        assert.equal(newStatus, false, 'address is not an admin');
        assert.equal(newStatus, permissionsReceipt.logs[0].args.status, 'must be equal');
    });

    it('should NOT remove an admin', async () => {
        try {
            await bm.changeAdminStatus(adminTwo, {
                from: adminOne
            });
        } catch (e) {
            assert(e.message, 'error message must contain revert');
        }
    });
});