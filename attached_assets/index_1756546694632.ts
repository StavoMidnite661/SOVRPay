import dayjs from "dayjs";
import { subscribePayouts } from "./chain";
import { buildPPDFile, mapAccountTypeToCode } from "./nacha";
import { getEmployeeBank } from "./db";
import { postJE } from "./ledger";
import { submitLocal } from "./bank";
const batchEntries: any[] = []; // pending ACH entries for next window
let traceSeq = 1;
function convertToCents(token: string, amountBaseUnits: string, decimals: number, mode: "STABLE_1TO1" | "ORACLE"): number {
  // Assume 1:1 stablecoin default
  if (mode === "STABLE_1TO1") {
    // baseUnits / 10^decimals = units; * 100 = cents
    const asBig = BigInt(amountBaseUnits);
    const scaled = Number(asBig) / (10 ** decimals);
    return Math.round(scaled * 100);
  }
  // If oracle mode: TODO get price
  throw new Error("ORACLE conversion not implemented here");
}
async function onPayout(e: any) {
  // Resolve bank info
  const bank = await getEmployeeBank(e.employeeId);
  if (!bank || bank.payPreference !== "ACH") return; // skip non-ACH
  // Convert token units -> cents (assume USDC 6 decimals stable 1:1)
  const amountCents = convertToCents(e.token, e.amountBaseUnits, 6, "STABLE_1TO1");
  batchEntries.push({
    transactionCode: mapAccountTypeToCode(bank.accountType),
    rdfiRouting: bank.routingNumber,
    dfiAccount: bank.accountNumber,
    amountCents,
    individualId: bank.individualId,
    individualName: bank.name.toUpperCase().slice(0, 22),
    addenda: 0,
    traceSeq: traceSeq++,
  });
  // Journal entry (LLC payroll expense; trust intercompany optional)
  await postJE({
    ts: new Date().toISOString(),
    memo: `Payroll ACH queued for employee #${e.employeeId}`,
    lines: [
      { account: "6000-Payroll-Expense", dc: "D", amountCents, entity: "LLC" },
      { account: "2100-ACH-Clearing",    dc: "C", amountCents, entity: "LLC" },
    ],
  });
}
async function flushNachaIfCutoff() {
  // Example: run at 3pm PT on business days. Here we force a build every 30 min for demo.
  if (batchEntries.length === 0) return;
  const hdr = {
    immediateDest: process.env.IMMEDIATE_DEST!,
    immediateOrigin: process.env.IMMEDIATE_ORIGIN!,
    destName: process.env.DEST_NAME!,
    originName: process.env.ORIGIN_NAME!,
    fileIdMod: process.env.FILE_ID_MOD || "A",
  };
  const eff = dayjs().add(1, "day").format("YYMMDD");
  const batch = {
    companyName: process.env.COMPANY_NAME!,
    companyId: process.env.COMPANY_ID!,
    entryDesc: process.env.ENTRY_DESC || "PAYROLL",
    effectiveDateYYMMDD: eff,
    odfiId8: process.env.ODFI_ID8!,
    serviceClass: "200" as const,
    secCode: "PPD" as const,
    entries: batchEntries.splice(0),
  };
  const txt = buildPPDFile(hdr, [batch]);
  const tag = `${dayjs().format("YYYYMMDD_HHmm")}`;
  const res = await submitLocal(txt, tag);
  // JE: move ACH-Clearing to Cash when settlement confirmed (separate webhook)
  console.log("NACHA file created:", res);
}
async function main() {
  subscribePayouts(process.env.RPC_URL!, process.env.ENGINE_ADDRESS!, onPayout);
  // naive scheduler
  setInterval(flushNachaIfCutoff, 30 * 60 * 1000);
  console.log("NACHA Adapter listening for PayoutExecuted...");
}
main().catch(console.error);
