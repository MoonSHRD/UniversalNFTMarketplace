const CurrenciesERC20 = artifacts.require('CurrenciesERC20');
const IERC20Metadata = artifacts.require("../../../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol");

contract('CurrenciesERC20', () => {
    let curERC20;
    before(async () => {
        curERC20 = await CurrenciesERC20.deployed();
    });

    it('should return currency', async () => {
        for (let i = 0; i < 5; i++) {
            let addr = await curERC20.get_hardcoded_currency(i);
            console.log(addr);
            let name = await IERC20Metadata.at(addr);
            let currTitle = await name.name()
            console.log('currTitle '+ currTitle);
        }
    });
});