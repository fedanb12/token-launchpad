// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenLaunchpad {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint256 public constant K = 1e12; // bonding curve constant

    mapping(address => uint256) public balanceOf;

    event Buy(address indexed buyer, uint256 tokens, uint256 ethSpent);
    event Sell(address indexed seller, uint256 tokens, uint256 ethReceived);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
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