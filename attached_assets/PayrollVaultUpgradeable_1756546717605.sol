// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/**
 * PayrollVaultUpgradeable
 * - Custodies ERC20 funds for payroll
 * - Only addresses with SPENDER_ROLE may move funds out (e.g., PayrollEngine)
 * - Admin can emergency-withdraw and manage spenders
 */
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
contract PayrollVaultUpgradeable is Initializable, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;
bytes32 public constant SPENDER_ROLE = keccak256("SPENDER_ROLE");
event Deposited(address indexed token, address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);
    event SpenderSet(address indexed spender, bool allowed);
/// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
function initialize(address admin) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
_grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
// Deposit by transferFrom (caller must approve this vault)
    function deposit(address token, uint256 amount) external whenNotPaused {
        require(token != address(0), "token=0");
        require(amount > 0, "amount=0");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(token, msg.sender, amount);
    }
// Move funds out by spender (used by PayrollEngine)
    function transferFromVault(address token, address to, uint256 amount)
        external
        whenNotPaused
        onlyRole(SPENDER_ROLE)
    {
        require(token != address(0) && to != address(0), "zero addr");
        require(amount > 0, "amount=0");
        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }
// Emergency/admin withdraw (avoid misuse; keep for break-glass)
    function adminWithdraw(address token, address to, uint256 amount)
        external
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(token != address(0) && to != address(0), "zero addr");
        IERC20(token).safeTransfer(to, amount);
        emit Withdrawn(token, to, amount);
    }
function setSpender(address spender, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (allowed) {
            _grantRole(SPENDER_ROLE, spender);
        } else {
            _revokeRole(SPENDER_ROLE, spender);
        }
        emit SpenderSet(spender, allowed);
    }
function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
// Helper view
    function balanceOf(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
