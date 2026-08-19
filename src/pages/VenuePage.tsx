import { PageIntro } from '../components/PageIntro';
import { mapsUrl, wedding } from '../config/wedding';

export function VenuePage() {
  return (
    <div className="page section">
      <PageIntro eyebrow="Getting there" title={wedding.venue}>
        <p>A secluded country house, framed by old stone walls and rambling gardens.</p>
      </PageIntro>
      <div className="venue-feature">
        <div className="venue-image" style={{ backgroundImage: `url(${wedding.heroImage})` }} />
        <div className="venue-address">
          <p className="eyebrow">Address</p>
          <h2>{wedding.address}</h2>
          <a className="button dark" href={mapsUrl} target="_blank" rel="noreferrer">
            Open in Google Maps
          </a>
        </div>
      </div>
      <div className="info-columns">
        <article>
          <span>01</span>
          <h3>By train</h3>
          <p>{wedding.travel.rail}</p>
        </article>
        <article>
          <span>02</span>
          <h3>Parking</h3>
          <p>{wedding.travel.parking}</p>
        </article>
        <article>
          <span>03</span>
          <h3>Taxis</h3>
          <p>{wedding.travel.taxis}</p>
        </article>
      </div>
      <section className="accommodation">
        <p className="eyebrow">Stay nearby</p>
        <h2>A room for the night</h2>
        <div>
          {wedding.accommodation.map((place) => (
            <article key={place.name}>
              <h3>{place.name}</h3>
              <p>{place.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
