import { PageIntro } from '../components/PageIntro';
import { wedding } from '../config/wedding';

export function SchedulePage() {
  return (
    <div className="page section schedule-page">
      <PageIntro eyebrow="Saturday, 19 June" title="The order of the day">
        <p>Timings are a guide—good company may make the hours slip by.</p>
      </PageIntro>
      <ol className="timeline">
        {wedding.timeline.map((item, index) => (
          <li key={`${item.time}-${item.title}`}>
            <time>{item.time}</time>
            <span className="timeline-dot" aria-hidden="true" />
            <div>
              <p className="eyebrow">0{index + 1}</p>
              <h2>{item.title}</h2>
              {item.note && <p>{item.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
