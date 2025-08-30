// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/**
 * PayrollEngineUpgradeable (UUPS)
 * - Bi-weekly autonomous payroll in ERC20
 * - Works with PayrollVaultUpgradeable via SPENDER_ROLE
 * - Add/modify employees; process payouts in gas-bounded batches
 * - Chainlink Automation-compatible (checkUpkeep/performUpkeep)
 * - Rules lock: freeze core params (vault, defaultToken, payFrequency) once you want immutability guarantees
 */
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IPayrollVault {
    function transferFromVault(address token, address to, uint256 amount) external;
    function balanceOf(address token) external view returns (uint256);
}
contract PayrollEngineUpgradeable is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAYROLL_ADMIN_ROLE = keccak256("PAYROLL_ADMIN_ROLE");
struct Employee {
        address wallet;          // destination wallet
        address token;           // payout token (0 => use defaultToken)
        uint256 amount;          // per-period amount
        uint64  nextPayTime;     // unix timestamp due time
        bool    active;          // active or not
    }
// Storage
    IPayrollVault public vault;
    address public defaultToken;
    uint64  public payFrequency;         // seconds (e.g., 14 days)
    bool    public rulesLocked;          // one-way lock for core params
    bool    public allowDecreaseAfterLock; // if false, salary can only increase after lock
Employee[] private employees;
// Gas-bounded batch processing pointer
    uint256 public lastProcessedIndex;
// Events
    event Initialized(address admin, address vault, address defaultToken, uint64 payFrequency);
    event RulesLocked(bool allowDecreaseAfterLock);
    event EmployeeAdded(uint256 indexed id, address wallet, uint256 amount, address token, uint64 startTime);
    event EmployeeUpdated(uint256 indexed id, address wallet, uint256 amount, address token, bool active);
    event PayoutExecuted(uint256 indexed id, address indexed wallet, address token, uint256 amount, uint64 payTime);
    event PayoutSkippedInsufficientFunds(uint256 indexed id, address token, uint256 needed, uint256 available);
/// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }
function initialize(
        address admin,
        address vault_,
        address defaultToken_,
        uint64  payFrequencySeconds,
        bool    allowDecreaseAfterLock_
    ) public initializer {
        require(admin != address(0) && vault_ != address(0) && defaultToken_ != address(0), "zero addr");
        require(payFrequencySeconds >= 1 days, "freq too small");
__AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
_grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAYROLL_ADMIN_ROLE, admin);
vault = IPayrollVault(vault_);
        defaultToken = defaultToken_;
        payFrequency = payFrequencySeconds;
        allowDecreaseAfterLock = allowDecreaseAfterLock_;
emit Initialized(admin, vault_, defaultToken_, payFrequencySeconds);
    }
function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
// -----------------------
    // Governance / Parameters
    // -----------------------
    function setVault(address vault_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!rulesLocked, "rules locked");
        require(vault_ != address(0), "vault=0");
        vault = IPayrollVault(vault_);
    }
function setDefaultToken(address token_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!rulesLocked, "rules locked");
        require(token_ != address(0), "token=0");
        defaultToken = token_;
    }
function setPayFrequency(uint64 freq) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!rulesLocked, "rules locked");
        require(freq >= 1 days, "freq too small");
        payFrequency = freq;
    }
// One-way lock: freezes vault, defaultToken, payFrequency
    function freezeRules(bool allowDecreaseAfterLock_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rulesLocked = true;
        allowDecreaseAfterLock = allowDecreaseAfterLock_;
        emit RulesLocked(allowDecreaseAfterLock_);
    }
