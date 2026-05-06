import { useEffect, useState } from 'react'
import { PlaygroundHeroCanvas } from './components/playground-hero-canvas'

const HERMES_REPO_URL = 'https://github.com/outsourc-e/hermes-workspace'
const HERMES_ROADMAP_URL = 'https://github.com/outsourc-e/hermes-workspace/blob/main/docs/hermesworld/master-roadmap.md'
const HERMES_FEATURES_URL = 'https://github.com/outsourc-e/hermes-workspace/blob/main/FEATURES-INVENTORY.md'

const externalLinkProps = { target: '_blank', rel: 'noreferrer' }

const HERMES_DISCORD_URL = 'https://discord.com/invite/agentd'
const HERMES_TWITTER_URL = 'https://twitter.com/hermesworldai'

function resolvePlayTarget(): string {
  if (typeof window === 'undefined') return '/play'
  const override =
    (typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage.getItem('HW_PLAY_TARGET')) ||
    ''
  if (override) return override
  const host = window.location.hostname.toLowerCase()
  // Public marketing host: route to early-access page until standalone is live.
  if (host === 'hermes-world.ai' || host === 'www.hermes-world.ai') {
    return '/early-access'
  }
  return '/play'
}

const trustBadges = [
  { label: 'Open source', detail: 'Apache 2 on GitHub' },
  { label: 'Browser playable', detail: 'Zero install needed' },
  { label: 'Multiplayer presence', detail: 'Live world via Cloudflare' },
  { label: 'Persistent agents', detail: 'Companions, quests, sigils' },
]

const capabilities = [
  { label: 'Persistent World', copy: 'World state keeps moving while agents continue work.', icon: '✦' },
  { label: 'Live Agents', copy: 'Companions follow, plan, craft, scout, and report back.', icon: '◈' },
  { label: 'Zones & Quests', copy: 'Each zone gives humans and agents a place to act.', icon: '◇' },
  { label: 'Memory Progression', copy: 'Agents carry context, unlocks, and completed history.', icon: '◎' },
  { label: 'Hermes Sigils', copy: 'Make invisible agent progress visible and collectible.', icon: '⚚' },
  { label: 'Multiplayer Presence', copy: 'Humans and agents share the same world layer.', icon: '◌' },
]

const zones = [
  {
    name: 'Training Grounds',
    label: 'Starter Zone',
    tone: '#76d88f',
    copy: 'Learn the verbs of the world. Move, talk, equip, travel, and send your first companion on a quest.',
  },
  {
    name: 'Forge',
    label: 'Progression',
    tone: '#ff9f55',
    copy: 'Craft tools for agents. Upgrade companions, shape items, and turn raw progress into better workflows.',
  },
  {
    name: 'Agora',
    label: 'Social Hub',
    tone: '#d9b35f',
    copy: 'The social relay. Meet NPCs, inspect public quests, and watch live activity from humans and agents.',
  },
  {
    name: 'Grove',
    label: 'Memory Zone',
    tone: '#34d399',
    copy: 'A quieter zone for long-term memory, reflection, archived quests, and restoring agent energy.',
  },
  {
    name: 'Oracle',
    label: 'Planning',
    tone: '#a78bfa',
    copy: 'Planning and prophecy. Decompose goals, reveal quest paths, and route work to the right agent.',
  },
  {
    name: 'Arena',
    label: 'Combat Online',
    tone: '#f87171',
    copy: 'Battle, evals, and trials. Test agents in controlled challenges and unlock capabilities through risk.',
  },
]

const party = [
  { name: 'Atlas', role: 'Scout', state: 'Following', tone: '#76d88f' },
  { name: 'Forge', role: 'Builder', state: 'Crafting', tone: '#ff9f55' },
  { name: 'Oracle', role: 'Planner', state: 'Planning', tone: '#a78bfa' },
]

const consoleLines = [
  'move_to("Agora")',
  'talk_to("Quartermaster")',
  'accept_quest("Northern Gate")',
  'equip("Hermes Sigil")',
  'send_agent("Oracle", "plan route")',
  'complete_quest("First Step")',
]

const progression = [
  ['Unlocks', 'Open zones, panes, capabilities, and world systems.'],
  ['Agent Progression', 'Upgrade companion abilities, tools, loadouts, and memory depth.'],
  ['Quests', 'Convert goals into trackable work with receipts and history.'],
  ['Cosmetics & Lore', 'Customize player, companions, banners, and world profile.'],
]

