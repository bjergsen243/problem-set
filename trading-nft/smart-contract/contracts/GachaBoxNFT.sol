// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721, ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GachaBoxNFT is ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    struct BoxType {
        uint128 price;
        bool isActive;
    }

    struct PendingMint {
        address user;
        uint32 boxType;
        uint64 timestamp;
        bool isMinted;
    }

    mapping(uint256 => BoxType) private _boxTypes;
    mapping(uint256 => PendingMint) private _pendingMints;
    mapping(address => uint32) private _userDailyMints;
    mapping(address => bool) private _authorizedMinters;

    uint256 private _tokenIdCounter;
    uint256 private _requestIdCounter;
    uint32 private _dailyMintLimit = 5;
    uint64 private constant _MINT_TIMEOUT = 1 days;
    uint256 private _pendingWithdrawals;

    event GachaPaid(address indexed user, uint256 indexed boxType, uint256 indexed requestId);
    event NFTMinted(address indexed user, uint256 indexed tokenId, string uri);
    event MinterAuthorized(address indexed minter, bool status);
    event DailyMintLimitUpdated(uint32 oldLimit, uint32 newLimit);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount);

    error BoxNotActive();
    error InsufficientPayment();
    error DailyMintLimitReached();
    error AlreadyMinted();
    error NotAuthorized();
    error RefundFailed();
    error NoFundsToWithdraw();
    error WithdrawalFailed();
    error ZeroAddress();

    constructor() ERC721("GachaBox NFT", "GBNFT") Ownable(msg.sender) {
        _authorizedMinters[msg.sender] = true;
        emit MinterAuthorized(msg.sender, true);
    }

    function spinGacha(uint256 boxType) external payable whenNotPaused nonReentrant {
        BoxType storage box = _boxTypes[boxType];
        if (!box.isActive) revert BoxNotActive();
        if (msg.value < box.price) revert InsufficientPayment();
        if (_userDailyMints[msg.sender] >= _dailyMintLimit) revert DailyMintLimitReached();

        uint256 requestId = _requestIdCounter++;
        _pendingMints[requestId] = PendingMint(msg.sender, uint32(boxType), uint64(block.timestamp), false);
        _pendingWithdrawals += box.price;
        _userDailyMints[msg.sender]++;
        emit GachaPaid(msg.sender, boxType, requestId);

        if (msg.value > box.price) {
            (bool success, ) = msg.sender.call{value: msg.value - box.price}("");
            if (!success) revert RefundFailed();
        }
    }

    function mintNFT(uint256 requestId, string calldata uri) external whenNotPaused nonReentrant {
        if (!_authorizedMinters[msg.sender]) revert NotAuthorized();
        PendingMint storage pending = _pendingMints[requestId];
        if (pending.isMinted) revert AlreadyMinted();
        if (block.timestamp - pending.timestamp > _MINT_TIMEOUT) revert AlreadyMinted();

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(pending.user, tokenId);
        _setTokenURI(tokenId, uri);
        pending.isMinted = true;
        _pendingWithdrawals -= _boxTypes[pending.boxType].price;
        emit NFTMinted(pending.user, tokenId, uri);
    }

    function setBoxPrice(uint256 boxType, uint256 price, bool isActive) external onlyOwner {
        _boxTypes[boxType] = BoxType(uint128(price), isActive);
    }

    function setAuthorizedMinter(address minter, bool status) external onlyOwner {
        if (minter == address(0)) revert ZeroAddress();
        _authorizedMinters[minter] = status;
        emit MinterAuthorized(minter, status);
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 availableBalance = address(this).balance - _pendingWithdrawals;
        if (availableBalance == 0) revert NoFundsToWithdraw();
        (bool success, ) = msg.sender.call{value: availableBalance}("");
        if (!success) revert WithdrawalFailed();
    }
}
