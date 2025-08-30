import fs from "fs";
import path from "path";
export async function submitLocal(nachaText: string, tag: string) {
  const p = path.join(process.cwd(), `payroll_${tag}.ach`);
  fs.writeFileSync(p, nachaText, "utf8");
  return { mode: "LOCAL", path: p };
}
// TODO: add SFTP and gateway API implementations
