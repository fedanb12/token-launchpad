# PumpZone — Token Launchpad

A decentralized token launchpad built on Ethereum, inspired by Pump.fun. Users can create and trade tokens using an automated bonding curve mechanism.

## Live Demo
https://token-launchpad-yd3j.vercel.app/

## Tech Stack
- **Smart Contract:** Solidity, Hardhat
- **Blockchain:** Ethereum Sepolia Testnet
- **Frontend:** React, Recharts, Ethers.js
- **Wallet:** MetaMask

## Features
- Bonding curve pricing — price increases automatically with supply
- Buy and sell tokens directly from the UI
- Live price history chart
- Real-time activity feed
- MetaMask wallet integration

## How It Works
The bonding curve formula `price = supply² × k` ensures early buyers get lower prices. ETH is locked in the contract as reserve, guaranteeing tokens can always be sold back.

## Run Locally
```bash
git clone https://github.com/fedanb12/token-launchpad
cd token-launchpad/client
npm install
npm start