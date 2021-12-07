//var KNS = artifacts.require("./KNS.sol");
var MasterFactory = artifacts.require("./721/singleton/MasterFactory721.sol");
// //var Deposit = artifacts.require("./Deposit.sol")
var Master = artifacts.require("./721/singleton/MSNFT.sol");
// var limitGas = web3.eth.getBlock("latest").gasLimit;
var SVC = artifacts.require("./SVC.sol");
var NFTTemplate = artifacts.require("./721/singleton/NftTemplate.sol");

var InterfaceR = artifacts.require("./721/singleton/InterfaceRegister.sol");
var MetaMarket = artifacts.require("./721/singleton/MetaMarketplace.sol");

// CurrencyERC20 contract
var Currencies = artifacts.require("./721/singleton/CurrenciesERC20.sol");

// // Test dummy erc20 tokens
var USDT = artifacts.require("./test_erc20_tokens/TestUSDT.sol");
var USDC = artifacts.require("./test_erc20_tokens/USDC.sol");
var DAI = artifacts.require("./test_erc20_tokens/DAI.sol");
var WETH = artifacts.require("./test_erc20_tokens/WETH.sol");
var MST = artifacts.require("./test_erc20_tokens/MST.sol");

//  Ropsten addresses
var usdt_address = web3.utils.toChecksumAddress('0x6ee856ae55b6e1a249f04cd3b947141bc146273c');
var usdc_address = web3.utils.toChecksumAddress('0xfe724a829fdf12f7012365db98730eee33742ea2');
var dai_address = web3.utils.toChecksumAddress('0xad6d458402f60fd3bd25163575031acdce07538d');
var weth_address = web3.utils.toChecksumAddress('0xc778417e063141139fce010982780140aa0cd5ab');

var deposit_value = '50000';  // deposit INITIAL exchange market cup (turn capital)
var deposit_value_wei = web3.utils.toWei(deposit_value,'ether');

var custom_gas_price = '9'; // for ropsten
var wei_gas_price = web3.utils.toWei(custom_gas_price, 'gwei');
//var string_gas_price = wei_gas_price.toString;

module.exports = function (deployer, network, accounts) {
  process.env.NETWORK = deployer.network;
  if (network == "ropsten") {
    console.log(accounts);
    console.log(wei_gas_price);

    console.log("block gas price:");
    var limitGas = web3.eth.getBlock("latest").gasLimit;
    console.log(limitGas);
    // console.log(string_gas_price);

    deployer.then(async () => {
      /*
      await deployer.deploy(USDT,"USDT","USDT");
      await deployer.deploy(USDC,"USDC","USDC");
      USDC = await USDC.deployed();
      await deployer.deploy(DAI,"DAI","DAI");
      DAI = await DAI.deployed();
      await deployer.deploy(WETH,"WETH","WETH");
      WETH = await WETH.deployed();
      */
      await deployer.deploy(MST, "SONM", "MST");
      MST = await MST.deployed();
      console.log("MST dummy address:");
      console.log(MST.address);
      //...
    }).then(function () {
      console.log("usdt address:");
      console.log(usdt_address);
      console.log("weth address:");
      console.log(weth_address);
      return deployer.deploy(Currencies, usdt_address, usdc_address, dai_address, weth_address, MST.address, {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });

    }).then(function () {
      return deployer.deploy(Master, "MoonShardNFT", "MSNFT", {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });
    }).then(function () {
      console.log("Master token address:");
      console.log(Master.address);
      return deployer.deploy(MasterFactory, Master.address, accounts[0], Currencies.address, {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });

    }).then(async () => {
      console.log("MasterFactory address:");
      console.log(MasterFactory.address);
      MasterInstance = await Master.deployed();
      MasterFactoryInstance = await MasterFactory.deployed();
      await MasterInstance.updateFactoryAdress(MasterFactoryInstance.address);
      fa = await MasterInstance.getFactoryAddress();
      console.log("factory address");
      console.log(fa);
      return;
    }).then(async () => {
      return;
    });

  } // end of ropsten deployment




  if (network == "development") {
    console.log(accounts);
    console.log(wei_gas_price);

    console.log("block gas price:");
    var limitGasDev = web3.eth.getBlock("latest").gasLimit;
    console.log(limitGasDev);
    // console.log(string_gas_price);

    deployer.then(async () => {
      await deployer.deploy(NFTTemplate, "NFT template", "NTMP");
      await deployer.deploy(SVC, "v0.0.0");
      await deployer.deploy(USDT, "USDT", "USDT");
      await deployer.deploy(USDC, "USDC", "USDC");
      USDC = await USDC.deployed();
      await deployer.deploy(DAI, "DAI", "DAI");
      DAI = await DAI.deployed();
      await deployer.deploy(WETH, "WETH", "WETH");
      WETH = await WETH.deployed();

      await deployer.deploy(MST, "SONM", "MST");
      MST = await MST.deployed();
      //...
    }).then(function () {

      return deployer.deploy(Currencies, USDT.address, USDC.address, DAI.address, WETH.address, MST.address, {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });

    }).then(function () {
      return deployer.deploy(Master, "MoonShardNFT", "MSNFT", {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });

    }).then(function () {
      console.log("Master token address:");
      console.log(Master.address);
      return deployer.deploy(MasterFactory, Master.address, accounts[1], Currencies.address, {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });

    }).then(async () => {
      console.log("MasterFactory address:");
      console.log(MasterFactory.address);
      MasterInstance = await Master.deployed();
      MasterFactoryInstance = await MasterFactory.deployed();
      await MasterInstance.updateFactoryAdress(MasterFactoryInstance.address);
      fa = await MasterInstance.getFactoryAddress();
      console.log("factory address");
      console.log(fa);
      return;
    }).then(async () => {

      return deployer.deploy(InterfaceR, {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });
    }).then(async () => {
      InterfaceInstance = await InterfaceR.deployed();
      intId = await InterfaceInstance.getInterfaceEnumerable();
      console.log("Interface Id for ERC721Enumerable: ");
      console.log(intId);
      intID_calc = await InterfaceInstance.calculateIERC721Enumarable();
      console.log("Interface If for ERC721Enumerable calculated:");
      console.log(intID_calc);
      return;
    }).then(async () => {

      return deployer.deploy(MetaMarket, Currencies.address, Master.address, accounts[1], {
        gasPrice: wei_gas_price,
        from: accounts[0]
      });
    }).then(async () => {
      MetaMarketInstance = await MetaMarket.deployed();
      console.log("MetaMarket address:");
      console.log(MetaMarketInstance.address);
    });

  } // end of development network migration


};