// -------------
    // Employees API
    // -------------
    function addEmployee(
        address wallet,
        uint256 biweeklyAmount,
        address tokenOverride,    // set 0x0 to use defaultToken
        uint64 startTime          // first due time; e.g., block.timestamp or aligned Friday
    ) external onlyRole(PAYROLL_ADMIN_ROLE) {
        require(wallet != address(0), "wallet=0");
        require(biweeklyAmount > 0, "amount=0");
        // tokenOverride can be 0 (use default)
        if (tokenOverride == address(0)) {
            tokenOverride = defaultToken;
        }
employees.push(Employee({
            wallet: wallet,
            token: tokenOverride,
            amount: biweeklyAmount,
            nextPayTime: startTime,
            active: true
        }));
emit EmployeeAdded(employees.length - 1, wallet, biweeklyAmount, tokenOverride, startTime);
    }
function updateEmployee(
        uint256 id,
        address wallet,
        uint256 biweeklyAmount,
        address tokenOverride,
        bool active
    ) external onlyRole(PAYROLL_ADMIN_ROLE) {
        require(id < employees.length, "bad id");
        Employee storage e = employees[id];
if (wallet != address(0)) e.wallet = wallet;
if (biweeklyAmount > 0) {
            if (rulesLocked && !allowDecreaseAfterLock) {
                require(biweeklyAmount >= e.amount, "decrease disallowed");
            }
            e.amount = biweeklyAmount;
        }
if (tokenOverride != address(0)) e.token = tokenOverride;
        e.active = active;
emit EmployeeUpdated(id, e.wallet, e.amount, e.token, e.active);
    }
function employeeCount() external view returns (uint256) { return employees.length; }
function getEmployee(uint256 id) external view returns (Employee memory) {
        require(id < employees.length, "bad id");
        return employees[id];
    }
// ------------------------
    // Payroll Processing (batch)
    // ------------------------
    /**
     * Process up to maxCount employees that are due. Anyone can call.
     * Designed for Chainlink Automation, crons, or manual triggers.
     */
    function processPayroll(uint256 maxCount) public whenNotPaused nonReentrant returns (uint256 processed) {
        require(maxCount > 0, "maxCount=0");
        uint256 len = employees.length;
        if (len == 0) return 0;
uint256 i = lastProcessedIndex;
        uint256 end = i + len; // ensures single full cycle max
while (processed < maxCount && i < end) {
            uint256 idx = i % len;
            Employee storage e = employees[idx];
if (e.active && block.timestamp >= e.nextPayTime && e.wallet != address(0) && e.amount > 0) {
                address token_ = e.token == address(0) ? defaultToken : e.token;
                uint256 bal = vault.balanceOf(token_);
                if (bal >= e.amount) {
                    // transfer
                    vault.transferFromVault(token_, e.wallet, e.amount);
                    // schedule next period
                    e.nextPayTime = uint64(e.nextPayTime + payFrequency);
                    emit PayoutExecuted(idx, e.wallet, token_, e.amount, uint64(block.timestamp));
                    processed++;
                } else {
                    // Skip but keep due; will retry next call when funded
                    emit PayoutSkippedInsufficientFunds(idx, token_, e.amount, bal);
                }
            }
            i++;
        }
lastProcessedIndex = i % (len == 0 ? 1 : len);
        return processed;
    }
// ------------------------------
    // Chainlink Automation interface
    // ------------------------------
    function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData) {
        uint256 len = employees.length;
        if (len == 0) return (false, bytes(""));
uint256 due = 0;
        uint256 scanned = 0;
        uint256 i = lastProcessedIndex;
        uint256 end = i + len;
while (i < end && scanned < 50) { // cap view loop cost
            uint256 idx = i % len;
            Employee storage e = employees[idx];
            if (e.active && block.timestamp >= e.nextPayTime && e.wallet != address(0) && e.amount > 0) {
                due++;
                if (due >= 1) break; // at least one due is enough signal
            }
            scanned++;
            i++;
        }
return (due > 0, abi.encode(uint256(25))); // ask to process up to 25 in performUpkeep
    }
function performUpkeep(bytes calldata data) external {
        uint256 maxCount = abi.decode(data, (uint256));
        if (maxCount == 0) maxCount = 25;
        processPayroll(maxCount);
    }
// ------------
    // Safety hooks
    // ------------
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}
