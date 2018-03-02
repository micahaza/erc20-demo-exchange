pragma solidity ^0.4.13;

import "./Owned.sol";

contract ERC20TokenExchange is Owned {
    
    struct Offer {
        address who;
        uint amount;
    }

    struct OrderBook {
        mapping(uint => Offer) buyBook;
        mapping(uint => Offer) sellBook;
    }

    struct Token {
        address tokenContract;
        string symbolName;
    }

}