const todayDrops = [
  ['Playable Preview', 'Enter the first public world layer: name your character, join Agora, talk, travel, and play.'],
  ['Public Roadmap', 'The build path from preview world to persistent agent RPG, with graphics and accounts next.'],
  ['Open Source Core', 'Hermes Workspace stays open source while HermesWorld becomes the playable surface.'],
  ['Graphics Sprint', 'Next pass: believable characters, stronger world art, cleaner HUD, and gameplay clips.'],
]

const faqs = [
  ['What is HermesWorld?', 'HermesWorld is a playable layer for Hermes Workspace: a persistent world where humans and AI agents appear as characters, take quests, unlock zones, and show progress visually.'],
  ['Do I need to install Hermes Workspace to play?', 'No. The public game will run directly in your browser from hermes-world.ai. Developers can still run the same world inside Hermes Workspace locally.'],
  ['Is this a finished game?', 'Not yet. This is the first playable preview: multiplayer presence, zones, quests, chat, companions, sigils, and world systems are being built in public.'],
  ['How does saving work?', 'The preview starts with a browser profile. Cloud save and username claiming are next so your character, progress, and unlocks follow you between sessions.'],
  ['Where do AI agents fit in?', 'Agents become visible companions. Instead of being hidden behind chat logs, they can follow you, report work, take quests, and eventually act inside the world.'],
  ['Can I contribute?', 'Yes. Hermes Workspace is open source on GitHub, and HermesWorld is being developed in public. Issues, PRs, feedback, and gameplay clips all help.'],
]

function usePlayHref(): string {
  const [target, setTarget] = useState<string>('/play')
  useEffect(() => {
    setTarget(resolvePlayTarget())
  }, [])
  return target
}

export function HermesWorldLanding() {
  const playHref = usePlayHref()
  return (
    <main className="min-h-screen overflow-hidden bg-[#03060a] text-[#f8f3e7] selection:bg-[#d9b35f] selection:text-[#07080d]">
      <HermesBackdrop />
      <Header playHref={playHref} />

      <section className="relative mx-auto grid min-h-[calc(100vh-82px)] w-full max-w-[1560px] items-center gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:pb-18 lg:pt-10">
        <div className="relative z-10 max-w-2xl lg:pl-2">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d9b35f]/30 bg-[#d9b35f]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#f8e4ac] shadow-[0_0_42px_rgba(217,179,95,.12)]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(34,211,238,.95)]" />
            Playable Preview // Persistent Agent World
          </div>

          <h1 className="max-w-[760px] text-balance font-serif text-[clamp(3.6rem,7.5vw,8.4rem)] leading-[0.82] tracking-[-0.075em] text-[#fff6df] drop-shadow-[0_20px_80px_rgba(0,0,0,.65)]">
            Your AI agents.
            A persistent world.
            One portal.
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-[#d7d0bd]/72 sm:text-xl">
            HermesWorld is a persistent multiplayer world where humans and AI agents play side-by-side. Pick a name, enter Agora, take quests, collect Hermes Sigils, and watch your companions keep working between sessions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={playHref} className="group inline-flex items-center justify-center rounded-xl border border-[#ffe7a3]/55 bg-[linear-gradient(180deg,#ffe7a3,#d9a63f)] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#11100b] shadow-[0_30px_90px_rgba(217,179,95,.32),inset_0_1px_0_rgba(255,255,255,.32)] transition hover:-translate-y-0.5 hover:brightness-110">
              ▶ Enter the World <span className="ml-2 transition group-hover:translate-x-1">→</span>
            </a>
            <a href="/reserve" className="inline-flex items-center justify-center rounded-xl border border-[#d9b35f]/35 bg-[#d9b35f]/10 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#f8e4ac] shadow-[0_0_30px_rgba(217,179,95,.08)] transition hover:border-[#d9b35f]/55 hover:bg-[#d9b35f]/16">
              Reserve Name
            </a>
            <a href={HERMES_DISCORD_URL} {...externalLinkProps} className="inline-flex items-center justify-center rounded-xl border border-cyan-100/24 bg-[#0b1118]/82 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-cyan-100/85 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl transition hover:border-cyan-100/55 hover:bg-[#121823]">
              Join Discord
            </a>
            <a href={HERMES_REPO_URL} {...externalLinkProps} className="inline-flex items-center justify-center rounded-xl border border-[#d9b35f]/24 bg-[#0b1118]/78 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#f8e4ac]/85 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl transition hover:border-[#d9b35f]/50 hover:bg-[#121823]">
              View on GitHub
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#bfb49a]/60">
            <span>Browser playable</span>
            <span className="text-[#d9b35f]/55">✦</span>
            <span>No install needed</span>
            <span className="text-[#d9b35f]/55">✦</span>
            <span>Zones, quests, companions</span>
          </div>

          <div className="mt-7 max-w-xl rounded-2xl border border-[#d9b35f]/18 bg-[#05080e]/70 p-4 shadow-[0_20px_70px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d9b35f]/35 bg-[#d9b35f]/12 text-lg shadow-[0_0_28px_rgba(217,179,95,.16)]">🏆</span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d9b35f]/70">Playable preview</div>
                <div className="mt-1 text-sm font-bold leading-5 text-[#fff6df]">Browser-playable today. Believable characters, cloud save, and the launch trailer drop next.</div>
              </div>
            </div>
          </div>
        </div>

        <HeroWorldFrame />
      </section>

      <TrustStrip />
      <CapabilityStrip />
      <TodayDropSection />
      <ZonesSection />
      <AgentsSection />
      <GameplayPreviewSection />
      <SigilsSection />
      <FaqSection />
      <FinalCta playHref={playHref} />
      <Footer />
    </main>
  )
}

