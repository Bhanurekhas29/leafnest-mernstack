import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const PHONE = '+91 98765 43210';
const WA = 'https://wa.me/919876543210';
const waLink = (text) => `${WA}?text=${encodeURIComponent(text)}`;

const HEROES = [
  { tag: 'Wedding return gifts', title: 'A living thank-you your guests take home', text: 'Mini potted plants with personalised tags — memories that grow long after the big day.', img: '/images/hero-wedding.jpg' },
  { tag: 'Corporate gifting', title: 'Desk plants that make your brand memorable', text: 'Branded pots, tags and cards for employee welcomes, client gifts and event giveaways.', img: '/images/hero-corporate.jpg' },
  { tag: 'Festive hampers', title: 'Festive hampers with a greener heart', text: 'Diwali and celebration hampers that pair plants with thoughtful, eco-friendly touches.', img: '/images/hero-festive.jpg' },
];

const CUSTOM = [
  ['Custom pots', 'Pots printed or etched with your brand, couple name or event theme.'],
  ['Name tags', 'Handwritten or printed tags for each guest — names, messages or table numbers.'],
  ['Branded cards', 'Thank-you cards and sleeves designed around your colours and logo.'],
  ['Ribbons & twine', 'Satin, jute or cotton finishes matched to your palette.'],
];

const WHY = [
  ['Grown, not manufactured', 'Every gift is a live plant from our own nursery partners — hardened, healthy and ready to thrive.'],
  ['Fully personalised', 'Pots, tags, cards and packaging all carry your names, message or brand — nothing generic.'],
  ['No cart, no confusion', 'One conversation on WhatsApp or the quote form and you have your plan and price in hand.'],
  ['Event-day ready', 'We batch, pack and time deliveries so gifts arrive fresh on your exact date.'],
];

const STEPS = [
  ['Pick a pack', 'Browse our gift packs and categories — or tell us what you have in mind.'],
  ['Share quantity & date', 'Send us your headcount, delivery city and event date on WhatsApp or the quote form.'],
  ['Get your quote', 'We reply with a personalised quote, samples of customisation and a clear timeline.'],
  ['We grow & deliver', 'Plants are prepped, personalised, packed and delivered fresh on your big day.'],
];

const PACKING = [
  'Sturdy vertical sleeves with free air circulation',
  'Pots seated snug so soil never spills',
  'Moisture-locked before boxing for multi-day freshness',
  'Damaged on arrival? We replace the batch, no questions asked',
];

