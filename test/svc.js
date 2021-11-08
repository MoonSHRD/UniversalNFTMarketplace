const SVC = artifacts.require('SVC');

contract('SVC', accounts => {
    let vc;
    const user = accounts[1];
    before(async () => {
        vc = await SVC.deployed();
    });

    it('should return version count by name', async () => {
        const versionOne = await vc.NewMigration.call('v0.0.1');
        const receiptone = await vc.NewMigration('v0.0.1');
        assert.equal(receiptone.logs[0].event, 'NewMigrationHuman', 'should be the NewMigrationHuman event');
        assert.equal(receiptone.logs[0].args.id.toNumber(), 1, 'should be the first version');
        assert.equal(receiptone.logs[0].args.name, 'v0.0.1', 'should be the first version');
        assert.equal(versionOne.toNumber(), 1, 'new version added successfully');

        const receiptContractOne = await vc.SetNewContractAddress('v0.0.1', 'VersionControl', '0x752ff9Aa088E1451F274b1EcFde610BCcF14Fb16');
        assert.equal(receiptContractOne.logs[0].event, 'SetNewContractAddressHuman', 'should be the SetNewContractAddressHuman event');
        assert.equal(receiptContractOne.logs[0].args.version, 'v0.0.1', 'should be the first version');
        assert.equal(receiptContractOne.logs[0].args.contractName, 'VersionControl', 'should be the VersionControl contract name');
        assert.equal(receiptContractOne.logs[0].args.contractAddress, '0x752ff9Aa088E1451F274b1EcFde610BCcF14Fb16', 'should be the VersionControl contract address');

        const contractAddressOne = await vc.GetContractAddress(1, 'VersionControl');
        assert.equal(contractAddressOne, '0x752ff9Aa088E1451F274b1EcFde610BCcF14Fb16', 'should be the VersionControl contract address');

        const receiptContractTwo = await vc.SetNewContractAddress('v0.0.1', 'ShitControl', '0x635D1cA313078003EBf359D336b4cFEE21e8cbF1');
        assert.equal(receiptContractTwo.logs[0].event, 'SetNewContractAddressHuman', 'should be the SetNewContractAddressHuman event');
        assert.equal(receiptContractTwo.logs[0].args.version, 'v0.0.1', 'should be the first version');
        assert.equal(receiptContractTwo.logs[0].args.contractName, 'ShitControl', 'should be the ShitControl contract name');
        assert.equal(receiptContractTwo.logs[0].args.contractAddress, '0x635D1cA313078003EBf359D336b4cFEE21e8cbF1', 'should be the ShitControl contract address');

        const contractAddressTwo = await vc.GetContractAddress(1, 'ShitControl');
        assert.equal(contractAddressTwo, '0x635D1cA313078003EBf359D336b4cFEE21e8cbF1', 'should be the ShitControl contract address');

        const versionTwo = await vc.NewMigration.call('v0.0.2');
        const receipttwo = await vc.NewMigration('v0.0.2');
        assert.equal(receipttwo.logs[0].event, 'NewMigrationHuman', 'should be the NewMigrationHuman event');
        assert.equal(receipttwo.logs[0].args.id.toNumber(), 2, 'should be the second version');
        assert.equal(receipttwo.logs[0].args.name, 'v0.0.2', 'should be the second version');
        assert.equal(versionTwo.toNumber(), 2, 'new version added successfully');

        const receiptContractThree = await vc.SetNewContractAddress('v0.0.2', 'MemControl', '0xA4899c39481bFB56111475747B32eBAba9832780');
        assert.equal(receiptContractThree.logs[0].event, 'SetNewContractAddressHuman', 'should be the SetNewContractAddressHuman event');
        assert.equal(receiptContractThree.logs[0].args.version, 'v0.0.2', 'should be the second version');
        assert.equal(receiptContractThree.logs[0].args.contractName, 'MemControl', 'should be the MemControl contract name');
        assert.equal(receiptContractThree.logs[0].args.contractAddress, '0xA4899c39481bFB56111475747B32eBAba9832780', 'should be the MemControl contract address');

        const contractAddressThree = await vc.GetContractAddress(2, 'MemControl');
        assert.equal(contractAddressThree, '0xA4899c39481bFB56111475747B32eBAba9832780', 'should be the MemControl contract address');

        const receiptContractFour = await vc.SetNewContractAddress('v0.0.2', 'GagControl', '0x6a91dA642656fEDD19c26a63C39c152138610328');
        assert.equal(receiptContractFour.logs[0].event, 'SetNewContractAddressHuman', 'should be the SetNewContractAddressHuman event');
        assert.equal(receiptContractFour.logs[0].args.version, 'v0.0.2', 'should be the second version');
        assert.equal(receiptContractFour.logs[0].args.contractName, 'GagControl', 'should be the GagControl contract name');
        assert.equal(receiptContractFour.logs[0].args.contractAddress, '0x6a91dA642656fEDD19c26a63C39c152138610328', 'should be the GagControl contract address');

        const contractAddressFour = await vc.GetContractAddress(2, 'GagControl');
        assert.equal(contractAddressFour, '0x6a91dA642656fEDD19c26a63C39c152138610328', 'should be the GagControl contract address');

    });

    it('should get current version contract address', async () => {
        const cAddressOne = await vc.GetCurrentVersionContractAddress('MemControl');
        assert.equal(cAddressOne, '0xA4899c39481bFB56111475747B32eBAba9832780', 'must be the correct address of contract');
        const cAddressTwo = await vc.GetCurrentVersionContractAddress('GagControl');
        assert.equal(cAddressTwo, '0x6a91dA642656fEDD19c26a63C39c152138610328', 'must be the correct address of contract');
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

    it('should get version name by ID', async () => {
        const versionOne = await vc.GetVersionNameByID(1);
        assert.equal(versionOne, 'v0.0.1', 'must be the first version');
        const versionTwo = await vc.GetVersionNameByID(2);
        assert.equal(versionTwo, 'v0.0.2', 'must be the second version');
    });

    it('should NOT get version name by ID being user', async () => {
        try {
            await vc.GetVersionNameByID(1, {from: user});
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should get contract address', async () => {
        const contractAddressOne = await vc.GetContractAddress(1, 'ShitControl');
        assert.equal(contractAddressOne, '0x635D1cA313078003EBf359D336b4cFEE21e8cbF1', 'must be the correct address of contract');
        const contractAddressTwo = await vc.GetContractAddress(2, 'GagControl');
        assert.equal(contractAddressTwo, '0x6a91dA642656fEDD19c26a63C39c152138610328', 'must be the correct address of contract');
    });

    it('should NOT get contract address being user', async () => {
        try {
            await vc.GetContractAddress(1, 'ShitControl', {from: user});
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT get contract address with empty name', async () => {
        try {
            await vc.GetContractAddress(1, '');
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT get current version contract address with empty name', async () => {
        try {
            await vc.GetCurrentVersionContractAddress('');
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });

    it('should NOT get current version contract address being user', async () => {
        try {
            await vc.GetCurrentVersionContractAddress('MemControl', {from: user});
        } catch(e) {
            assert(e.message, 'error message must contain revert');
        }
    });
    
});