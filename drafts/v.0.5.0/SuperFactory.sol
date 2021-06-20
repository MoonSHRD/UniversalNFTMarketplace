pragma solidity ^0.5.11;

import './gnosis/MultiSigWalletFactory.sol';
import './gnosis/MultiSigWalletWithDailyLimitFactory.sol';
import './KNS.sol';


contract SuperFactory is MultiSigWalletWithDailyLimitFactory {

KNS registry;

// address of replacer who replace key if owner has lost access
address replacer;
// address of twoFactor for 2FA transactions
address twoFactor;


modifier onlyReplacer() {
    require(msg.sender == replacer, "msg.sender != replacer");
    _;
}

modifier onlyTwoFactor() {
    require(msg.sender == twoFactor, "msg.sender != 2FA");
    _;
}

constructor(address registry_deployed, address _replacer, address _twoFactor) public {
    registry = KNS(registry_deployed);
    replacer = _replacer;
    twoFactor = _twoFactor;
}

function createWallet(address[] memory _owners, uint _required, uint _dailyLimit, string memory Jid, string memory tel) public returns(address _wallet) {

    address wallet = super.create(_owners,_required, _dailyLimit);

    address prime_owner = _owners[0];
    registry.Register(prime_owner,wallet,Jid,tel);
    return wallet;
}


// TODO: add function to create wallet with pre-defined 2fa/replacer key
// HOWTO: req =1 for test, req = 2 for twoFactor AND replacer. req NEVER should be =3 as replacer is needed only for losted keys.
function createSimpleWallet(address _owner, uint _required, uint _dailyLimit, string memory Jid, string memory tel) public returns(address _wallet){

    address[] memory _owners = new address[](3);

    _owners[0] = _owner;
    _owners[1] = replacer;
    _owners[2] = twoFactor;
    

   // _owners.push(_owner);



    address wallet = super.create(_owners,_required, _dailyLimit); // FIXME: super.create instead of create (?)

    address prime_owner = _owners[0];
    registry.Register(prime_owner,wallet,Jid,tel);
    return wallet;
}

// Dummy wallet is a wallet with one key - 2FA entangled with telephone number
function createDummyWallet(string memory Jid, string memory tel) public returns(address _wallet) {
    address[] memory _owners;
   // uint _dailyLimit;
    _owners[0] = twoFactor;

    address wallet = create(_owners, 1, 0);
    registry.Register(twoFactor,wallet,Jid,tel);
    return wallet;
}



function setReplacer(address _replacer) public onlyReplacer {
    replacer = _replacer;
}

function setTwoFactor (address _twoFactor) public onlyTwoFactor {
    twoFactor = _twoFactor;
}


}