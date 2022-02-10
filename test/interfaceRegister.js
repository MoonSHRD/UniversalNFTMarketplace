const InterfaceRegister = artifacts.require('InterfaceRegister');

contract('InterfaceRegister', () => {
    let interfaceReg;
    before(async () =>{
        interfaceReg = await InterfaceRegister.deployed();
    });

    it('should calculate MSNFT interface ID', async () => {
        let getIntId = await interfaceReg.getInterfaceMSNFT();
        assert.equal(getIntId, '0x5d08e584', 'must be equal');
    });

    it('should calculate CurrenciesERC20 interface ID', async () => {
        let getIntId = await interfaceReg.getInterfaceCurrenciesERC20();
        assert.equal(getIntId, '0x033a36bd', 'must be equal');
    });

    it('should calculate MetaMarketplace interface ID', async () => {
        let getIntId = await interfaceReg.getInterfaceMetaMarketplace();
        assert.equal(getIntId, '0x958c8917', 'must be equal');
    });
    
    it('should calculate TokenSaleSingleton interface ID', async () => {
        let getIntId = await interfaceReg.getInterfaceTokenSaleSingleton();
        assert.equal(getIntId, '0xeaf92d7a', 'must be equal');
    });

});