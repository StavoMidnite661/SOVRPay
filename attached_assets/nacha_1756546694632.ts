import dayjs from "dayjs";
function padLeft(s: string, len: number, ch = "0") { return s.padStart(len, ch); }
function padRight(s: string, len: number, ch = " " ) { return s.padEnd(len, ch); }
function onlyDigits(s: string) { return s.replace(/\D/g, ""); }
export type NachaEntry = {
  transactionCode: "22" | "32"; // 22 checking credit, 32 savings credit
  rdfiRouting: string;          // 9 digits
  dfiAccount: string;           // up to 17
  amountCents: number;          // integer cents
  individualId: string;         // 15
  individualName: string;       // 22
  addenda: 0;                   // no addenda for PPD basic
  traceSeq: number;             // 7-digit seq
};
export type NachaBatch = {
  companyName: string;
  companyId: string;
  entryDesc: string;       // e.g. PAYROLL
  effectiveDateYYMMDD: string;
  odfiId8: string;         // first 8 digits of ODFI
  serviceClass: "200";     // credits only
  secCode: "PPD";
  entries: NachaEntry[];
};
export type NachaFileHeader = {
  immediateDest: string;   // 10 chars: " "+routing(9)
  immediateOrigin: string; // 10 chars
  destName: string;        // 23
  originName: string;      // 23
  fileIdMod: string;       // A..Z
};
export function buildPPDFile(h: NachaFileHeader, b: NachaBatch[]) {
  const now = dayjs();
  const fileDate = now.format("YYMMDD");
  const fileTime = now.format("HHmm");
  const records: string[] = [];
  let totalEntries = 0;
  let totalCredits = 0;
  let entryHashTotal = 0;
  let batchCount = 0;
  // File Header (1)
  records.push([
    "1",
    "01",
    padRight(h.immediateDest, 10),
    padRight(h.immediateOrigin, 10),
    fileDate,
    fileTime,
    h.fileIdMod,
    "094",   // record size
    "10",    // blocking factor
    "1",     // format code
    padRight(h.destName, 23),
    padRight(h.originName, 23),
    padRight("", 8), // reference
  ].join(""));
  for (let i = 0; i < b.length; i++) {
    const batch = b[i];
    batchCount++;
    // Batch Header (5)
    records.push([
      "5",
      "200",                                           // credits only
      padRight(batch.companyName, 16),
      padRight("", 20),                                // discretionary
      padRight(batch.companyId, 10),
      "PPD",
      padRight(batch.entryDesc, 10),
      padRight("", 6),                                 // company descriptive date
      batch.effectiveDateYYMMDD,                       // YYMMDD
      "   ",                                           // julian settlement
      "1",                                             // originator status code
      padLeft(batch.odfiId8, 8),
      padLeft(String(i + 1), 7),
    ].join(""));
    let batchEntryCount = 0;
    let batchHash = 0;
    let batchDebits = 0;
    let batchCredits = 0;
    for (const e of batch.entries) {
      batchEntryCount++;
      totalEntries++;
      const rdfi9 = onlyDigits(e.rdfiRouting);
      const rdfi8 = rdfi9.slice(0, 8);
      const checkDigit = rdfi9.slice(8, 9);
      const amount = padLeft(String(e.amountCents), 10);
      const trace = padLeft(batch.odfiId8, 8) + padLeft(String(e.traceSeq), 7);
      // Entry Detail (6)
      records.push([
        "6",
        e.transactionCode,
        rdfi8,
        checkDigit,
        padRight(e.dfiAccount, 17),
        amount,
        padRight(e.individualId, 15),
        padRight(e.individualName, 22),
        "  ",          // discretionary data
        "0",           // addenda indicator
        trace,
      ].join(""));
      const hashInt = parseInt(rdfi8, 10);
      if (!Number.isNaN(hashInt)) {
        batchHash += hashInt;
        entryHashTotal += hashInt;
      }
      batchCredits += e.amountCents;
      totalCredits += e.amountCents;
    }
    // Batch Control (8)
    records.push([
      "8",
      "200",
      padLeft(String(batchEntryCount), 6),
      padLeft(String(batchHash % 10_000_000_000), 10),
      padLeft(String(batchDebits), 12),
      padLeft(String(batchCredits), 12),
      padRight(batch.companyId, 10),
      padRight("", 19),
      padLeft(batch.odfiId8, 8),
      padLeft(String(i + 1), 7),
    ].join(""));
  }
  // File Control (9)
  const recordCount = records.length + 1; // include this 9 record
  const blocks = Math.ceil(recordCount / 10);
  // pad to a multiple of 10 with 9 records
  while ((records.length + 1) % 10 !== 0) {
    records.push(padRight("9", 94, "9"));
  }
  const fileControl = [
    "9",
    padLeft(String(batchCount), 6),
    padLeft(String(blocks), 6),
    padLeft(String(totalEntries), 8),
    padLeft(String(entryHashTotal % 10_000_000_000), 10),
    padLeft(String(0), 12),             // total debits
    padLeft(String(totalCredits), 12),  // total credits
    padRight("", 39),
  ].join("");
  records.push(fileControl);
  return records.join("
") + "
";
}
export function mapAccountTypeToCode(t: "CHECKING" | "SAVINGS"): "22" | "32" {
  return t === "CHECKING" ? "22" : "32";
}