function Header({ playHref }: { playHref: string }) {
  return (
    <header className="relative z-30 mx-auto mt-4 flex max-w-[1560px] items-center justify-between border-b border-[#d9b35f]/20 px-4 pb-4 sm:px-6 lg:px-8">
      <a href="/hermes-world" className="flex items-center gap-3">
        <img src="/hermesworld-logo.svg" alt="HermesWorld" className="h-10 w-10 rounded-2xl shadow-[0_0_34px_rgba(34,211,238,.18)]" />
        <div>
          <div className="font-serif text-lg font-bold tracking-[-0.03em] text-[#f8e4ac]">Hermes<span className="text-cyan-200">World</span></div>
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#bfb49a]/46">Persistent Agent RPG</div>
        </div>
      </a>

      <nav className="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.18em] text-[#d7d0bd]/58 md:flex">
        <a href="#world" className="transition hover:text-[#f8e4ac]">World</a>
        <a href="#agents" className="transition hover:text-[#f8e4ac]">Agents</a>
        <a href="#sigils" className="transition hover:text-[#f8e4ac]">Sigils</a>
        <a href="#preview-video" className="transition hover:text-[#f8e4ac]">Preview</a>
        <a href="#faq" className="transition hover:text-[#f8e4ac]">FAQ</a>
        <a href={HERMES_DISCORD_URL} {...externalLinkProps} className="rounded-lg border border-cyan-100/22 bg-cyan-100/10 px-3 py-2 text-cyan-100/82 transition hover:bg-cyan-100/16">Discord</a>
        <a href={playHref} className="rounded-lg border border-[#ffe7a3]/55 bg-[linear-gradient(180deg,#ffe7a3,#d9a63f)] px-4 py-2 font-black text-[#11100b] shadow-[0_0_30px_rgba(217,179,95,.22)] transition hover:brightness-110">▶ Enter</a>
        <a href={HERMES_REPO_URL} {...externalLinkProps} className="rounded-lg border border-[#d9b35f]/30 bg-[#d9b35f]/10 px-4 py-2 text-[#f8e4ac] shadow-[0_0_30px_rgba(217,179,95,.08)] transition hover:bg-[#d9b35f]/18">GitHub</a>
      </nav>
    </header>
  )
}

