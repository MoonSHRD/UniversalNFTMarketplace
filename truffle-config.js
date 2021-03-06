/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

const web3 = require('web3');


var maxFeePerGas_custom = '260';
var maxPriorityFeePerGas_custom = '2';
var maxFeePerGas_wei = web3.utils.toWei(maxFeePerGas_custom, 'gwei');
var maxPriorityFeePerGas_wei = web3.utils.toWei(maxPriorityFeePerGas_custom, 'gwei');
// var custom_gas_price = '280'; // for ropsten
// var wei_gas_price = web3.utils.toWei(custom_gas_price, 'gwei');

// const path = require("path");
const { projectId, privateKeys, coinmarketcupKey , addressIndex, pollingInterval, etherscanApiKey} = require('./secret.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');
module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    // development: {
    //  host: "127.0.0.1",     // Localhost (default: none)
    //  port: 7545,            // Standard Ethereum port (default: none)
    //  network_id: "*",       // Any network (default: none)
    // },
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }

    ganache: {            // truffle migrate --reset --network ganache
      host: "127.0.0.1",
      port: 7545,
      gasLimit: '6721975',
     // maxFeePerGas: '2000000000000',        // -
     // maxPriorityFeePerGas: '25000000000', //- use maxFeePerGas and maxPriorityFeePerGas if creating type 2 transactions (https://eips.ethereum.org/EIPS/eip-1559)
     // gasPrice: '20000000000',
      network_id: '*'
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
     // gasPrice: '20000000000',
     // maxFeePerGas: '2000000000000',        // -
     // maxPriorityFeePerGas: '20000000000', //- use maxFeePerGas and maxPriorityFeePerGas if creating type 2 transactions (https://eips.ethereum.org/EIPS/eip-1559)
      network_id: "*"
    },
    rinkeby: {
      provider: () => new HDWalletProvider(privateKeys, `wss://rinkeby.infura.io/ws/v3/${projectId}`,addressIndex, pollingInterval),
      network_id: 4,       // Rinkeby's id
      websocket: false,
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 50000,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: false,    // Skip dry run before migrations? (default: false for public nets )
      networkCheckTimeout: 1000000,
      websockets: true
    },
    ropsten: {
     /*
      provider: function() {
        return new HDWalletProvider(privateKeys, `https://ropsten.infura.io/v3/${projectId}`,addressIndex, pollingInterval);
      },
      */
      provider: () => new HDWalletProvider(privateKeys, `https://ropsten.infura.io/v3/${projectId}`,addressIndex, pollingInterval),
      network_id: 3,
      gasLimit: '6721975',
   //   gas:'6721975',
   //   gasPrice: wei_gas_price, // - use gas and gasPrice if creating type 0 transactions
   //   maxFeePerGas: maxFeePerGas_wei,        // -
   //   maxPriorityFeePerGas: maxPriorityFeePerGas_wei, //- use maxFeePerGas and maxPriorityFeePerGas if creating type 2 transactions (https://eips.ethereum.org/EIPS/eip-1559)
      websocket: false,
      confirmations: 2,
      timeoutBlocks: 50000,
      skipDryRun: false,
      networkCheckTimeout: 1000000
    }

  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    enableTimeouts: false,
    reporter: 'eth-gas-reporter',
    // reporterOptions : {
    //   currency: 'EUR',
    //   url:'http://127.0.0.1:7545',
    //   coinmarketcap: coinmarketcupKey,
    //   onlyCalledMethods: true,
    //   showTimeSpent: true,
    //   excludeContracts: ['Migrations'],
    //   showMethodSig: true,
    // }
  },

  plugins: [
    'truffle-plugin-verify'
  ],

  api_keys: {
    etherscan: etherscanApiKey
  },

  // Configure your compilers
  compilers: {
    solc: {
       version: "^0.8.0",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
     // parser: "solcjs",
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 1000
        },
        evmVersion: "istanbul"
       }
    },
  },
};