function Img({ src, alt, className }) {
  const [ok, setOk] = useState(Boolean(src));
  return ok ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setOk(false)} /> : <div className={`${className || ''} img-fallback`} role="img" aria-label={alt} />;
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['Gift Categories', '#categories'], ['Gift Packs', '#packs'], ['Customisation', '#customise'], ['Gallery', '#gallery'], ['FAQ', '#faq']];
  return (
    <header className="header">
      <div className="container header-row">
        <a href="#top" className="brand"><img src="/logo.svg" alt="" className="brand-logo" />Leafnest</a>
        <nav className={`nav ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          {links.map(([l, h]) => <a key={h} href={h}>{l}</a>)}
        </nav>
        <div className="header-actions">
          <a className="phone" href="tel:+919876543210">{PHONE}</a>
          <a className="btn btn-primary" href="#quote">Request a Quote</a>
          <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % HEROES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const h = HEROES[i];
  return (
    <section className="hero" id="top">
      <Img key={`img${i}`} src={h.img} alt={h.tag} className="hero-img" />
      <div className="hero-overlay" />
      <span className="blob blob-a" />
      <span className="blob blob-b" />
      <div className="container hero-content" key={i}>
        <span className="eyebrow light">{h.tag}</span>
        <h1>{h.title}</h1>
        <p>{h.text}</p>
        <div className="row">
          <a className="btn btn-wa" href={waLink(`Hi Leafnest, I'd like to enquire about ${h.tag.toLowerCase()}.`)} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>
          <a className="btn btn-ghost" href="#quote">Request a Quote</a>
        </div>
        <div className="dots">
          {HEROES.map((_, n) => <button key={n} className={n === i ? 'on' : ''} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} />)}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, text }) {
  return (
    <div className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function Categories({ items }) {
  return (
    <section className="section" id="categories">
      <div className="container">
        <SectionHead eyebrow="Gift categories" title="Something green for every occasion" />
        <div className="grid grid-4">
          {items.map((c) => (
            <article className="card" key={c.id}>
              <Img src={c.image} alt={c.title} className="card-img" />
              <h3>{c.title}</h3>
              <p>{c.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Packs({ items }) {
  return (
    <section className="section alt" id="packs">
      <div className="container">
        <SectionHead eyebrow="Featured gift packs" title="Ready to order, made to be gifted" text="Pricing depends on quantity, customisation and delivery date — every pack is quoted personally. Enquire and we'll send your quote the same way you prefer." />
        <div className="grid grid-4">
          {items.map((p) => (
            <article className="card" key={p.id}>
              <Img src={p.image} alt={p.title} className="card-img" />
              {p.min_qty && <span className="badge">{p.min_qty}</span>}
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <strong className="price">{p.price_label || 'Price on enquiry'}</strong>
              <a className="btn btn-wa small" href={waLink(`Hi Leafnest, I'd like a quote for the ${p.title}.`)} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Customisation() {
  return (
    <section className="section" id="customise">
      <div className="container split">
        <div className="split-media">
          <Img src="/images/customization.jpg" alt="Custom pots, name tags, branded cards and ribbons" className="card-img tall" />
          <span className="float-badge"><b>100% customisable</b><br />Down to the last ribbon</span>
        </div>
        <div>
          <span className="eyebrow">Customisation</span>
          <h2>Make every gift unmistakably yours</h2>
          <p className="lead">Weddings carry a couple's story; corporate gifts carry a brand. We help you put both on the pot, the tag and the box.</p>
          <ul className="feature-list">
            {CUSTOM.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
          </ul>
          <a className="btn btn-primary" href={waLink("Hi Leafnest, I'd like to discuss customisation.")} target="_blank" rel="noreferrer">Discuss your customisation</a>
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="section peach">
      <div className="container">
        <SectionHead eyebrow="Why Leafnest" title="Why families and teams choose plants over trinkets" />
        <div className="grid grid-4">
          {WHY.map(([t, d], n) => <article className="card pad" key={t}><span className="num">{n + 1}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </div>
    </section>
  );
}

function Packaging() {
  return (
    <section className="section">
      <div className="container split reverse">
        <div>
          <span className="eyebrow">Safely packed</span>
          <h2>Tall, breathable boxes that let every plant breathe</h2>
          <p className="lead">Each plant rides in a vertical grower-style box with open air space above the foliage — no crushed leaves, no sweat, no wilting in transit.</p>
          <ul className="ticks">{PACKING.map((t) => <li key={t}>{t}</li>)}</ul>
          <a className="btn btn-primary" href={waLink('Hi Leafnest, I have a question about packaging.')} target="_blank" rel="noreferrer">Ask about packaging</a>
        </div>
        <div className="pair">
          <Img src="/images/packaging-box.jpg" alt="Tall vertical plant box" className="card-img tall" />
          <Img src="/images/packaging-wrap.jpg" alt="Plant gift packaging with wrap" className="card-img tall" />
        </div>
      </div>
    </section>
  );
}

function HowTo() {
  return (
    <section className="section sun">
      <div className="container">
        <SectionHead eyebrow="How to order" title="From idea to doorstep in four easy steps" />
        <div className="grid grid-4">
          {STEPS.map(([t, d], n) => <article className="card pad" key={t}><span className="step">0{n + 1}</span><h3>{t}</h3><p>{d}</p></article>)}
        </div>
        <div className="center"><a className="btn btn-wa" href={waLink("Hi Leafnest, I'd like to get started.")} target="_blank" rel="noreferrer">Start on WhatsApp</a></div>
      </div>
    </section>
  );
}

function Gallery({ items }) {
  return (
    <section className="section" id="gallery">
      <div className="container">
        <SectionHead eyebrow="Past work" title="Gifts that have already left our nursery" />
        <div className="grid grid-3">
          {items.map((g) => (
            <figure className="shot" key={g.id}>
              <Img src={g.image} alt={g.caption} className="shot-img" />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews({ items }) {
  return (
    <section className="section mint">
      <div className="container">
        <SectionHead eyebrow="Customer reviews" title="Kind words from our gift-givers" />
        <div className="grid grid-3">
          {items.map((r) => (
            <blockquote className="card pad quote" key={r.id}>
              <p>“{r.quote}”</p>
              <footer><b>{r.author}</b><span>{r.role}</span></footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ items }) {
  return (
    <section className="section" id="faq">
      <div className="container narrow">
        <SectionHead eyebrow="FAQ" title="Questions we hear most" />
        {items.map((f) => (
          <details className="faq" key={f.id}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const EMPTY = { name: '', phone: '', email: '', event_type: '', quantity: '', event_date: '', city: '', message: '' };

function QuoteForm() {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ busy: false, msg: '', error: false });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, msg: '', error: false });
    try {
      const res = await fetch('/api/public/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm(EMPTY);
      setState({ busy: false, msg: data.message, error: false });
    } catch (err) {
      setState({ busy: false, msg: err.message || 'Could not send your request. Please try WhatsApp.', error: true });
    }
  }

  return (
    <section className="section contact" id="quote">
      <div className="container">
        <SectionHead eyebrow="Contact & quote" title="Tell us about your event" text="Share a few details and we'll get back with a personalised quote and options — usually within a day. No payment needed, and samples of customisation are shared before you commit." />
      <div className="contact-grid">
        <form className="form" onSubmit={submit}>
          <label>Name *<input required value={form.name} onChange={set('name')} /></label>
          <label>Phone *<input required type="tel" value={form.phone} onChange={set('phone')} /></label>
          <label className="full">Email<input type="email" value={form.email} onChange={set('email')} /></label>
          <label className="full">Event type *
            <select required value={form.event_type} onChange={set('event_type')}>
              <option value="">Select event type</option>
              {['Wedding return gifts', 'Corporate gifting', 'Festive hampers', 'Event giveaway', 'Other'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label>Approx. quantity<input type="number" min="1" value={form.quantity} onChange={set('quantity')} /></label>
          <label>Event date<input type="date" value={form.event_date} onChange={set('event_date')} /></label>
          <label className="full">Delivery city<input value={form.city} onChange={set('city')} /></label>
          <label className="full">Message<textarea rows="3" value={form.message} onChange={set('message')} /></label>
          <button className="btn btn-primary full" disabled={state.busy}>{state.busy ? 'Sending…' : 'Send my request'}</button>
          {state.msg && <p className={`full note ${state.error ? 'err' : 'ok'}`}>{state.msg}</p>}
        </form>

        <div className="map-col">
          <div className="map-card">
            <iframe
              title="Leafnest location on Google Maps"
              src="https://maps.google.com/maps?q=MG%20Road%2C%20Bengaluru%20560001&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <ul className="contact-list">
            <li><span className="ico c1">📍</span><div><b>Visit our store</b><span>Shop 12, Green Lane, MG Road, Bengaluru 560001</span></div></li>
            <li><span className="ico c2">📞</span><div><b>Call us</b><a href="tel:+919876543210">{PHONE}</a></div></li>
            <li><span className="ico c3">💬</span><div><b>WhatsApp</b><a href={WA} target="_blank" rel="noreferrer">Chat with us anytime</a></div></li>
            <li><span className="ico c4">✉️</span><div><b>Email</b><a href="mailto:hello@leafnest.in">hello@leafnest.in</a></div></li>
          </ul>
        </div>
      </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><div className="brand light"><img src="/logo.svg" alt="" className="brand-logo" />Leafnest</div><p>Gift a plant, grow a memory.</p></div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+919876543210">{PHONE}</a>
          <a href={WA} target="_blank" rel="noreferrer">WhatsApp us</a>
          <a href="mailto:hello@leafnest.in">hello@leafnest.in</a>
          <p>Shop 12, Green Lane, MG Road, Bengaluru 560001</p>
        </div>
        <div>
          <h4>Quick links</h4>
          <a href="#categories">Gift Categories</a>
          <a href="#packs">Gift Packs</a>
          <a href="#gallery">Gallery</a>
          <a href="#faq">FAQ</a>
          <a href="#quote">Request a Quote</a>
        </div>
      </div>
      <div className="container copy">© {new Date().getFullYear()} Leafnest. Grown with care in Bengaluru.</div>
    </footer>
  );
}

const OCCASIONS = ['Wedding return gifts', 'Corporate gifting', 'Festive hampers', 'Birthday favours', 'Baby showers', 'Event giveaways', 'Housewarming', 'Employee welcome kits'];

function Marquee() {
  const row = [...OCCASIONS, ...OCCASIONS];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">{row.map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>
  );
}

function FloatingButtons() {
  return (
    <div className="floaters">
      <a className="fab fab-call" href="tel:+919876543210" aria-label="Call us">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.300.2 2.500.6 3.600.1.300 0 .700-.2 1L6.600 10.800z" /></svg>
      </a>
      <a className="fab fab-wa" href={waLink("Hi Leafnest, I'd like to enquire about plant gifts.")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M20.5 3.5A11.800 11.800 0 0 0 12 0C5.400 0 .1 5.300.1 11.900c0 2.100.6 4.100 1.600 5.900L0 24l6.400-1.700a11.900 11.900 0 0 0 5.600 1.400c6.600 0 11.900-5.300 11.900-11.900 0-3.200-1.200-6.200-3.400-8.300zM12 21.600c-1.800 0-3.600-.5-5.100-1.400l-.4-.2-3.800 1 1-3.700-.2-.4a9.800 9.800 0 0 1-1.500-5.200C2.100 6.500 6.500 2.100 12 2.100c2.600 0 5.100 1 6.900 2.900a9.700 9.700 0 0 1 2.900 6.900c0 5.400-4.400 9.700-9.800 9.700zm5.400-7.300c-.3-.1-1.700-.8-2-.9-.3-.1-.5-.1-.7.100-.2.300-.8.900-.9 1.100-.2.200-.3.200-.6.100-.3-.1-1.200-.4-2.300-1.400-.8-.8-1.400-1.700-1.600-2-.2-.3 0-.5.100-.6l.4-.5c.1-.2.200-.3.300-.5.100-.2 0-.4 0-.5-.1-.1-.7-1.600-.9-2.200-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1 1-1 2.500s1.100 2.900 1.200 3.100c.1.200 2.100 3.200 5.100 4.500.7.300 1.300.5 1.700.6.700.2 1.400.2 1.900.1.600-.1 1.700-.7 2-1.400.2-.7.2-1.300.2-1.400-.1-.1-.3-.2-.6-.3z" /></svg>
      </a>
    </div>
  );
}

// Fades/slides elements in as they scroll into view; re-runs when API content renders new cards.
function useScrollReveal(dep) {
  // One observer for the page's lifetime; disconnecting on cleanup would drop elements StrictMode already registered.
  const observer = useRef(null);
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    observer.current ??= new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); observer.current.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.section-head, .card, .shot, .faq, .split > *, .contact-grid > *, .contact-list li, .feature-list li, .ticks li').forEach((el) => {
      if (el.dataset.rv) return;
      el.dataset.rv = '1';
      el.classList.add('reveal');
      el.style.setProperty('--d', `${Math.min([...el.parentElement.children].indexOf(el), 5) * 90}ms`);
      observer.current.observe(el);
    });
  }, [dep]);

  // Nav links can jump past sections in one frame; anything already scrolled past should not stay hidden.
  useEffect(() => {
    const reveal = () => document.querySelectorAll('.reveal:not(.in)').forEach((el) => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('in'); });
    window.addEventListener('scroll', reveal, { passive: true });
    return () => window.removeEventListener('scroll', reveal);
  }, []);
}

export default function Landing() {
  const [content, setContent] = useState({ categories: [], packs: [], gallery: [], reviews: [], faqs: [] });
  useEffect(() => {
    fetch('/api/public/content').then((r) => r.json()).then(setContent).catch(() => {});
  }, []);
  useScrollReveal(content);

  return (
    <>
      <Header />
      <FloatingButtons />
      <main>
        <Hero />
        <Marquee />
        <Categories items={content.categories} />
        <Packs items={content.packs} />
        <Customisation />
        <Why />
        <Packaging />
        <HowTo />
        <Gallery items={content.gallery} />
        <Reviews items={content.reviews} />
        <Faq items={content.faqs} />
        <QuoteForm />
      </main>
      <Footer />
    </>
  );
}
