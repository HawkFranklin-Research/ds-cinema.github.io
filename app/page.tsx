"use client";

import { FormEvent, useState } from "react";

const features = [
  {
    number: "01",
    title: "Room-aware",
    text: "Scan once. DS Cinema understands the set, respects no-fly zones, and plans only safe camera paths.",
  },
  {
    number: "02",
    title: "Director AI",
    text: "Choose a mood, not a flight path. The system selects framing, movement, and timing for every take.",
  },
  {
    number: "03",
    title: "Local by design",
    text: "Your footage and scene intelligence stay on your devices. No automatic uploads. No surprise cloud processing.",
  },
];

const steps = [
  ["Map the room", "Mark the set, mirrors, lights, and the places the camera should never enter."],
  ["Set the scene", "Pick a shot style—from a slow orbit to a precise full-body tracking move."],
  ["Perform freely", "Start with a gesture or voice cue. DS Cinema captures repeatable coverage while you stay in the moment."],
  ["Keep the best", "Review a ready-to-edit selection of stable, well-framed takes in vertical and landscape formats."],
];

function MediaPlaceholder({
  label,
  index,
  className = "",
}: {
  label: string;
  index: string;
  className?: string;
}) {
  return (
    <div className={`media-placeholder ${className}`} aria-label={`${label} media placeholder`}>
      <div className="placeholder-grid" />
      <div className="frame-corners" />
      <span className="media-index">{index}</span>
      <div className="media-copy">
        <span className="play-dot" aria-hidden="true" />
        <div>
          <strong>{label}</strong>
          <small>FUTURE PRODUCT FILM / IMAGE</small>
        </div>
      </div>
      <span className="media-status">PLACEHOLDER</span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="DS Cinema home" onClick={closeMenu}>
          <span className="brand-mark">DS</span>
          <span>cinema</span>
        </a>
        <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
          <a href="#system" onClick={closeMenu}>System</a>
          <a href="#workflow" onClick={closeMenu}>How it works</a>
          <a href="#principles" onClick={closeMenu}>Principles</a>
          <a href="#pilot" className="nav-cta" onClick={closeMenu}>Join the pilot <span>↗</span></a>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> Autonomous cinematography</p>
          <h1>Your camera<br />operator.<br /><em>In the air.</em></h1>
          <p className="hero-description">
            A privacy-first flying camera that maps your room, plans the shot, and films you—hands-free.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#pilot">Join the pilot <span>↗</span></a>
            <a className="text-link" href="#concept"><span className="play-mini">▶</span> Watch the concept</a>
          </div>
        </div>

        <div className="hero-visual" id="concept">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-crosshair" />
          <div className="drone" aria-hidden="true">
            <span className="drone-arm arm-left" />
            <span className="drone-arm arm-right" />
            <span className="drone-rotor rotor-one" />
            <span className="drone-rotor rotor-two" />
            <span className="drone-rotor rotor-three" />
            <span className="drone-rotor rotor-four" />
            <span className="drone-body"><i /></span>
          </div>
          <div className="telemetry telemetry-top"><span>SHOT / 04</span><strong>ORBIT SLOW</strong></div>
          <div className="telemetry telemetry-right"><span>SUBJECT LOCK</span><strong>98.4%</strong></div>
          <div className="telemetry telemetry-bottom"><span>SAFE VOLUME</span><strong>2.8 × 3.4 M</strong></div>
          <div className="visual-label"><span className="status-dot" /> FUTURE PRODUCT FILM</div>
          <p className="coordinates">X 02.140 / Y 01.880 / Z 01.520</p>
        </div>

        <div className="hero-footer">
          <p>Built for solo creators.</p>
          <div className="hero-proof">
            <span><i /> Room-aware</span>
            <span><i /> Director AI</span>
            <span><i /> Local by design</span>
          </div>
        </div>
      </section>

      <section className="statement section-pad" id="system">
        <p className="section-kicker">The missing crew member</p>
        <h2>More than a drone.<br /><span>A director that moves.</span></h2>
        <p className="statement-copy">
          Most self-flying cameras only ask where you are. DS Cinema understands what you&apos;re creating—then finds the angle, protects the frame, and gives every take motion.
        </p>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span>{feature.number}</span>
              <div className="feature-icon" aria-hidden="true"><i /><b /></div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow section-pad" id="workflow">
        <div className="workflow-heading">
          <p className="section-kicker">One room. Infinite coverage.</p>
          <h2>From space to shot<br />in four simple steps.</h2>
        </div>
        <div className="workflow-layout">
          <MediaPlaceholder label="Room scan in motion" index="01 / 04" className="workflow-media" />
          <ol className="step-list">
            {steps.map(([title, text], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shot-library section-pad">
        <div className="library-header">
          <div>
            <p className="section-kicker">Shot library</p>
            <h2>Direct the feeling.<br />We&apos;ll plan the flight.</h2>
          </div>
          <p>Choose a cinematic intent. Each preset adapts to your room, your movement, and your publishing format.</p>
        </div>
        <div className="media-grid">
          <MediaPlaceholder label="Intimate focus" index="01" className="media-tall" />
          <MediaPlaceholder label="Editorial orbit" index="02" />
          <MediaPlaceholder label="Full-body track" index="03" />
          <MediaPlaceholder label="Overhead reveal" index="04" className="media-wide" />
        </div>
      </section>

      <section className="principles section-pad" id="principles">
        <div className="principle-visual" aria-hidden="true">
          <div className="privacy-core"><span>LOCAL</span><strong>AI</strong></div>
          <i className="privacy-ring ring-a" />
          <i className="privacy-ring ring-b" />
          <i className="privacy-ring ring-c" />
        </div>
        <div className="principle-copy">
          <p className="section-kicker">Private means private</p>
          <h2>Your set.<br />Your footage.<br /><span>Your control.</span></h2>
          <p>Designed for spaces where trust matters. Scene intelligence runs locally, storage is encrypted, and recording is always visible.</p>
          <ul>
            <li><span>01</span> No automatic cloud upload</li>
            <li><span>02</span> Visible, non-disableable recording light</li>
            <li><span>03</span> Encrypted local storage</li>
            <li><span>04</span> One-touch stop and secure delete</li>
          </ul>
        </div>
      </section>

      <section className="safety-strip">
        <p className="section-kicker">Close by. Never careless.</p>
        <div className="safety-points">
          <span><b>360°</b> protected propellers</span>
          <span><b>&lt; 1s</b> emergency stop</span>
          <span><b>Always</b> minimum face distance</span>
          <span><b>Auto</b> land on tracking loss</span>
        </div>
      </section>

      <section className="pilot section-pad" id="pilot">
        <div className="pilot-copy">
          <p className="section-kicker">Early flight program / 2026</p>
          <h2>Help shape the first<br />autonomous camera crew.</h2>
          <p>We&apos;re inviting a small group of creators, studios, and production partners to test the system and influence what we build next.</p>
        </div>
        <div className="pilot-form-wrap">
          {submitted ? (
            <div className="success-message" role="status">
              <span>✓</span>
              <h3>You&apos;re on the flight list.</h3>
              <p>Thanks for your interest. We&apos;ll be in touch when pilot applications open.</p>
              <button type="button" onClick={() => setSubmitted(false)}>Add another email</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pilot-form">
              <label htmlFor="email">Email address</label>
              <div className="input-row">
                <input id="email" name="email" type="email" required placeholder="you@studio.com" autoComplete="email" />
                <button type="submit">Request access <span>↗</span></button>
              </div>
              <label htmlFor="role">I&apos;m joining as</label>
              <select id="role" name="role" defaultValue="creator">
                <option value="creator">Independent creator</option>
                <option value="studio">Studio or agency</option>
                <option value="investor">Investor or partner</option>
                <option value="other">Something else</option>
              </select>
              <p>Prototype program updates only. No spam. Unsubscribe any time.</p>
            </form>
          )}
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">DS</span><span>cinema</span></a>
        <p>Autonomous cinematography<br />for independent creators.</p>
        <div className="footer-links">
          <a href="#system">System</a>
          <a href="#workflow">How it works</a>
          <a href="#principles">Privacy</a>
        </div>
        <p className="copyright">© 2026 DS Cinema. Concept in development.</p>
      </footer>
    </main>
  );
}
