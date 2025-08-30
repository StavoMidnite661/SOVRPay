export type JournalEntry = {
  ts: string;
  memo: string;
  lines: { account: string; dc: "D" | "C"; amountCents: number; entity: "TRUST" | "LLC" }[];
};
export async function postJE(j: JournalEntry) {
  // TODO: persist to GL database
  console.log("JE:", JSON.stringify(j, null, 2));
}
