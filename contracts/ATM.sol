// SPDX-License-Identifier: MIT

pragma solidity 0.8.5;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract ATM {
    uint256 public constant DENOMINATOR = 100000;
    IERC20 public immutable token;

    uint256 public depositTotal;
    uint256 public withdrawTotal;

    mapping(address => uint256) public shares;
    mapping(address => uint256) public withdrawn;

    modifier updateDeposits {
        depositTotal += (token.balanceOf(address(this)) + withdrawTotal - depositTotal);
        _;
    }

    event Withdraw(address wallet, uint256 amount);

    constructor(IERC20 _token, address[] memory _wallets, uint256[] memory _shares) public {
        require(_wallets.length == _shares.length, "ATM: corrupt data");

        token = _token;

        for (uint256 i = 0; i < _wallets.length; i++) {
            shares[_wallets[i]] = _shares[i];
        }
    }

    function isCustomer(address wallet) public returns (bool) {
        return shares[wallet] > 0;
    }

    function withdraw() external updateDeposits {
        require(isCustomer(msg.sender), "ATM: no shares");

        uint256 totalWithdraw = depositTotal * shares[msg.sender] / DENOMINATOR;
        uint256 availableWithdraw = totalWithdraw - withdrawn[msg.sender];

        withdrawn[msg.sender] += availableWithdraw;
        withdrawTotal += availableWithdraw;

        emit Withdraw(msg.sender, availableWithdraw);

        token.transfer(msg.sender, availableWithdraw);
    }
}
