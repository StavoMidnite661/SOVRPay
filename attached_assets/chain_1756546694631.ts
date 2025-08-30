import { ethers } from "ethers";
import { PayoutEvent } from "./types";
export function makeEngineInterface() {
  return new ethers.utils.Interface([
    "event PayoutExecuted(uint256 indexed id, address indexed wallet, address token, uint256 amount, uint64 payTime)"
  ]);
}
export function subscribePayouts(rpc: string, engine: string, onPayout: (e: PayoutEvent) => Promise<void>) {
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const iface = makeEngineInterface();
  provider.on({ address: engine, topics: [iface.getEventTopic("PayoutExecuted")] }, async (log) => {
    const parsed = iface.parseLog(log);
    const [id, wallet, token, amount, payTime] = parsed.args;
    await onPayout({
      employeeId: Number(id.toString()),
      wallet,
      token,
      amountBaseUnits: amount.toString(),
      payTime: Number(payTime.toString()),
    });
  });
  return () => provider.removeAllListeners(engine);
}