function HeroWorldFrame() {
  return (
    <div id="preview" className="relative z-10 mx-auto w-full max-w-[930px]">
      <div className="absolute -inset-10 rounded-[4rem] bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,.18),transparent_52%),radial-gradient(circle_at_68%_72%,rgba(167,139,250,.16),transparent_48%)] blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.65rem] border border-[#d9b35f]/34 bg-[#05080e] p-2 shadow-[0_50px_160px_rgba(0,0,0,.72),0_0_80px_rgba(217,179,95,.12)]">
        <div className="flex items-center justify-between border-b border-[#d9b35f]/18 px-3 py-2">
          <div className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <i className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="ml-3 text-[9px] font-black uppercase tracking-[0.24em] text-[#f8e4ac]/70">Live World Preview</span>
          </div>
          <div className="hidden items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200/75 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
            Live World Build
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-[#0a1117]">
          <div className="absolute inset-0">
            <PlaygroundHeroCanvas />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_36%,rgba(3,6,10,.28)_78%),linear-gradient(180deg,rgba(3,6,10,.02),rgba(3,6,10,.62))]" />
          <div className="absolute left-4 top-4 rounded-xl border border-[#d9b35f]/24 bg-[#05080e]/70 px-3 py-2 shadow-2xl backdrop-blur-xl">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f8e4ac]/70">HermesWorld Entry</div>
            <div className="mt-1 text-xs text-[#d7d0bd]/70">Portal online · Zones awakening · Sigils active</div>
          </div>
          <div className="absolute bottom-4 left-4 max-w-[320px] rounded-xl border border-cyan-200/20 bg-[#05080e]/72 p-3 shadow-2xl backdrop-blur-xl">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/72">World State</div>
            <div className="mt-1 text-sm font-bold text-[#fff6df]">Agents need a world they can inhabit.</div>
            <div className="mt-1 text-xs leading-5 text-[#d7d0bd]/58">Persistent zones, believable characters, cleaner quests, stronger atmosphere.</div>
          </div>
          <div className="absolute bottom-4 right-4 hidden rounded-xl border border-violet-200/20 bg-[#05080e]/70 p-3 text-xs text-[#d7d0bd]/62 shadow-2xl backdrop-blur-xl sm:block">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-100/72">Launch Focus</div>
            <div className="mt-1">Agora believable</div>
            <div>Character pipeline</div>
            <div>Graphics + HUD pass</div>
          </div>
        </div>
      </div>
    </div>
  )
}


