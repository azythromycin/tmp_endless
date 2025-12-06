'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, ArrowUpRight, Layers3 } from 'lucide-react'
import { MacbookScroll } from '@/components/ui/macbook-scroll'
import { WorldMapDemo } from '@/components/ui/world-map-demo'

const pillars = [
  {
    title: 'Living Ledger',
    description: 'Financial models that refresh with every micro signal. Journals, automations, and AI reconciliations in one canvas.',
    icon: Layers3
  },
  {
    title: 'Neural Copilot',
    description: 'Contextual AI that reads your entire chart and translates it into insight, strategy, and proactive action items.',
    icon: Sparkles
  },
  {
    title: 'Unified Surfaces',
    description: 'Modern workflows that blend accounting, planning, and collaboration so your team moves like a single organism.',
    icon: Zap
  }
]

const milestones = [
  { date: '2022 → 2023', title: 'Foundational OS', body: 'Built the Endless data fabric powering real time ledgers and streaming KPIs.' },
  { date: '2024', title: 'AI-native Accounting', body: 'Launched Copilot experiences that pair your books with market intelligence instantly.' },
  { date: '2025', title: 'Endless Moments', body: 'Introducing the fully immersive finance OS — not pages or apps, but a living ecosystem.' }
]

const macStatCards = [
  { label: 'Total Income', value: '$540K', delta: '+$62K vs plan' },
  { label: 'Net Position', value: '$182K', delta: '+4.3% stability' },
  { label: 'Runway', value: '18 months', delta: 'Burn smoothed' }
]

const macChips = ['Ledger sync', 'AI sense', 'Market feed']

const macMoments = [
  { title: 'Copilot insight', detail: 'Variance tightened after vendor renegotiation.', badge: 'AI' },
  { title: 'Ledger event', detail: 'Autopilot reconciled 42 vendors minutes ago.', badge: 'Autopilot' },
  { title: 'Signal alert', detail: 'Collections pacing at 99.3% — all clear.', badge: 'Signal' }
]

const macSparkline = [18, 45, 30, 72, 40, 88, 50, 95, 60, 78]

const heroStats = [
  { label: 'Countries live', value: '42' },
  { label: 'Transactions orchestrated', value: '120B+' },
  { label: 'Moments captured', value: '∞' }
]

const EndlessMomentScreen = () => (
  <div className="flex h-full w-full flex-col gap-3 rounded-[22px] border border-white/10 bg-gradient-to-br from-[#070511] via-[#10172c] to-[#211033] p-4 text-white">
    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-white/60">
      <span>Moment playback</span>
      <span className="rounded-full border border-white/20 px-3 py-0.5 text-[9px]">Live sync</span>
    </div>
    <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.4em] text-white/60">
      {macChips.map(chip => (
        <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          {chip}
        </span>
      ))}
    </div>
    <div className="flex flex-1 gap-3 text-[11px]">
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.35),_transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="text-center space-y-1">
            <p className="uppercase tracking-[0.35em] text-white/40">Live burn</p>
            <p className="text-3xl font-semibold text-white">-$98K/mo</p>
            <p className="text-[10px] text-emerald-300">6% softer vs last quarter</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {macStatCards.map((stat, idx) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-white/10 bg-white/5 p-3 ${idx === macStatCards.length - 1 ? 'col-span-2' : ''}`}
              >
                <p className="uppercase tracking-[0.3em] text-white/40">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                <p className="text-[10px] text-emerald-300">{stat.delta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-48 rounded-3xl border border-white/10 bg-white/5 p-4 space-y-2">
        <p className="uppercase tracking-[0.3em] text-white/40">Moments</p>
        {macMoments.map(moment => (
          <div key={moment.title} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-1">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/40">{moment.badge}</span>
            <p className="font-semibold text-white/90">{moment.title}</p>
            <p className="text-white/70 text-[11px]">{moment.detail}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px]">
      <div className="flex items-center justify-between text-white/50">
        <span>Signal beam</span>
        <span className="text-fuchsia-200">+18% lift</span>
      </div>
      <div className="mt-2 flex h-14 items-end gap-1">
        {macSparkline.map((height, idx) => (
          <div key={idx} className="flex-1 rounded-full bg-gradient-to-t from-fuchsia-500/40 via-indigo-400/60 to-cyan-300" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  </div>
)

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-96 w-96 bg-fuchsia-500/40 blur-[200px]" />
        <div className="absolute top-0 right-0 h-80 w-80 bg-cyan-400/30 blur-[180px]" />
        <div className="absolute bottom-10 left-10 h-72 w-72 bg-emerald-400/20 blur-[160px]" />
      </div>

      <div className="relative z-10 px-6 lg:px-16 py-16 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]"
        >
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">Meet Endless Moments</p>
            <h1 className="text-5xl lg:text-6xl font-semibold leading-tight">
              The <span className="text-fuchsia-300">operating system</span> for finance orchestration.
            </h1>
            <p className="text-lg text-white/70">
              Not pages, not stitched-together books. Endless Moments fuses ledgers, automations, AI copilots, and market telemetry into a single
              living surface so every decision, workflow, and entry feels cinematic.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-sm font-semibold">
                Launch Moment <ArrowUpRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:text-white">
                Watch manifesto
              </button>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Operating footprint</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {heroStats.map(stat => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.4em] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Every ledger, workflow, approval, and Copilot insight stays synchronized across the Endless network.
            </p>
          </div>
        </motion.div>

        <div className="relative">
          <MacbookScroll
            showGradient
            title={
              <>
                Endless OS breathes through every surface.<br />Scroll to open the command deck.
              </>
            }
            badge={
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.4em] text-white/60">
                Live • Endless
              </div>
            }
            screenContent={<EndlessMomentScreen />}
          />
        </div>

        <WorldMapDemo />

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl space-y-4"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500/60 to-indigo-500/60 flex items-center justify-center">
                <pillar.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">{pillar.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-3xl p-10 space-y-8"
        >
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Timeline</p>
            <h2 className="text-3xl font-semibold text-white">The evolution of Endless Moments</h2>
            <p className="text-white/70 text-sm">
              Each release folds more of the finance stack into a single OS—from the data fabric, to AI copilots, to an immersive execution layer.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {milestones.map(milestone => (
              <div key={milestone.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">{milestone.date}</p>
                <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
                <p className="text-white/70 text-sm">{milestone.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
