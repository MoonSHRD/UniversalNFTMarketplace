
pragma solidity ^0.5.11;

import './zeppeline/ownership/Ownable.sol';
import "./zeppeline/drafts/Counters.sol";

contract Deposit is Ownable {

using Counters for Counters.Counter;
using SafeMath for uint256;
/*
Events
*/

// this event invoke when someone want to cashout funds to plastic card
// this event should been catched by 'cashier' service and procced tx out at Fiat payment processer
// amount is in Wei, so cashier probably need to convert it
event cashOutRequestEvent(address indexed user, uint amount, string purce,uint256 indexed txid);
event cashOutRequestEventAnonymouse(address user, uint amount, string purce, uint256 txid);

// TODO add indexed payload to event

event cashInRequestEvent(address indexed user, uint amount, string indexed uuid);

event cashOutRevertEvent(address indexed user, uint amount, uint256 indexed txid, string err_msg);

/*
Constants
*/

Counters.Counter public tx_id_out;

//uint balance;

// fiat uuid = request
mapping (string => IRequest) public InRequest;

// tx.id (out) = request
mapping (uint256 => ORequest) public OutRequest;

//mapping (string => bool) public Executed

struct IRequest {

    string paymentType;
    string fiat_uuid;       // ID of transaction at unitpay side
    uint amount;            // sum
    address payable user_wallet; // In unitpay system it's params[account]
   // string fiat_address; -- we are not processing this info

    address submited_by; // moonshard operator
    bool executed;
    string payload; // should not be secret info
}

struct ORequest {

    string paymentType;
    uint amount;
    address payable wallet_from;
    string purce; // fiat destination address
    uint256 tx_id;  // tx id on OUR side
    bool executed;
}

constructor() public payable {

}




// cash out
function cashOutRequest(string memory purce, string memory paymentType) public payable {
    uint amount = msg.value;
    address payable wallet_from = address(msg.sender);

    ORequest memory orq;
    orq.paymentType = paymentType;
    orq.amount = amount;    // FIXME: add amount conversion
    orq.wallet_from = wallet_from;
    orq.purce = purce;
    orq.executed = false;

    tx_id_out.increment();
    orq.tx_id = tx_id_out.current();
    uint256 id = orq.tx_id;

    OutRequest[id] = orq;

    emit cashOutRequestEvent(wallet_from, amount, purce,id);
    emit cashOutRequestEventAnonymouse(wallet_from, amount, purce, id);
}

// cash in
// cashier submit request for cash in while getting events from Fiat payment processor
function cashInRequest(address payable user, string memory uuid, uint amount) public onlyOwner {

    IRequest memory irq;
    irq.fiat_uuid = uuid;
    irq.user_wallet = user;
   // irq.fiat_address = from;
    irq.submited_by = msg.sender;
    irq.amount = amount;
  //  irq.executed = false;
    proceedTransactionIN(irq);

    InRequest[uuid] = irq;


    emit cashInRequestEvent(user,amount,uuid);
}


// **WARN** -- DEPRECATED
//
//TODO Validator key can be added here to prove (submit) transaction from FIAT processor.
// It 's not neccerily, as we could just use the blockchain validation itself, but do it in more transcendent way
// FIXME : change onlyOwner to onlyValidator
function cashInSubmit(string memory uuid) public onlyOwner {
    IRequest memory irq;
    irq = InRequest[uuid];
    require(irq.executed == false, "transaction is already executed! (reentrancy guard)");
    address payable _user = irq.user_wallet;
    uint amount = irq.amount;
    // Do some conversion for amount (FIXME)
    // ...

    // FIXME : use internal proceedTransaction instead
    _user.transfer(amount);
    irq.executed = true;
    InRequest[uuid] = irq;


}

function cashOutSubmit(uint256 tx_id) public onlyOwner {
    ORequest memory orq;
    orq = OutRequest[tx_id];
    require(orq.executed == false, "transaction is already executed! (reentrancy guard)");
    orq.executed = true;
    OutRequest[tx_id] = orq;
}

function cashOutRevert(uint256 tx_id, string memory err_msg) public onlyOwner {
    ORequest memory orq;
    orq = OutRequest[tx_id];
    require(orq.executed == false, "transaction is already executed! (reentrancy guard)");
    address payable user = orq.wallet_from;
    uint amount = orq.amount;
    user.transfer(amount);

    emit cashOutRevertEvent(user,amount,tx_id,err_msg);

}

function proceedTransactionIN(IRequest memory ts) internal {
    address payable _user = ts.user_wallet;
    uint amount = ts.amount;
    _user.transfer(amount);
}





// fallback -- this functiion should be invoked when we need to add turn capital to deposit
function() external payable {
  //  cashOutRequest()
  // don't allow user to cashOut without pointing destination
  //revert("can't cashOut without out address");
}


}