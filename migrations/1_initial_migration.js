const Migrations = artifacts.require("./Migrations.sol");

var custom_gas_price = '3'; // for rinkeby
var wei_gas_price = web3.utils.toWei(custom_gas_price, 'gwei');

var maxFeePerGas_custom = '100'; // for rinkeby
var maxPriorityFeePerGas_custom = '2';
var maxFeePerGas_wei = web3.utils.toWei(maxFeePerGas_custom, 'gwei');
var maxPriorityFeePerGas_wei = web3.utils.toWei(maxPriorityFeePerGas_custom, 'gwei');





module.exports = function (deployer, network, accounts) {

 // process.env.NETWORK = deployer.network;
 // if (network == "ropsten" || network =="ropsten-fork") {
    console.log(accounts);

  //   web3.eth.sendTransaction({to:accounts[1], from:accounts[0], value:web3.utils.toWei('500','gwei'), gasPrice:web3.utils.toWei('300','gwei')});
    console.log(" maxFeePerGas:");
    console.log(maxFeePerGas_wei);
    console.log("max PriorityFeePerGas:");
    console.log(maxPriorityFeePerGas_wei);

    console.log("block gas limit:");
    var limitGas = web3.eth.getBlock("latest").gasLimit;
    console.log(limitGas);

    deployer.then(async () => {
      
      return deployer.deploy(Migrations, {
     //   gas: '6721975',
     //   gasPrice: wei_gas_price,
    maxFeePerGas: maxFeePerGas_wei,
    maxPriorityFeePerGas: maxPriorityFeePerGas_wei,
     //   from: accounts[1]
      });

    });

 // }
  

 // deployer.deploy(Migrations);
};
