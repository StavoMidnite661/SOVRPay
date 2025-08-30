import crypto from "crypto";
import { EmployeeBank } from "./types";
const encKey = Buffer.from(process.env.DB_ENC_KEY!.split(":")[1], "base64");
function enc(data: any) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encKey, iv);
  const encd = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encd]).toString("base64");
}
function dec(b64: string) {
  const buf = Buffer.from(b64, "base64");
  const iv = buf.slice(0, 12);
  const tag = buf.slice(12, 28);
  const data = buf.slice(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encKey, iv);
  decipher.setAuthTag(tag);
  const decd = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  return JSON.parse(decd);
}
// In-memory map (replace with Postgres)
const _bank = new Map<number, string>(); // employeeId -> enc(json)
export async function upsertEmployeeBank(b: EmployeeBank) {
  _bank.set(b.employeeId, enc(b));
}
export async function getEmployeeBank(employeeId: number): Promise<EmployeeBank | null> {
  const v = _bank.get(employeeId);
  return v ? dec(v) as EmployeeBank : null;
}
