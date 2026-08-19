import { PageIntro } from '../components/PageIntro';
import { wedding } from '../config/wedding';

export function FaqPage() {
  return (
    <div className="page section narrow">
      <PageIntro eyebrow="Good to know" title="Questions, answered">
        <p>If there is anything we have missed, please get in touch.</p>
      </PageIntro>
      <div className="faq-list">
        {wedding.faq.map((item, index) => (
          <details key={item.question}>
            <summary>
              <span>0{index + 1}</span>
              {item.question}
              <i aria-hidden="true">+</i>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
      <div className="contact-note">
        <p>Still wondering?</p>
        <a href={`mailto:${wedding.contactEmail}`}>{wedding.contactEmail}</a>
      </div>
    </div>
  );
}
