import React from "react";
import { motion } from "framer-motion";
import { Check, Shield, Code2, Wallet, Cpu, Layers, Link2, Rocket, ArrowRight } from "lucide-react";

// Drop this file into a Next.js / React app. It assumes Tailwind CSS is configured.
// If you're using Next.js App Router, place as app/(marketing)/role/page.tsx and export default.
// Otherwise, render <RoleLandingPage /> anywhere.

const bullets = [
  { icon: <Code2 className="w-5 h-5" />, title: "Architect Smart Contracts", text: "Design, test, and ship Solidity/Vyper for tokens, vaults, staking, governance, and RWA bridges." },
  { icon: <Wallet className="w-5 h-5" />, title: "Full-Stack dApps", text: "Build Next.js UIs, wallet flows with Wagmi/ethers, and seamless API backends." },
  { icon: <Link2 className="w-5 h-5" />, title: "Real-World Integrations", text: "Connect on-chain finance to Stripe, Coinbase, ACH, and banking APIs." },
  { icon: <Shield className="w-5 h-5" />, title: "Security First", text: "Auditable code, fuzzing, static analysis, and governance/timelock controls by default." },
];

const stack = [
  { label: "Solidity", cat: "Smart Contracts" },
  { label: "Hardhat / Foundry", cat: "Smart Contracts" },
  { label: "OpenZeppelin", cat: "Smart Contracts" },
  { label: "Chainlink", cat: "Oracles" },
  { label: "Ethereum / Polygon", cat: "L1/L2" },
  { label: "Next.js / React", cat: "Frontend" },
  { label: "Wagmi / viem / ethers", cat: "Wallet" },
  { label: "Node.js / FastAPI", cat: "Backend" },
  { label: "GraphQL / REST", cat: "APIs" },
  { label: "IPFS", cat: "Infra" },
  { label: "Docker / CI", cat: "Ops" },
  { label: "Slither / Fuzzing", cat: "Security" },
];

const responsibilities = [
  "Own protocol architecture across smart contracts, off-chain services, and UI.",
  "Design DeFi primitives: vaults, liquidity, staking, credit flows, governance.",
  "Integrate payments, identity, and settlement rails with secure bridges.",
  "Instrument testing: unit, property-based, fuzz; enforce audit-ready practices.",
  "Ship end-to-end: from testnet prototypes to production mainnet deployments.",
];

const traits = [
  "You think in systems and edge-cases.",
  "You translate financial logic into battle-tested smart contracts.",
  "You love clean UX that masks complexity but preserves sovereignty.",
  "You’re comfortable bridging Web2 + Web3 with taste and rigor.",
];

export default function RoleLandingPage() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 selection:bg-cyan-400/30">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(34,211,238,0.15),rgba(167,139,250,0.08)_40%,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium ring-1 ring-white/10">
              <Cpu className="w-3.5 h-3.5" /> Lead Role • Web3
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Lead Smart Contract & DeFi <span className="text-cyan-400">Systems Architect</span>
            </h1>
            <p className="mt-5 text-lg text-zinc-300">
              Where Web3 engineering meets real-world finance. Architect smart contracts, ship full-stack dApps, and weave decentralized rails into modern payments.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-zinc-900 font-semibold shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/30 transition"
              >
                Start the Conversation <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#details" className="rounded-2xl px-5 py-3 ring-1 ring-white/10 hover:bg-white/5 transition">Explore the Role</a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Value props */}
      <section id="details" className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {bullets.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center gap-3 text-cyan-300">{b.icon}<span className="font-semibold">{b.title}</span></div>
              <p className="mt-3 text-sm text-zinc-300">{b.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About the role */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8">
          <div className="flex items-start gap-4">
            <Layers className="w-6 h-6 text-cyan-300 shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold">About the Role</h2>
              <p className="mt-3 text-zinc-300">
                This isn’t a token-drop gig. It’s end-to-end finance: you’ll design DeFi protocols, build production smart contracts, stitch in payment rails, and 
                ship UX that feels like fintech while remaining credibly neutral and self-custodial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsibilities & Traits */}
      <section className="mx-auto max-w-7xl px-6 py-12 grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h3 className="text-xl font-semibold flex items-center gap-2"><Rocket className="w-5 h-5 text-cyan-300"/>What You’ll Do</h3>
          <ul className="mt-5 space-y-3">
            {responsibilities.map((r) => (
              <li key={r} className="flex gap-3"><Check className="w-5 h-5 text-cyan-300 shrink-0"/><span className="text-zinc-300">{r}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-white/5">
          <h3 className="text-xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-300"/>Who Thrives Here</h3>
          <ul className="mt-5 space-y-3">
            {traits.map((t) => (
              <li key={t} className="flex gap-3"><Check className="w-5 h-5 text-cyan-300 shrink-0"/><span className="text-zinc-300">{t}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stack */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-6 flex items-center gap-3">
          <Code2 className="w-5 h-5 text-cyan-300" />
          <h3 className="text-xl font-semibold">Core Stack</h3>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stack.map((s, i) => (
            <motion.div
              key={s.label + i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="text-sm text-zinc-200">{s.label}</div>
              <div className="text-xs text-zinc-400">{s.cat}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="apply" className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/10 to-transparent p-8">
          <h3 className="text-2xl font-semibold">Build the rails of the next financial era.</h3>
          <p className="mt-3 text-zinc-300">Send a note with links (GitHub, deployments, audits). If you’ve shipped a protocol or integrated real payment rails, we want to talk.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="mailto:talent@sovr.empire?subject=Lead%20Smart%20Contract%20%26%20DeFi%20Systems%20Architect" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-zinc-900 font-semibold shadow-lg hover:shadow-cyan-400/30 transition">
              Email Your Portfolio <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/king-ram-rune" className="rounded-2xl px-5 py-3 ring-1 ring-white/10 hover:bg-white/5 transition">See a Live dApp</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-zinc-400 flex flex-wrap items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} SOVR Empire — Sovereignty by Design.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-zinc-200">Privacy</a>
            <a href="#" className="hover:text-zinc-200">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