function TrustStrip() {
  return (
    <section className="relative mx-auto max-w-[1560px] px-4 pb-2 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-2 rounded-2xl border border-[#d9b35f]/16 bg-[#04080d]/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        {trustBadges.map((badge) => (
          <div key={badge.label} className="flex items-center gap-3 px-3 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d9b35f]/30 bg-[#d9b35f]/10 text-[#f8e4ac] shadow-[0_0_18px_rgba(217,179,95,.18)]">✪</span>
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f8e4ac]">{badge.label}</div>
              <div className="text-[11px] text-[#d7d0bd]/55">{badge.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CapabilityStrip() {
  return (
    <section className="relative mx-auto max-w-[1560px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-2xl border border-[#d9b35f]/20 bg-[#071018]/76 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_100px_rgba(0,0,0,.38)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-6">
        {capabilities.map((capability) => (
          <div key={capability.label} className="border-b border-r border-[#d9b35f]/12 p-5 last:border-r-0 sm:min-h-36 lg:border-b-0">
            <div className="mb-3 text-2xl text-[#d9b35f] drop-shadow-[0_0_18px_rgba(217,179,95,.3)]">{capability.icon}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.17em] text-[#f8e4ac]">{capability.label}</div>
            <p className="mt-2 text-xs leading-5 text-[#d7d0bd]/52">{capability.copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TodayDropSection() {
  return (
    <section id="today" className="relative mx-auto max-w-[1560px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-[#d9b35f]/24 bg-[radial-gradient(circle_at_18%_0%,rgba(217,179,95,.2),transparent_34%),linear-gradient(135deg,rgba(7,16,24,.92),rgba(4,7,12,.9))] p-5 shadow-[0_34px_120px_rgba(0,0,0,.42)] sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b35f]/24 bg-[#d9b35f]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#f8e4ac]">
              <span>🏆</span>
              Playable build
            </div>
            <h2 className="mt-4 font-serif text-4xl font-bold leading-[0.92] tracking-[-0.055em] text-[#fff6df] sm:text-5xl lg:text-6xl">
              A browser world for humans and AI agents.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#d7d0bd]/62 sm:text-base">
              Start in the public preview, then watch the world improve in public: cleaner UI, better maps, believable characters, accounts, cloud saves, and real gameplay videos.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {todayDrops.map(([title, copy]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
                <div className="mb-3 h-px w-12 bg-[linear-gradient(90deg,#d9b35f,transparent)]" />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#f8e4ac]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#d7d0bd]/54">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ZonesSection() {
  return (
    <section id="world" className="relative mx-auto max-w-[1560px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d9b35f]/70">The world map</div>
        <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.055em] text-[#fff6df] sm:text-6xl">Six zones. One persistent agent world.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#d7d0bd]/58 sm:text-base">Every zone teaches a different part of the agent loop: training, crafting, strategy, memory, prophecy, and evaluation.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {zones.map((zone, index) => (
          <article key={zone.name} className="group overflow-hidden rounded-2xl border border-[#d9b35f]/20 bg-[#071018]/82 p-2 shadow-[0_24px_90px_rgba(0,0,0,.38)] transition hover:-translate-y-1 hover:border-[#d9b35f]/38">
            <div className="relative h-48 overflow-hidden rounded-xl bg-[#0c1415]" style={{ boxShadow: `inset 0 0 100px ${zone.tone}22` }}>
              <ZoneDiorama index={index} tone={zone.tone} />
              <div className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/42 px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/65 backdrop-blur">{zone.label}</div>
            </div>
            <div className="p-3">
              <h3 className="font-serif text-2xl font-bold tracking-[-0.035em]" style={{ color: zone.tone }}>{zone.name}</h3>
              <p className="mt-2 text-xs leading-5 text-[#d7d0bd]/56">{zone.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AgentsSection() {
  return (
    <section id="agents" className="relative border-y border-[#d9b35f]/14 bg-[#061016]/72 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/60">Humans + Agents</div>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold tracking-[-0.055em] text-[#fff6df] sm:text-6xl">Your agents live in the world with you.</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#d7d0bd]/62">HermesWorld turns agents into visible companions. They can follow, take quests, report progress, and eventually move through the world on their own.</p>
          <div className="mt-7 grid gap-3 text-sm text-[#d7d0bd]/62 sm:grid-cols-3">
            <InfoPill title="Companions" copy="Roles, memory, and status." />
            <InfoPill title="Takeover" copy="Future agent world actions." />
            <InfoPill title="Offline" copy="Progress continues between visits." />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr]">
          <div className="rounded-2xl border border-[#d9b35f]/18 bg-[#05080e]/78 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#f8e4ac]/62">Your Party</div>
            <div className="space-y-3">
              {party.map((agent) => (
                <div key={agent.name} className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-[#fff6df]">{agent.name}</div>
                      <div className="text-xs text-[#d7d0bd]/45">{agent.role}</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl" style={{ background: `${agent.tone}22`, border: `1px solid ${agent.tone}66`, boxShadow: `0 0 22px ${agent.tone}22` }} />
                  </div>
                  <div className="mt-3 rounded-lg border border-white/8 bg-black/28 px-3 py-2 text-xs font-bold" style={{ color: agent.tone }}>{agent.state}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-100/16 bg-[#04070c]/82 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/62">Agent Console</div>
            <div className="min-h-[340px] rounded-xl border border-white/8 bg-black/36 p-4 font-mono text-xs leading-7 text-[#bff9ff]/72">
              {consoleLines.map((line) => (
                <div key={line}><span className="text-[#d9b35f]">›</span> {line}</div>
              ))}
              <div className="mt-3 text-[#76d88f]">quest accepted: Open the Northern Gate</div>
              <div className="text-[#a78bfa]">agent route planned: Oracle → Grove → Forge</div>
              <div className="mt-3 animate-pulse text-[#f8e4ac]">▌</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


function GameplayPreviewSection() {
  return (
    <section id="preview-video" className="relative mx-auto max-w-[1560px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] border border-cyan-200/16 bg-[radial-gradient(circle_at_76%_18%,rgba(34,211,238,.16),transparent_34%),#061016] p-5 shadow-[0_38px_130px_rgba(0,0,0,.42)] md:grid-cols-[1.14fr_0.86fr] md:p-8 lg:p-10">
        <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-[#d9b35f]/20 bg-[#03060a] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
          <img src="/hermesworld-world.png" alt="HermesWorld gameplay preview" className="absolute inset-0 h-full w-full object-cover opacity-72" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_24%,rgba(3,6,10,.54)_76%),linear-gradient(180deg,rgba(3,6,10,.08),rgba(3,6,10,.78))]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/42 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur">Gameplay video slot</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#ffe7a3]/52 bg-[#f8e4ac]/16 text-3xl text-[#f8e4ac] shadow-[0_0_70px_rgba(217,179,95,.35)] backdrop-blur-xl">▶</div>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-xl">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f8e4ac]/72">Clip coming after graphics pass</div>
            <div className="mt-1 text-sm leading-6 text-[#fff6df]">We are polishing Agora, characters, HUD, and world readability before dropping the main gameplay trailer.</div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/62">How it plays</div>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.055em] text-[#fff6df] sm:text-6xl">Start as a player. Bring agents into the world.</h2>
          <p className="mt-5 text-base leading-8 text-[#d7d0bd]/62">Claim a name, customize your character, enter the world, meet other builders, complete early quests, and watch your agents become visible companions instead of invisible background processes.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <InfoPill title="1. Claim a name" copy="Start instantly in-browser. Cloud save comes next." />
            <InfoPill title="2. Enter Agora" copy="Meet NPCs, players, companions, and live world events." />
            <InfoPill title="3. Progress" copy="Complete quests, collect sigils, unlock zones and capabilities." />
            <InfoPill title="4. Build in public" copy="The game, workspace, and agents evolve together." />
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section id="faq" className="relative mx-auto max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d9b35f]/70">FAQ</div>
        <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-bold tracking-[-0.055em] text-[#fff6df] sm:text-6xl">Everything before you enter.</h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <article key={question} className="rounded-2xl border border-[#d9b35f]/16 bg-[#071018]/78 p-5 shadow-[0_22px_80px_rgba(0,0,0,.32)] backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#f8e4ac]">{question}</h3>
            <p className="mt-3 text-sm leading-7 text-[#d7d0bd]/58">{answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SigilsSection() {
  return (
    <section id="sigils" className="relative mx-auto max-w-[1560px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-[2rem] border border-[#d9b35f]/22 bg-[radial-gradient(circle_at_32%_42%,rgba(217,179,95,.22),transparent_34%),#071018] p-5 shadow-[0_40px_140px_rgba(0,0,0,.45)] md:grid-cols-[0.9fr_1.1fr] md:p-8 lg:p-10">
        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.35rem] border border-[#d9b35f]/18 bg-[#04070c]">
          <div className="absolute h-64 w-64 rounded-full bg-[#d9b35f]/20 blur-3xl" />
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-[#d9b35f]/42 bg-[radial-gradient(circle,#f8e4ac_0%,#d9b35f_22%,#4b3516_68%,#120d08_100%)] shadow-[0_0_90px_rgba(217,179,95,.32)]">
            <img src="/hermesworld-logo.svg" alt="Hermes Sigil" className="h-36 w-36 rounded-[2rem] shadow-[0_0_40px_rgba(34,211,238,.18)]" />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d9b35f]/72">In-world progression</div>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.055em] text-[#fff6df] sm:text-6xl">Collect Hermes Sigils as you unlock the world.</h2>
          <p className="mt-5 text-base leading-8 text-[#d7d0bd]/62">Hermes Sigils are progression artifacts earned through quests, agent upgrades, world exploration, and system mastery. They make invisible agent progress visible.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {progression.map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-[#d9b35f]/14 bg-black/20 p-4">
                <div className="text-sm font-black uppercase tracking-[0.16em] text-[#f8e4ac]">{title}</div>
                <p className="mt-2 text-xs leading-5 text-[#d7d0bd]/54">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCta({ playHref }: { playHref: string }) {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,6,10,.18),#03060a),url('/hermesworld-world.png')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(217,179,95,.2),transparent_42%),linear-gradient(90deg,#03060a_0%,rgba(3,6,10,.58)_50%,#03060a_100%)]" />
      <div className="mx-auto max-w-[880px] rounded-[2rem] border border-[#d9b35f]/24 bg-[#05080e]/78 p-8 text-center shadow-[0_40px_140px_rgba(0,0,0,.52)] backdrop-blur-xl sm:p-12">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/62">Enter the world</div>
        <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.055em] text-[#fff6df] sm:text-6xl">Build with agents in a world, not a chat box.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#d7d0bd]/62">Enter HermesWorld and explore the first playable layer of Hermes Workspace: zones, quests, companions, sigils, and persistent agent progression.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={playHref} className="rounded-xl border border-[#ffe7a3]/55 bg-[linear-gradient(180deg,#ffe7a3,#d9a63f)] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#11100b] shadow-[0_30px_80px_rgba(217,179,95,.32),inset_0_1px_0_rgba(255,255,255,.32)] transition hover:-translate-y-0.5 hover:brightness-110">▶ Enter the World</a>
          <a href={HERMES_DISCORD_URL} {...externalLinkProps} className="rounded-xl border border-cyan-100/22 bg-cyan-100/8 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-cyan-100/85 transition hover:bg-cyan-100/14">Join Discord</a>
          <a href={HERMES_REPO_URL} {...externalLinkProps} className="rounded-xl border border-white/12 bg-white/[0.055] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/78 transition hover:bg-white/[0.1]">View GitHub</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1560px] flex-col gap-4 border-t border-[#d9b35f]/14 px-4 py-8 text-xs text-[#d7d0bd]/42 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <div className="flex items-center gap-3">
        <img src="/hermesworld-logo.svg" alt="HermesWorld" className="h-8 w-8 rounded-xl" />
        <span className="font-serif text-base text-[#f8e4ac]">Hermes<span className="text-cyan-200">World</span></span>
      </div>
      <div className="flex flex-wrap gap-4 uppercase tracking-[0.16em]">
        <a href={HERMES_REPO_URL} {...externalLinkProps} className="hover:text-[#f8e4ac]">GitHub</a>
        <a href={HERMES_ROADMAP_URL} {...externalLinkProps} className="hover:text-[#f8e4ac]">Roadmap</a>
        <a href={HERMES_FEATURES_URL} {...externalLinkProps} className="hover:text-[#f8e4ac]">Feature List</a>
        <a href="#faq" className="hover:text-[#f8e4ac]">FAQ</a>
      </div>
    </footer>
  )
}

function InfoPill({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-[#d9b35f]/14 bg-[#05080e]/42 p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f8e4ac]">{title}</div>
      <div className="mt-2 text-xs leading-5 text-[#d7d0bd]/50">{copy}</div>
    </div>
  )
}

function ZoneDiorama({ tone, index }: { tone: string; index: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.22))]">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[#1d392a]" />
      <div className="absolute left-1/2 top-[64%] h-36 w-56 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[42%] bg-[#31492f] shadow-[0_28px_60px_rgba(0,0,0,.48)]" />
      <div className="absolute left-[18%] top-[58%] h-8 w-40 rotate-[-10deg] rounded-full bg-[#caa65c]/76" />
      <div className="absolute left-[42%] top-[34%] h-20 w-20 rounded-full border-4" style={{ borderColor: tone, boxShadow: `0 0 34px ${tone}` }} />
      <div className="absolute left-[43%] top-[47%] h-12 w-14 rounded bg-[#e8d2a4] shadow-lg"><div className="absolute -top-4 h-6 w-16 -translate-x-1 rounded-sm" style={{ background: index % 2 ? '#7f1d1d' : '#1d4d7f' }} /></div>
      <div className="absolute left-[62%] top-[52%] h-9 w-9 rounded-full bg-[#f8e4ac] shadow-[0_0_28px_rgba(248,228,172,.35)]" />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute h-8 w-8 rounded-[34%] bg-[#246b44] shadow-lg" style={{ left: `${5 + ((i * 17 + index * 9) % 88)}%`, top: `${10 + ((i * 29 + index * 11) % 72)}%` }} />
      ))}
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 52% 42%, ${tone}20, transparent 42%)` }} />
    </div>
  )
}

function HermesBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#071018_0%,#03060a_54%,#020305_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(217,179,95,.16),transparent_30%),radial-gradient(circle_at_72%_8%,rgba(34,211,238,.14),transparent_32%),radial-gradient(circle_at_84%_72%,rgba(167,139,250,.14),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(248,228,172,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(248,228,172,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle_at_center,rgba(248,228,172,.45)_1px,transparent_1px)] [background-size:42px_42px]" />
    </div>
  )
}
