"use client";

import { useEffect, useRef, useState } from "react";

const sectionNames = [
  "Cover",
  "Problem",
  "Why now",
  "Current hardware",
  "The gap",
  "Solution",
  "First shots",
  "Business and ask",
];

function DroneGlyph({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "deck-drone deck-drone-small" : "deck-drone"} aria-hidden="true">
      <span className="deck-drone-axis axis-a" />
      <span className="deck-drone-axis axis-b" />
      <i className="deck-rotor rotor-a" />
      <i className="deck-rotor rotor-b" />
      <i className="deck-rotor rotor-c" />
      <i className="deck-rotor rotor-d" />
      <b><em /></b>
    </div>
  );
}

function DownArrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v17M5 13l7 7 7-7" />
    </svg>
  );
}

export default function ScrollDeck() {
  const reelRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const goTo = (index: number) => {
    const reel = reelRef.current;
    const scenes = reel?.querySelectorAll<HTMLElement>(".deck-scene");
    const target = scenes?.[Math.max(0, Math.min(index, sectionNames.length - 1))];
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  const share = async () => {
    const data = {
      title: "DS Cinema — The autonomous camera operator",
      text: "Privacy-first AI cinematography for solo creators.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      window.location.href = `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.url)}`;
    }
  };

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    const scenes = [...reel.querySelectorAll<HTMLElement>(".deck-scene")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(scenes.indexOf(visible.target as HTMLElement));
      },
      { root: reel, threshold: [0.45, 0.62, 0.8] },
    );

    scenes.forEach((scene) => observer.observe(scene));

    const headingIds = [
      "cover-title",
      "problem-title",
      "now-title",
      "hardware-title",
      "gap-title",
      "solution-title",
      "shots-title",
      "ask-title",
    ];
    const linkedIndex = headingIds.indexOf(window.location.hash.slice(1));
    const linkedFrame =
      linkedIndex >= 0
        ? window.requestAnimationFrame(() => setActive(linkedIndex))
        : null;

    return () => {
      observer.disconnect();
      if (linkedFrame !== null) window.cancelAnimationFrame(linkedFrame);
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const forward = ["ArrowDown", "PageDown", " "];
      const backward = ["ArrowUp", "PageUp"];
      if (forward.includes(event.key)) {
        event.preventDefault();
        goTo(active + 1);
      }
      if (backward.includes(event.key)) {
        event.preventDefault();
        goTo(active - 1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        goTo(sectionNames.length - 1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active]);

  return (
    <div className="deck-page">
      <header className={`deck-topbar deck-tone-${active}`}>
        <button className="deck-brand" type="button" onClick={() => goTo(0)} aria-label="Go to cover">
          <span className="deck-brand-mark">DS</span>
          <span>cinema</span>
        </button>
        <nav className="deck-progress" aria-label="Presentation sections">
          {sectionNames.map((name, index) => (
            <button
              key={name}
              className={index === active ? "active" : index < active ? "seen" : ""}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to ${name}`}
              aria-current={index === active ? "step" : undefined}
            >
              <span />
            </button>
          ))}
        </nav>
        <span className="deck-counter" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / 08
        </span>
      </header>

      <aside className="deck-actions" aria-label="Presentation actions">
        <button type="button" onClick={share} aria-label="Share this presentation" title="Share">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.7 10.6 6.6-4.1m-6.6 6.9 6.6 4.1" />
          </svg>
        </button>
        <a href="mailto:contact@hawkfranklin.in?subject=DS%20Cinema%20pilot" aria-label="Email the DS Cinema team" title="Contact">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </a>
      </aside>

      <main className="deck-reel" ref={reelRef}>
        <section className={`deck-scene deck-cover ${active === 0 ? "is-active" : ""}`} aria-labelledby="cover-title">
          <div className="deck-grain" />
          <div className="deck-cover-stage" data-media-slot="cover-video">
            <div className="deck-room-lines" />
            <div className="deck-tripod" aria-hidden="true"><i /><span /><b /></div>
            <div className="deck-person" aria-hidden="true"><i /><span /></div>
            <div className="deck-flight-path" aria-hidden="true"><span>SAFE PATH 01</span></div>
            <DroneGlyph />
            <div className="deck-focus-frame" aria-hidden="true"><span>SUBJECT / LOCKED</span></div>
          </div>
          <div className="deck-scene-inner deck-cover-copy">
            <p className="deck-kicker deck-reveal">Autonomous indoor cinematography</p>
            <h1 id="cover-title" className="deck-reveal">Your camera<br />operator is<br /><em>in the air.</em></h1>
            <p className="deck-lede deck-reveal">Privacy-first AI cinematography for solo creators.</p>
            <div className="deck-cover-points deck-reveal"><span>No crew</span><span>No cloud upload</span><span>No static frame</span></div>
            <button className="deck-scroll-cue deck-reveal" type="button" onClick={() => goTo(1)} aria-label="Continue to the problem">
              <DownArrow /><span>Scroll the story</span>
            </button>
          </div>
        </section>

        <section className={`deck-scene deck-problem ${active === 1 ? "is-active" : ""}`} aria-labelledby="problem-title">
          <div className="deck-scene-inner deck-split-layout">
            <div className="deck-copy-block">
              <p className="deck-kicker deck-reveal">01 / The problem</p>
              <h2 id="problem-title" className="deck-reveal">Solo creators are still filming like it is <em>2016.</em></h2>
              <p className="deck-lede deck-reveal">A tripod can hold a camera. It cannot compose, react, or direct.</p>
              <div className="deck-tag-row deck-reveal"><span>Static shots</span><span>Repeated retakes</span><span>No operator</span></div>
            </div>
            <div className="deck-problem-visual deck-reveal" data-media-slot="problem-image">
              <span className="deck-visual-label">CURRENT WORKFLOW / LOOP</span>
              <div className="deck-phone-rig">
                <div className="deck-phone"><i>REC</i><span /></div>
                <div className="deck-tripod tripod-large"><i /><span /><b /></div>
              </div>
              <div className="deck-adjusting-person"><i /><span /><b /></div>
              <div className="deck-retake-loop"><strong>01</strong><strong>02</strong><strong>03</strong><span>adjust → perform → check → repeat</span></div>
            </div>
          </div>
        </section>

        <section className={`deck-scene deck-now ${active === 2 ? "is-active" : ""}`} aria-labelledby="now-title">
          <div className="deck-scene-inner deck-now-layout">
            <div className="deck-copy-block">
              <p className="deck-kicker deck-reveal">02 / Why now</p>
              <h2 id="now-title" className="deck-reveal">The creator economy is professionalizing.<br /><em>The camera has not.</em></h2>
            </div>
            <div className="deck-now-split deck-reveal" data-media-slot="why-now-split-image">
              <div className="deck-setup-half">
                <span>SOLO SETUP</span>
                <div className="deck-mini-phone" /><div className="deck-light-stick" />
                <small>one person<br />one fixed angle</small>
              </div>
              <div className="deck-studio-half">
                <span>STUDIO EXPECTATION</span>
                <div className="deck-studio-rig"><i /><i /><b /></div>
                <small>movement<br />coverage<br />continuity</small>
              </div>
            </div>
            <div className="deck-market-metrics deck-reveal">
              <div><strong>$7.2B</strong><span>creator payments processed in 2024</span></div>
              <div><strong>4.6M</strong><span>reported creator accounts</span></div>
              <small>Reported figures from Fenix International’s 2024 financial reporting.</small>
            </div>
          </div>
        </section>

        <section className={`deck-scene deck-hardware ${active === 3 ? "is-active" : ""}`} aria-labelledby="hardware-title">
          <div className="deck-scene-inner">
            <div className="deck-section-heading">
              <div><p className="deck-kicker deck-reveal">03 / Current hardware</p><h2 id="hardware-title" className="deck-reveal">Self-flying cameras proved <em>the category.</em></h2></div>
              <p className="deck-lede deck-reveal">Palm launch, subject tracking, obstacle sensing and controller-free capture are already understood by consumers.</p>
            </div>
            <div className="deck-hardware-grid">
              <article className="deck-device-card deck-reveal">
                <span className="deck-card-index">A / CATEGORY BENCHMARK</span>
                <div className="deck-device-orbit"><DroneGlyph compact /></div>
                <h3>DJI Neo 2</h3>
                <p>Palm-sized follow-me capture</p>
                <ul><li>Gesture control</li><li>ActiveTrack</li><li>Obstacle sensing</li></ul>
              </article>
              <article className="deck-device-card deck-device-card-light deck-reveal">
                <span className="deck-card-index">B / CATEGORY BENCHMARK</span>
                <div className="deck-device-orbit deck-device-square"><DroneGlyph compact /></div>
                <h3>HOVERAir</h3>
                <p>Controller-free flying camera</p>
                <ul><li>Automated modes</li><li>Protected props</li><li>Creator-first UX</li></ul>
              </article>
              <div className="deck-proof-stamp deck-reveal"><span>PROVEN</span><small>People will trust a camera that flies itself.</small></div>
            </div>
          </div>
        </section>

        <section className={`deck-scene deck-gap ${active === 4 ? "is-active" : ""}`} aria-labelledby="gap-title">
          <div className="deck-scene-inner deck-gap-layout">
            <div className="deck-copy-block">
              <p className="deck-kicker deck-reveal">04 / The gap</p>
              <h2 id="gap-title" className="deck-reveal">They follow you.<br /><em>They do not direct you.</em></h2>
              <p className="deck-lede deck-reveal">The unclaimed position is safe, autonomous direction inside the creator’s room.</p>
            </div>
            <div className="deck-position-map deck-reveal" role="img" aria-label="Market position map from outdoor follow-me to indoor cinematography and manual shots to AI-directed shots">
              <span className="deck-axis-label axis-top">AI-DIRECTED SHOTS</span>
              <span className="deck-axis-label axis-bottom">MANUAL SHOTS</span>
              <span className="deck-axis-label axis-left">OUTDOOR FOLLOW-ME</span>
              <span className="deck-axis-label axis-right">INDOOR CINEMATOGRAPHY</span>
              <div className="deck-map-grid" />
              <span className="deck-map-dot dot-dji">DJI</span>
              <span className="deck-map-dot dot-hover">HOVERAIR</span>
              <span className="deck-map-dot dot-tripod">TRIPOD</span>
              <span className="deck-map-dot dot-ds"><b>DS</b><small>THE WHITE SPACE</small></span>
            </div>
          </div>
        </section>

        <section className={`deck-scene deck-solution ${active === 5 ? "is-active" : ""}`} aria-labelledby="solution-title">
          <div className="deck-scene-inner deck-solution-layout">
            <div className="deck-copy-block">
              <p className="deck-kicker deck-reveal">05 / The solution</p>
              <h2 id="solution-title" className="deck-reveal">A privacy-first AI director for <em>indoor creator shoots.</em></h2>
              <div className="deck-three-words deck-reveal"><span>Scan room.</span><span>Choose shot.</span><span>Record safely.</span></div>
              <p className="deck-privacy-note deck-reveal"><i /> Raw footage stays on the creator’s devices by default.</p>
            </div>
            <div className="deck-ecosystem deck-reveal" data-media-slot="product-ecosystem-mockup">
              <div className="deck-eco-drone"><span>01 / CAMERA</span><DroneGlyph compact /></div>
              <div className="deck-data-line line-one"><i /></div>
              <div className="deck-eco-phone"><span className="phone-island" /><div className="phone-preview"><i /><b>WIDE ARC</b></div><small>02 / CONTROL</small></div>
              <div className="deck-data-line line-two"><i /></div>
              <div className="deck-eco-laptop"><div><span className="pose-head" /><i className="pose-body" /><b>LOCAL AI</b></div><small>03 / DIRECTION</small></div>
              <span className="deck-local-loop">LOCAL NETWORK / ENCRYPTED</span>
            </div>
          </div>
        </section>

        <section className={`deck-scene deck-shots ${active === 6 ? "is-active" : ""}`} aria-labelledby="shots-title">
          <div className="deck-scene-inner">
            <div className="deck-section-heading">
              <div><p className="deck-kicker deck-reveal">06 / Product</p><h2 id="shots-title" className="deck-reveal">Three autonomous shots <em>to start.</em></h2></div>
              <p className="deck-lede deck-reveal">Deterministic paths. AI-assisted framing. Human-controlled start and stop.</p>
            </div>
            <div className="deck-shot-grid">
              <article className="deck-shot-card deck-reveal">
                <span>01</span><div className="deck-room-diagram"><i className="subject-dot" /><b className="path-arc" /><em className="camera-dot cam-arc" /></div>
                <h3>Wide arc</h3><p>Add controlled motion while maintaining a safe radius.</p>
              </article>
              <article className="deck-shot-card deck-reveal">
                <span>02</span><div className="deck-room-diagram"><i className="subject-dot" /><b className="path-slide" /><em className="camera-dot cam-slide" /></div>
                <h3>Lateral slide</h3><p>Move parallel to the subject for steady profile coverage.</p>
              </article>
              <article className="deck-shot-card deck-reveal">
                <span>03</span><div className="deck-room-diagram diagram-reveal"><i className="subject-dot" /><b className="path-reveal" /><em className="camera-dot cam-reveal" /></div>
                <h3>Elevated reveal</h3><p>Pull back and rise into a cinematic environmental frame.</p>
              </article>
            </div>
            <div className="deck-safety-line deck-reveal"><span>LOCAL POSE</span><i /><span>DEPTH SENSING</span><i /><span>SAFE VOLUME</span><i /><span>USER OVERRIDE</span></div>
          </div>
        </section>

        <section className={`deck-scene deck-ask ${active === 7 ? "is-active" : ""}`} aria-labelledby="ask-title">
          <div className="deck-grain" />
          <div className="deck-scene-inner deck-ask-layout">
            <div className="deck-copy-block">
              <p className="deck-kicker deck-reveal">07 / Business + ask</p>
              <h2 id="ask-title" className="deck-reveal">Start where filming alone is already <em>a business.</em></h2>
              <p className="deck-lede deck-reveal">Beachhead: premium solo creators.<br />Expansion: every creator studio.</p>
              <a className="deck-contact-cta deck-reveal" href="mailto:contact@hawkfranklin.in?subject=DS%20Cinema%20pilot%20or%20investment">Build the first 30 with us <span>↗</span></a>
            </div>
            <div className="deck-funnel deck-reveal">
              <div className="funnel-top"><span>BEACHHEAD</span><strong>Subscription creators · Cam studios · Creator agencies</strong></div>
              <div className="funnel-mid"><span>EXPANSION</span><strong>Fitness · Dance · Fashion · Education · Livestreaming</strong></div>
              <div className="funnel-core"><span>THE PLATFORM</span><strong>Autonomous cinematography</strong></div>
            </div>
            <div className="deck-ask-panel deck-reveal">
              <span>SEEKING NOW</span>
              <div><strong>Pilot partners</strong><strong>Supplier quotes</strong><strong>Pre-seed capital</strong></div>
              <p>Milestone: 30 controlled prototypes before VENUS Berlin 2026.</p>
              <b>22—25 OCT / BERLIN</b>
            </div>
            <footer className="deck-footer"><span>DS Cinema × HawkFranklin Research</span><span>Concept deck / July 2026</span></footer>
          </div>
        </section>
      </main>

      <div className={`deck-toast ${copied ? "show" : ""}`} role="status" aria-live="polite">Link copied</div>
    </div>
  );
}
