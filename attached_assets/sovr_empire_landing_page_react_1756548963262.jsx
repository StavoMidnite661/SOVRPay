import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Crown,
  Cpu,
  Sparkles,
  Landmark,
  Globe,
  Mail,
  ChevronRight,
  QrCode,
  Link as LinkIcon,
} from "lucide-react";

// MAIN LANDING PAGE with sticky nav and icon tiles that deep-link to subpages/sections
export default function SovrEmpireLanding() {
  const [email, setEmail] = useState("");

  function onSubscribe(e) {
    e.preventDefault();
    alert(`Welcome to the Empire, ${email || "citizen"}!`);
    setEmail("");
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 antialiased">
      {/* STICKY NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/10 ring-1 ring-amber-400/30">
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-semibold">SOVR EMPIRE</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
            <a href="#pillars" className="hover:text-white">Pillars</a>
            <a href="#presentment" className="hover:text-white">Presentment</a>
            <a href="#timeline" className="hover:text-white">Timeline</a>
            <a href="#explore" className="hover:text-white">Explore</a>
            <a href="#subscribe" className="rounded-xl border border-white/10 px-3 py-1 hover:bg-white/10">Join</a>
          </nav>
        </div>
      </header>

      {/* HERO (original look & feel) */}
      <section className="relative overflow-hidden">
        {/* Animated radiant backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute -top-32 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </motion.div>

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-28 pb-24 text-center sm:px-8 lg:px-12">
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-widest text-zinc-300/90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sovereign Credit • AI • Trust
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mb-8"
          >
            <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-zinc-900 to-zinc-800 shadow-2xl ring-1 ring-white/10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50"
              />
              <Crown className="h-10 w-10 text-amber-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mx-auto max-w-4xl text-balance text-4xl font-semibold sm:text-5xl md:text-6xl"
          >
            SOVR Development Holdings LLC
            <span className="block bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
              dba SOVR EMPIRE
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-zinc-300"
          >
            Where trust becomes power—and power becomes reality. We engineer private trust frameworks, sovereign credit rails, and AI-driven execution to move value from intent to outcome.
          </motion.p>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" className="rounded-2xl px-6 text-base" onClick={() => document.getElementById('explore')?.scrollIntoView({behavior:'smooth'})}>
              Enter the Empire <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
            <a href="/bridge" className="rounded-2xl">
              <Button size="lg" variant="secondary" className="rounded-2xl bg-white/10 text-zinc-100 hover:bg-white/20">
                Bridge Architecture
              </Button>
            </a>
            <a href="/partnership" className="rounded-2xl">
              <Button size="lg" variant="ghost" className="rounded-2xl text-zinc-300 hover:text-white">
                Partnership Story
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-center gap-2 text-amber-400">
          <div className="h-5 w-1 rounded bg-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-widest">Pillars of the Empire</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Shield className="h-6 w-6" />} title="Trust & Law" desc="Private trust architecture for asset control, protection, and lawful execution." />
          <FeatureCard icon={<Landmark className="h-6 w-6" />} title="Credit & Value" desc="From signature to settlement—sovereign credit rails that power human needs." />
          <FeatureCard icon={<Cpu className="h-6 w-6" />} title="AI Automation" desc="Agents that translate intent into actions across ledgers, APIs, and courts." />
          <FeatureCard icon={<Globe className="h-6 w-6" />} title="Community Impact" desc="Infrastructure that restores dignity: access, abundance, and shared prosperity." />
        </div>
      </section>

      {/* INTERACTIVE QR / PRESENTMENT CONCEPT */}
      <section id="presentment" className="relative border-y border-white/10 bg-gradient-to-b from-zinc-950 to-black">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Trust-Verified Presentment</h2>
            <p className="mt-3 max-w-xl text-zinc-300">Scan, verify, settle. Our QR-based presentment pipes intent through identity, trust rules, and payment gateways to produce real-world outcomes—instantly logged to the Empire Ledger.</p>
            <ul className="mt-6 space-y-3 text-zinc-300">
              <li className="flex items-start gap-3"><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" /><span>Identity-linked QR claims with revocation and replay protection.</span></li>
              <li className="flex items-start gap-3"><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" /><span>Execution across on-chain vaults and off-chain rails (gift cards, ACH, Coinbase).</span></li>
              <li className="flex items-start gap-3"><span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" /><span>Private-by-default with auditable proofs when required.</span></li>
            </ul>
            <div className="mt-7 flex gap-3">
              <a href="/demo"><Button className="rounded-2xl">View Demo</Button></a>
              <a href="/technical-brief"><Button variant="secondary" className="rounded-2xl bg-white/10 hover:bg-white/20">Technical Brief</Button></a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-sm rounded-2xl border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <QrCode className="h-5 w-5" />
                    <span className="text-sm">Empire QR</span>
                  </div>
                  <span className="text-xs text-zinc-400">Live</span>
                </div>
                <div className="my-5 grid place-items-center">
                  <div className="aspect-square w-56 rounded-lg bg-[repeating-linear-gradient(45deg,#000_0_6px,#222_6px_12px)] p-3 ring-1 ring-white/10">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:8px_8px]" />
                  </div>
                </div>
                <p className="text-center text-sm text-zinc-300">Scan to enter. Identity-bound session for secure presentment.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section id="timeline" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-center gap-2 text-amber-400">
          <div className="h-5 w-1 rounded bg-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-widest">From Intent to Outcome</p>
        </div>
        <ol className="relative space-y-8 border-l border-white/10 pl-6">
          {[
            { title: "Declare", body: "Intent expressed and bound to identity. Trust rules selected (purpose, limits, beneficiaries)." },
            { title: "Verify", body: "AI verifies authority, balances, and compliance. Generates a presentment token." },
            { title: "Execute", body: "Settlement routed across vaults and rails. Merchant or beneficiary receives value." },
            { title: "Record", body: "Outcome notarized to the Empire Ledger. Private proofs available on demand." },
          ].map((step, i) => (
            <li key={i} className="ml-2">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-amber-400" />
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-3xl text-zinc-300">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* EXPLORE ICON TILES → other pages */}
      <section id="explore" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-center gap-2 text-amber-400">
          <div className="h-5 w-1 rounded bg-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-widest">Explore the Empire</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="group rounded-2xl border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03]">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 ring-1 ring-amber-400/30">
                  <LinkIcon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold">Web3–Legacy Bridge</h3>
              </div>
              <p className="text-sm text-zinc-300 mb-4">Dive into our universal translator for finance: SWIFT/ISO 20022 ↔︎ Web3 events, DID mapping, and event-sourced audits.</p>
              <div className="flex gap-3">
                <a href="/bridge"><Button className="rounded-xl">Open Page</Button></a>
                <a href="#bridge" className="text-sm text-amber-400 hover:underline">Jump to section</a>
              </div>
            </CardContent>
          </Card>

          <Card className="group rounded-2xl border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03]">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 ring-1 ring-amber-400/30">
                  <LinkIcon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold">Human–AI Partnership</h3>
              </div>
              <p className="text-sm text-zinc-300 mb-4">Read the collaboration story that powers SOVR—vision + architecture + flawless execution.</p>
              <div className="flex gap-3">
                <a href="/partnership"><Button className="rounded-xl">Open Page</Button></a>
                <a href="#partnership" className="text-sm text-amber-400 hover:underline">Jump to section</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section id="subscribe" className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <h2 className="text-2xl font-semibold sm:text-3xl">Become a Citizen of the Empire</h2>
              <p className="mt-2 max-w-2xl text-zinc-300">Early access to the SOVR Wallet + Vault, investor briefings, and launch invites.</p>
            </div>
            <form onSubmit={onSubscribe} className="md:col-span-2">
              <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                <div className="flex grow items-center gap-2 px-3">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@empire.ai" className="border-0 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0" required />
                </div>
                <Button type="submit" className="rounded-xl px-5">Join</Button>
              </div>
              <p className="mt-2 text-xs text-zinc-400">By joining, you agree to receive occasional emails from SOVR EMPIRE.</p>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/10 ring-1 ring-amber-400/30">
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-sm">
              <div className="font-medium">SOVR EMPIRE</div>
              <div className="text-zinc-400">SOVR Development Holdings LLC</div>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm text-zinc-300">
            <a href="#pillars" className="hover:text-white">Pillars</a>
            <a href="#presentment" className="hover:text-white">Presentment</a>
            <a href="#timeline" className="hover:text-white">Timeline</a>
            <a href="#explore" className="hover:text-white">Explore</a>
          </nav>
          <div className="text-xs text-zinc-500">© 2025 SOVR Development Holdings LLC dba SOVR EMPIRE. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Card className="rounded-2xl border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03]">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 ring-1 ring-amber-400/30">
            <span className="text-amber-400">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-zinc-300">{desc}</p>
      </CardContent>
    </Card>
  );
}
