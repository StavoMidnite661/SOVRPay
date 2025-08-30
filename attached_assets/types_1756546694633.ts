export type PayPreference = "ACH" | "ONCHAIN";
export interface EmployeeBank {
  employeeId: number;          // on-chain Employee index
  name: string;                // NACHA Individual Name
  individualId: string;        // internal employee code for NACHA
  routingNumber: string;       // 9 digits
  accountNumber: string;       // up to 17 chars
  accountType: "CHECKING" | "SAVINGS";
  payPreference: PayPreference; // "ACH" => include in .ach
}
export interface PayoutEvent {
  employeeId: number;
  wallet: string;
  token: string;
  amountBaseUnits: string; // from chain (string for bigints)
  payTime: number;         // unix
}
export interface ConversionRule {
  token: string;          // ERC20 address
  decimals: number;       // e.g., 6 for USDC
  mode: "STABLE_1TO1" | "ORACLE";
}
