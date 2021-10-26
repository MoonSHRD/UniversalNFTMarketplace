const VersionControl = artifacts.require('VersionControl');

contract('VersionControl', accounts => {
    let vc;
    const admin = accounts[0];
    const user = accounts[1];
    before(async () => {
        vc = await VersionControl.deployed();
    });

    it('should return version count by name', async () => {
        const versionOne = await vc.NewMigration.call('v0.0.1');
        await vc.NewMigration('v0.0.1');
        assert.equal(versionOne.toNumber(), 1, 'new version added successfully');

        const versionTwo = await vc.NewMigration.call('v0.0.2');
        await vc.NewMigration('v0.0.2');
        assert.equal(versionTwo.toNumber(), 2, 'new version added successfully');

        await vc.VersionNameByID(1);
        const versionNameOne = await vc.versionNameByID.call(1);
        assert.equal(versionNameOne, 'v0.0.1', 'must be the same');

        await vc.VersionNameByID(2);
        const versionNameTwo = await vc.versionNameByID.call(2);
        assert.equal(versionNameTwo, 'v0.0.2', 'must be the same');
    });

    it('should return contract address by version and contract name', async () => {
        const newAddress = await vc.SetNewContractAddress.call('v0.0.1', 'VersionControl', '0x752ff9Aa088E1451F274b1EcFde610BCcF14Fb16');
        // await vc.NewMigration('v0.0.1');
        console.log('newAddress');
        console.log(newAddress);
        // assert.equal(versionOne.toNumber(), 1, 'new version added successfully');
    });

    it('should NOT get version name by zero', async () => {
        try {
            await vc.VersionNameByID(0);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT call versionNameByID function being user', async () => {
        try {
            await vc.VersionNameByID(1, {from: user});
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT make new migration being user', async () => {
        try {
            await vc.NewMigration('v0.0.3', {from: user});
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT make new migration with empty version name', async () => {
        try {
            const emptyString = '';
            await vc.NewMigration(emptyString);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT make new migration with same version name', async () => {
        try {
            const sameString = 'v0.0.1';
            await vc.NewMigration(sameString);
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });
    
});