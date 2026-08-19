import { PageIntro } from '../components/PageIntro';
import { wedding } from '../config/wedding';

export function WeddingPage() {
  return (
    <div className="page section">
      <PageIntro eyebrow="The celebration" title="Our wedding">
        <p>Everything you need to know for a relaxed and joyful day in the Cotswolds.</p>
      </PageIntro>
      <div className="event-list">
        {wedding.events.map((event, index) => (
          <article className="event-card" key={event.title}>
            <span className="event-number">0{index + 1}</span>
            <div>
              <p className="eyebrow">{event.date}</p>
              <h2>{event.title}</h2>
            </div>
            <div className="event-meta">
              <strong>{event.time}</strong>
              <span>{event.location}</span>
              <p>{event.description}</p>
            </div>
          </article>
        ))}
      </div>
      <aside className="note-panel">
        <p className="eyebrow">A note on dress</p>
        <h2>Summer occasionwear</h2>
        <p>
          Morning dress or lounge suits, and summer dresses. We hope to spend time outside, weather
          permitting, so bring a layer for later and choose shoes happy on grass.
        </p>
      </aside>
    </div>
  );
}
