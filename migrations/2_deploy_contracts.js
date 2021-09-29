//var SuperFactory = artifacts.require("./SuperFactory.sol");
//var KNS = artifacts.require("./KNS.sol");
// var MasterFactory = artifacts.require("./721/singleton/MasterFactory721.sol");
// //var Deposit = artifacts.require("./Deposit.sol")
// var Master = artifacts.require("./721/singleton/MSNFT.sol");
// var accounts = web3.eth.getAccounts();
// var limitGas = web3.eth.getBlock("latest").gasLimit;


// // CurrencyERC20 contract
// var Currencies = artifacts.require("./721/singleton/CurrenciesERC20.sol");

// // Test dummy erc20 tokens
// var USDT = artifacts.require("./test_erc20_tokens/TestUSDT.sol");
// var USDC = artifacts.require("./test_erc20_tokens/USDC.sol");
// var DAI = artifacts.require("./test_erc20_tokens/DAI.sol");
// var WETH = artifacts.require("./test_erc20_tokens/WETH.sol");
var SNM = artifacts.require("./test_erc20_tokens/SNM.sol");

const usdt_address = "0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad";
const usdc_address = "0xeb8f08a975ab53e34d8a0330e0d34de942c95926";
const dai_address = "0x95b58a6bff3d14b7db2f5cb5f0ad413dc2940658";
const weth_address = "0xc778417e063141139fce010982780140aa0cd5ab";
const snm_address = "0x98201f86F578154e01ec683E1962578855d8320C";

//var deposit_value = '50000';  // deposit INITIAL exchange market cup (turn capital)
//var deposit_value_wei = web3.utils.toWei(deposit_value,'ether');
//var custom_gas_price = 


var custom_gas_price = '1';
var wei_gas_price = web3.utils.toWei(custom_gas_price, 'gwei');
//var string_gas_price = wei_gas_price.toString;

module.exports = function(deployer, network, accounts) {
  console.log(accounts);
  console.log(wei_gas_price);
 // console.log(string_gas_price);

 /*
  deployer.deploy(MasterFactory,accounts[1],{gasPrice: wei_gas_price, from:accounts[0]}).then(function() {
 
  return;
 // return deployer.deploy(SuperFactory, KNS.address,accounts[1],accounts[2],{gasPrice:'1'}); 
});
*/

deployer.then(async () => {
  // await deployer.deploy(USDT,"USDT","USDT");
  // await deployer.deploy(USDC,"USDC","USDC");
  // USDC = await USDC.deployed();
  // await deployer.deploy(DAI,"DAI","DAI");
  // DAI = await DAI.deployed();
  // await deployer.deploy(WETH,"WETH","WETH");
  // WETH = await WETH.deployed();
  await deployer.deploy(SNM,"SONM","SNM");
  SNM = await SNM.deployed();
  //...
});
// .then(function() {

//   return deployer.deploy(Currencies,USDT.address,USDC.address,DAI.address,WETH.address,SNM.address, {gasPrice: wei_gas_price, from:accounts[0]});

// }).then(function(){

// // return deployer.deploy(MasterFactory,accounts[1],{gasPrice: wei_gas_price, from:accounts[0]});

//   return deployer.deploy(Master,"MoonShardNFT","MSNFT",{gasPrice: wei_gas_price, from:accounts[0]});
 
// }).then(function(){
//   console.log("Master token address:");
//   console.log(Master.address);
//   return deployer.deploy(MasterFactory,Master.address,accounts[1],Currencies.address,{gasPrice: wei_gas_price, from:accounts[0]});

// }).then(async () =>{
//   console.log ("MasterFactory address:");
//   console.log(MasterFactory.address);
//   MasterInstance = await Master.deployed();
//   MasterFactoryInstance = await MasterFactory.deployed();
//   await MasterInstance.updateFactoryAdress(MasterFactoryInstance.address);
//   fa = await MasterInstance.getFactoryAddress();
//   console.log("factory address");
//   console.log(fa);
//   return;
// }).then(async () => {
//   return;
// });


/*
deployer.deploy(USDT,"USDT","USDT");
deployer.deploy(USDC,"USDC","USDC");
deployer.deploy(DAI,"DAI","DAI");
deployer.deploy(WETH,"WETH","WETH");
deployer.deploy(SNM,"SONM","SNM");
*/

/*
deployer.deploy(Currencies,USDT.address,USDC.address,DAI.address,WETH.address,SNM.address, {gasPrice: wei_gas_price, from:accounts[0]}).then(function() {

  deployer.deploy(MasterFactory,accounts[1],{gasPrice: wei_gas_price, from:accounts[0]});

});
*/

/*
deployer.deploy(Ticket, {gasPrice:'1'}).then(function() {
  return deployer.deploy(TicketFactory,Ticket.address,accounts[0],{gasPrice:'1'}); // parameters -- ticket address, treasure_fund address
});
deployer.deploy(Deposit,{gasPrice:'1', value:deposit_value_wei, from:accounts[2]}); //FIXME: add value sent to deposit contract
*/


};
