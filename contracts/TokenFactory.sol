// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Token {
    string public name;
    string public symbol;
    string public description;
    string public imageUrl;
    address public creator;
    uint256 public totalSupply;
    uint256 public constant K = 1e12;

    mapping(address => uint256) public balanceOf;

    event Buy(address indexed buyer, uint256 tokens, uint256 ethSpent);
    event Sell(address indexed seller, uint256 tokens, uint256 ethReceived);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _imageUrl,
        address _creator
    ) {
        name = _name;
        symbol = _symbol;
        description = _description;
        imageUrl = _imageUrl;
        creator = _creator;
    }

    function getPrice(uint256 supply) public pure returns (uint256) {
        return (supply * supply) / K;
    }

    function buy() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 price = getPrice(totalSupply);
        uint256 tokens = (msg.value * 1e18) / (price + 1);
        totalSupply += tokens;
        balanceOf[msg.sender] += tokens;
        emit Buy(msg.sender, tokens, msg.value);
    }

    function sell(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        uint256 price = getPrice(totalSupply);
        uint256 ethAmount = (amount * price) / 1e18;
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        payable(msg.sender).transfer(ethAmount);
        emit Sell(msg.sender, amount, ethAmount);
    }
}

contract TokenFactory {
    uint256 public creationFee = 0.001 ether;
    address public owner;

    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        string description;
        string imageUrl;
        address creator;
        uint256 createdAt;
    }

    TokenInfo[] public tokens;
    mapping(address => address[]) public creatorTokens;

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address indexed creator,
        uint256 index
    );

    constructor() {
        owner = msg.sender;
    }

    function createToken(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _imageUrl
    ) external payable returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");

        Token newToken = new Token(
            _name,
            _symbol,
            _description,
            _imageUrl,
            msg.sender
        );

        TokenInfo memory info = TokenInfo({
            tokenAddress: address(newToken),
            name: _name,
            symbol: _symbol,
            description: _description,
            imageUrl: _imageUrl,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        tokens.push(info);
        creatorTokens[msg.sender].push(address(newToken));

        emit TokenCreated(address(newToken), _name, _symbol, msg.sender, tokens.length - 1);

        return address(newToken);
    }

    function getTokenCount() external view returns (uint256) {
        return tokens.length;
    }

    function getTokens() external view returns (TokenInfo[] memory) {
        return tokens;
    }

    function getCreatorTokens(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }

    function withdrawFees() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
}