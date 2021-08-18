//var SuperFactory = artifacts.require("./SuperFactory.sol");
//var KNS = artifacts.require("./KNS.sol");
var MasterFactory = artifacts.require("./721/singleton/MasterFactory721.sol")
//var Deposit = artifacts.require("./Deposit.sol")
var Master = artifacts.require("./721/singleton/MSNFT.sol")

var accounts = web3.eth.getAccounts();
var limitGas = web3.eth.getBlock("latest").gasLimit;


// Test dummy erc20 tokens
var USDT = artifacts.require("./721/singleton/TestTokenERC20.sol")
var USDC = artifacts.require("./721/singleton/TestTokenERC20.sol")
var DAI = artifacts.require("./721/singleton/TestTokenERC20.sol")
var WETH = artifacts.require("./721/singleton/TestTokenERC20.sol")
var SNM = artifacts.require("./721/singleton/TestTokenERC20.sol")

//var deposit_value = '50000';  // deposit INITIAL exchange market cup (turn capital)
//var deposit_value_wei = web3.utils.toWei(deposit_value,'ether');
//var custom_gas_price = 


var custom_gas_price = '200';
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

await deployer.deploy(USDT);
await deployer.deploy(USDC);
await deployer.deploy(DAI);
await deployer.deploy(WETH);
await deployer.deploy(SNM);




/*
deployer.deploy(Ticket, {gasPrice:'1'}).then(function() {
  return deployer.deploy(TicketFactory,Ticket.address,accounts[0],{gasPrice:'1'}); // parameters -- ticket address, treasure_fund address
});
deployer.deploy(Deposit,{gasPrice:'1', value:deposit_value_wei, from:accounts[2]}); //FIXME: add value sent to deposit contract
*/


};
