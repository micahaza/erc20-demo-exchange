pragma solidity ^0.4.13;

import "./Owned.sol";
import "./FixedSupplyToken.sol";

contract ERC20Exchange is Owned {
    
    struct Offer {
        uint amount;
        address who;
    }

    struct OrderBook {
        uint higherPrice;
        uint lowerPrice;
        mapping(uint => Offer) offers;
        uint offersKey;
        uint offersLength;
    }

    struct Token {
        address tokenContract;
        string symbolName;
    
        mapping(uint => OrderBook) buyBook;
        uint currBuyPrice;
        uint lowestBuyPrice;
        uint amountBuyPrices;
    
        mapping(uint => OrderBook) sellBook;
        uint currSellPrice;
        uint highestSellPrice;
    }
        uint amountSellPrices;

    mapping(uint8 => Token) tokens;
    
    uint8 symbolNameIndex;

    mapping(address => uint) ethBalanceForAddress;
    mapping(address => mapping(uint => uint)) tokenBalanceForAddress;    

    // Deposit, withdrawal events
    event TokenDepositReceived(address indexed _from, uint indexed _symbolIndex, uint _amount, uint _timestamp);
    event TokenWithdrawal(address indexed _to, uint indexed _symbolIndex, uint _amount, uint _timestamp);
    event EthDepositReceived(address indexed _from, uint _amount, uint _timestamp);
    event EthWithdrawal(address indexed _to, uint _amount, uint _timestamp);

    // Order events
    event LimitSellOrderCreated(uint indexed _symbolIndex, address indexed _who, uint _amountTokens, uint _priceInWei, uint _orderKey);
    event SellOrderFulfilled(uint indexed _symbolIndex, uint _amount, uint _priceInWei, uint _orderKey);
    event SellOrderCanceled(uint indexed _symbolIndex, uint _priceInWei, uint _orderKey);
    event LimitBuyOrderCreated(uint indexed _symbolIndex, address indexed _who, uint _amountTokens, uint _priceInWei, uint _orderKey);
    event BuyOrderFulfilled(uint indexed _symbolIndex, uint _amount, uint _priceInWei, uint _orderKey);
    event BuyOrderCanceled(uint indexed _symbolIndex, uint _priceInWei, uint _orderKey);

    //Management events
    event TokenAddedToSystem(uint _symbolIndex, string _token, uint _timestamp);

    // function ERC20Exchange() public {
    //     owner = msg.sender;
    // }

    // ETHER DEPOSIT/WITHDRAWAL FUNCTIONS
    function depositEther() public payable {
        require(ethBalanceForAddress[msg.sender] + msg.value >= ethBalanceForAddress[msg.sender]);
        ethBalanceForAddress[msg.sender] += msg.value;
        EthDepositReceived(msg.sender, msg.value, now);
    } 
    
    function withdrawEther(uint amountInWei) public {
        require(ethBalanceForAddress[msg.sender] >= amountInWei);
        require(ethBalanceForAddress[msg.sender] - amountInWei <= ethBalanceForAddress[msg.sender]);
        ethBalanceForAddress[msg.sender] -= amountInWei;
        msg.sender.transfer(amountInWei);
        EthWithdrawal(msg.sender, amountInWei, now);
    }

    function getEtherBalanceInWei() public constant returns(uint) {
        return ethBalanceForAddress[msg.sender];
    }

    // TOKEN MANAGEMENT
    function depositToken(string _symbolName, uint _amount) public {
        uint8 tokenIndex = getSymbolIndex(_symbolName);
        require(tokens[tokenIndex].tokenContract != address(0));
        ERC20Interface token = ERC20Interface(tokens[tokenIndex].tokenContract);
        require(token.transferFrom(msg.sender, address(this), _amount) == true);
        require(tokenBalanceForAddress[msg.sender][tokenIndex] + _amount >= tokenBalanceForAddress[msg.sender][tokenIndex]); 
        tokenBalanceForAddress[msg.sender][tokenIndex] += _amount;
        TokenDepositReceived(msg.sender, tokenIndex, _amount, now);
    }

    function withdrawToken(string _symbolName, uint _amount) public {
        uint8 tokenIndex = getSymbolIndex(_symbolName);
        require(tokens[tokenIndex].tokenContract != address(0));
        ERC20Interface token = ERC20Interface(tokens[tokenIndex].tokenContract);
        require(tokenBalanceForAddress[msg.sender][tokenIndex] >= _amount);
        require(tokenBalanceForAddress[msg.sender][tokenIndex] - _amount <= tokenBalanceForAddress[msg.sender][tokenIndex]);
        tokenBalanceForAddress[msg.sender][tokenIndex] -= _amount;
        require(token.transfer(msg.sender, _amount) == true);
        TokenWithdrawal(msg.sender, tokenIndex, _amount, now);
    }

    function getTokenBalance(string _symbolName) public constant returns(uint) {
        uint8 tokenIndex = getSymbolIndex(_symbolName);
        require(tokenIndex > 0);
        return tokenBalanceForAddress[msg.sender][tokenIndex];
    }

    function addToken(string _symbolName, address _tokenAddress) public onlyOwner {
        require(!hasToken(_symbolName));
        require(symbolNameIndex + 1 > symbolNameIndex);
        symbolNameIndex++;
        tokens[symbolNameIndex].symbolName = _symbolName;
        tokens[symbolNameIndex].tokenContract = _tokenAddress;
        TokenAddedToSystem(symbolNameIndex, _symbolName, now);
    }

    function getSymbolIndex(string _symbolName) internal view returns(uint8) {
        for (uint8 i = 1; i <= symbolNameIndex; i++ ) {
            if (stringsEqual(tokens[i].symbolName, _symbolName)) {
                return i;
            }
        }
        return 0;
    }

    function stringsEqual(string storage _a, string memory _b) internal view returns(bool) {
        bytes storage a = bytes(_a);
        bytes memory b = bytes(_b);
        if (a.length != b.length) {
            return false;
        }
        for (uint i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    function hasToken(string _symbolName) public view returns(bool) {
        uint8 tokenIndex = getSymbolIndex(_symbolName);
        if (tokenIndex == 0) {
            return false;
        }
        return true;
    }

    /*
    function getBuyOrderBook(string symbolName) public constant returns(uint[], uint[]) {

    }

    function getSellOrderBook(string symbolName) public constant returns(uint[], uint[]) {

    }

    // Bid Order
    function buyToken(string symbolName, uint priceInWei, uint amount) public {

    }

    // Ask Order
    function sellToken(string symbolName, uint priceInWei, uint amount) public {

    }
    */
}