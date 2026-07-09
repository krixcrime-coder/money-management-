import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Smart Daily Strategy',
    desc: 'Har din ka target aur stop-loss automatically calculate hota hai. 10% se 22% tak dynamic growth rate based on aapke coins.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: '30-Day Timeline',
    desc: 'Poore mahine ka color-coded calendar. Har din ka status ek nazar mein — green (win), red (loss), blue (pending), yellow (recovery).',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: 'Analytics & Charts',
    desc: 'Growth curve, profit/loss bar chart, win rate — sab kuch visual. Samjho kahan galti ho rahi hai aur kahan improvement hai.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
      </svg>
    ),
    title: 'Screenshot Proof',
    desc: 'Har din ka balance screenshot apne folder mein save hoga. Transparency aur accountability ke liye — koi cheat nahi.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Recovery Mode',
    desc: 'Stop-loss hit hone par automatic recovery mode activate. Targets adjust ho jaate hain gradually wapas track pe aane ke liye.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    title: '10 AM Lock System',
    desc: 'Day 2 se aage subah 10 baje se pehle koi action nahi. Impulsive decisions se protection — discipline ka asli test.',
  },
];

const steps = [
  { num: '01', title: 'Register Karen', desc: 'Email se account banao aur apna starting balance enter karo.' },
  { num: '02', title: 'Strategy Follow Karen', desc: 'Har din dashboard kholo — target aur stop-loss already calculated milenge.' },
  { num: '03', title: 'Screenshot Upload Karen', desc: 'Din khatam hone par balance screenshot upload karo aur next day unlock karo.' },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', `${x}%`);
      el.style.setProperty('--my', `${y}%`);
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-background/70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_16px_rgba(59,130,246,0.7)]" />
          </div>
          <span className="text-lg font-bold tracking-widest text-foreground">COINMGMT</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20"
        style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}
      >
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          100 → 10,000 coins in 30 days
        </div>

        {/* Heading */}
        <h1 className="relative z-10 text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-none">
          <span className="text-foreground">Coin Game ki</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
            Discipline App
          </span>
        </h1>

        {/* Subheading */}
        <p className="relative z-10 text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Emotion nahi, <strong className="text-foreground">strategy</strong> chalayegi.
          Har din ka target, stop-loss, aur recovery plan — sab ek jagah.
          <br />
          Coin game jeetna hai toh discipline seekhni hogi.
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link href="/register">
            <Button size="lg" className="px-8 h-14 text-base bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all duration-300">
              🚀 Abhi Shuru Karen
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 h-14 text-base border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur">
              Account Hai? Login Karen →
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 max-w-lg w-full">
          {[
            { val: '30', label: 'Din Ka Plan' },
            { val: '100×', label: 'Growth Target' },
            { val: '0%', label: 'Guesswork' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-primary">{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50 text-xs animate-bounce">
          <span>Neeche dekhein</span>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </section>

      {/* ── WARNING BANNER ── */}
      <section className="px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-start gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
          <span className="text-yellow-400 text-xl mt-0.5">⚠️</span>
          <p className="text-yellow-300/80 text-sm leading-relaxed">
            <strong className="text-yellow-300">Disclaimer:</strong> Yeh app coin game results predict <strong>nahi</strong> karti. Har game outcome random hota hai.
            Yeh sirf coin management aur discipline ke liye ek tool hai. Responsible khelo.
          </p>
        </div>
      </section>

      {/* ── WHAT IT DOES ── */}
      <section className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Kya Karta Hai Yeh Tool</p>
            <h2 className="text-4xl font-bold tracking-tight">Sab kuch ek jagah</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Har cheez jo aapko discipline ke saath khelte rehne ke liye chahiye — strategy se lekar analytics tak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card p-6 group hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              >
                <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {f.icon}
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-semibold tracking-widest uppercase mb-3">Simple 3 Steps</p>
            <h2 className="text-4xl font-bold tracking-tight">Kaise Kaam Karta Hai</h2>
          </div>

          <div className="flex flex-col gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-start gap-6 glass-card p-6">
                <div className="text-4xl font-black text-primary/20 shrink-0 leading-none">{s.num}</div>
                <div>
                  <h3 className="font-semibold text-xl text-foreground mb-2">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block ml-auto shrink-0 text-muted-foreground/20">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COIN MATH EXPLAINER ── */}
      <section className="px-4 py-24">
        <div className="max-w-3xl mx-auto glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Math Samjho</h2>
            <p className="text-muted-foreground mb-8">
              Agar aap har din sirf <strong className="text-foreground">15%</strong> grow karo, toh:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { day: 'Day 1', val: '100' },
                { day: 'Day 7', val: '266' },
                { day: 'Day 15', val: '813' },
                { day: 'Day 30', val: '6,621' },
              ].map((item) => (
                <div key={item.day} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">{item.day}</div>
                  <div className="text-xl font-bold text-primary">{item.val}</div>
                  <div className="text-xs text-muted-foreground">coins</div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Lekin yeh tabhi kaam karta hai jab aap <strong className="text-foreground">har din strategy follow karo</strong> aur stop-loss hit hone par ruk jao.
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Shuru Karo{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Aaj Se
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Registration free hai. Bas email, password, aur starting balance chahiye.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-12 h-14 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
              Free Account Banao
            </Button>
          </Link>
          <div className="mt-6 text-sm text-muted-foreground">
            Pehle se account hai?{' '}
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer">Login karen →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <span className="text-sm font-semibold tracking-widest">COINMGMT</span>
          </div>
          <p className="text-xs text-muted-foreground/50 text-center">
            ⚠️ Yeh app game results predict nahi karti. Sirf discipline tool hai. Responsibly khelo.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/login"><span className="hover:text-foreground cursor-pointer">Login</span></Link>
            <Link href="/register"><span className="hover:text-foreground cursor-pointer">Register</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
