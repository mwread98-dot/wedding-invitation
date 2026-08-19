import { Link } from 'react-router-dom';
import { Countdown } from '../components/Countdown';
import { wedding } from '../config/wedding';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <img
          src={wedding.heroImage}
          alt="A softly lit wedding table set in a country garden"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content reveal">
          <p className="eyebrow">Together with their families</p>
          <h1>
            {wedding.partners[0]} <em>&</em> {wedding.partners[1]}
          </h1>
          <p className="hero-date">
            {wedding.displayDate}
            <span />
            {wedding.location}
          </p>
        </div>
        <a href="#welcome" className="scroll-cue" aria-label="Scroll to welcome">
          Discover <span>↓</span>
        </a>
      </section>

      <section className="welcome section" id="welcome">
        <div className="botanical-mark" aria-hidden="true">
          ❧
        </div>
        <p className="eyebrow">We are getting married</p>
        <h2>
          A day to remember,
          <br />
          <i>with our favourite people.</i>
        </h2>
        <p className="lead">{wedding.introduction}</p>
        <Countdown target={wedding.date} />
        <Link className="button dark" to="/rsvp">
          Reply to your invitation
        </Link>
      </section>

      <section className="editorial-grid section flush">
        <div
          className="editorial-card image-card"
          style={{ backgroundImage: `url(${wedding.heroImage})` }}
          aria-label="Wedding flowers and table setting"
        />
        <div className="editorial-card text-card">
          <p className="eyebrow">The celebration</p>
          <h2>
            Country charm,
            <br />
            <i>summer light</i>
          </h2>
          <p>
            Join us at {wedding.venue} for our ceremony, a long lunch and dancing into the night.
          </p>
          <Link className="text-link" to="/wedding">
            Explore the day <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
