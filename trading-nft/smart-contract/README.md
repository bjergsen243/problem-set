# Gacha Box NFT Smart Contract

A decentralized Gacha Box system built on Ethereum, allowing users to purchase and open boxes to receive NFTs with random attributes. This contract includes pricing management, minting authorization, and secure fund withdrawal.

## Overview

The Gacha Box NFT system enables users to:

- Purchase and open Gacha Boxes with ETH.
- Obtain NFTs with randomized metadata upon opening a box.
- Enforce a daily mint limit per user.
- Securely withdraw funds collected from box purchases.
- Manage authorized minters for controlled NFT minting.

## Features

### Core Mechanics

- **Gacha Box System**: Users can buy and open boxes with ETH.
- **NFT Minting**: Authorized minters can mint NFTs linked to Gacha Boxes.
- **Daily Mint Limit**: Prevents excessive minting by users.
- **Admin Controls**: Manage box prices, authorized minters, and withdrawals.

### Smart Contract Security

- **Role-Based Access**: Admin can set box prices, authorize minters, and withdraw funds.
- **Custom Errors**: Clear error messages for failed transactions.
- **Fund Management**: Secure withdrawal mechanism for collected ETH.

## Contract Functions

### User Functions

#### `spinGacha(uint256 boxType, {value: price})`

- Allows users to purchase a Gacha Box by sending ETH.
- Emits `GachaPaid` event upon success.
- Reverts if:
  - Insufficient payment (`InsufficientPayment`).
  - Box type is not active (`BoxNotActive`).
  - User exceeds daily mint limit (`DailyMintLimitReached`).

#### `mintNFT(uint256 boxId, string memory tokenURI)`

- Allows an authorized minter to mint an NFT for a specific Gacha Box.
- Emits `NFTMinted` event upon success.
- Reverts if:
  - Caller is not an authorized minter (`NotAuthorized`).
  - NFT has already been minted (`AlreadyMinted`).

### Admin Functions

#### `setBoxPrice(uint256 boxType, uint256 price, bool isActive)`

- Sets the price and availability of a specific Gacha Box type.
- Can only be called by the contract owner.

#### `setAuthorizedMinter(address minter, bool isAuthorized)`

- Grants or revokes minter authorization.
- Reverts if attempting to set a zero address (`ZeroAddress`).

#### `withdrawFunds()`

- Allows the owner to withdraw accumulated ETH from the contract.
- Reverts if there are no funds to withdraw (`NoFundsToWithdraw`).

## Events

- `GachaPaid(address indexed user, uint256 boxType, uint256 amount)`
- `NFTMinted(address indexed minter, uint256 boxId, string tokenURI)`

## Technical Details

- **Solidity Version**: 0.8.20
- **EVM Compatibility**: Paris
- **Gas Optimizations**: Implemented
- **Security Measures**: Role-based access control, reentrancy protection

## Deployment Guide

### Prerequisites

- Node.js >= 18
- Hardhat
- Yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/gacha-box-nft.git
cd gacha-box-nft

# Install dependencies
yarn install
```

### Compile and Deploy

```bash
# Compile contracts
yarn compile

# Deploy locally
yarn deploy:local

# Deploy to testnet
yarn deploy:sepolia
```

### Running Tests

```bash
yarn test
yarn coverage
```

## License

This project is licensed under the MIT License.
