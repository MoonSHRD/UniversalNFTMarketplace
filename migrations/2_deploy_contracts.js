var SuperFactory = artifacts.require("./SuperFactory.sol");
var KNS = artifacts.require("./KNS.sol");
var TicketFactory = artifacts.require("./721/singleton/TicketFactory721.sol")
var Deposit = artifacts.require("./Deposit.sol")
var Ticket = artifacts.require("./721/singleton/Ticket721.sol")
var accounts = web3.eth.getAccounts();
var limitGas = web3.eth.getBlock("latest").gasLimit;

var deposit_value = '50000';  // deposit INITIAL exchange market cup (turn capital)
var deposit_value_wei = web3.utils.toWei(deposit_value,'ether');


module.exports = function(deployer, network, accounts) {
  console.log(accounts);
 deployer.deploy(KNS,{gasPrice:'1', from:accounts[1]}).then(function() {
  console.log(network);
  console.log(network.port);
  console.log(network.gasPrice);
  console.log(accounts);
  console.log("deployer")
  console.log(accounts[0]);
  console.log("cashier");
  console.log(accounts[1]);
  console.log("treasure");
  console.log(accounts[2]);
  return
 // return deployer.deploy(SuperFactory, KNS.address,accounts[1],accounts[2],{gasPrice:'1'});
});
// IMPORTANT - for parity local deployment 
// accounts[0] - 0x11... -- treasure key
// accounts[1] - 0x3214  -- deployer key
// accounts[2] - 0xa784  -- cashier key
console.log("gas limit");
console.log(limitGas);
deployer.deploy(Ticket, {gasPrice:'1'}).then(function() {
  return deployer.deploy(TicketFactory,Ticket.address,accounts[0],{gasPrice:'1'}); // parameters -- ticket address, treasure_fund address
})
deployer.deploy(Deposit,{gasPrice:'1', value:deposit_value_wei, from:accounts[2]}); //FIXME: add value sent to deposit contract
};
