pragma solidity ^0.8.0;

import './TokenSale721.sol';
import './MSNFT.sol';

contract TicketSale721 is TokenSale721 {

//using Counters for Counters.Counter;

//Counters.Counter scanned_tickets;

constructor(address payable wallet, MSNFT token, uint sale_limit, string memory jid, address payable _treasure_fund, uint timeToStart, uint256 sprice, CurrencyERC20 _currency) TokenSale721(wallet,token, sale_limit, jid, _treasure_fund, timeToStart, sprice, _currency)  {}


/**
*
*@dev overload buy token function to give allowance to reedem tickets
*
*
*/
function buyTicket(address buyer, uint256 amountToBuy, CurrencyERC20 currency) public payable {
    super.buyTokens(buyer, amountToBuy, currency);
    //MSNFT ticket_token = super.token();
   // super._token.approve(_wallet,tokens);

    // chek this one more time
    //ticket_token.setApprovalForEvent(buyer,);

}

// fallback
/*
fallback() external payable {
        buyTicket(_msgSender());
    }
*/


// deprecated
/*
function redeemTicket(address visitor, uint256 token_id) public {
    MSNFT ticket_token = super.token();
    uint256 event_id = super.event_id();
    ticket_token.redeemTicket(visitor, token_id, event_id);
}


function redeemTicket(address visitor, uint256 token_id) public {
    MSNFT ticket_token = super.token();
    uint256 event_id = super.event_id();
    ticket_token.redeemTicket(visitor, token_id, event_id);
    scanned_tickets.increment();
}

function getScannedTicketsCount() public view  returns(uint)  {
    uint st = scanned_tickets.current();
    return st;
}



function refundTicket(uint256 token_id) public {
    MSNFT ticket_token = super.token();
    uint256 event_id = super.event_id();
    address payable visitor = msg.sender;
    if (now <= crDate - _timeToStart) {
         require(ticket_token.refundTicket(msg.sender, token_id, event_id), "can't refund ticket from MSNFT");
            uint256 rate = rate();
//            uint256 amount = rate / (1 ether);
            uint256 amount = rate;
            uint fees = calculateFee(amount, 100);
            amount = amount - fees;
            super.refundToken(visitor, amount);

        } else {
            revert("event is already started");
        }

}
*/

}
