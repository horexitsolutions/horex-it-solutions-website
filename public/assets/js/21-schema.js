/* ============================================================
   Horex IT Solutions – Structured Data (Priority 2 SEO/AEO/GEO)
   Injects JSON-LD <script> tags into <head> for:
     1. LocalBusiness / ProfessionalService
     2. Organization
     3. WebSite + SearchAction
   Dynamic per-page FAQPage and HowTo schemas are injected by
   03-audit-wizard.js, 06-website-page.js, and 07-service-pages.js
   via window.HXSchema.setFAQ() / window.HXSchema.setHowTo().
   ============================================================ */
(function () {
  'use strict';

  /* ── constants (single source of truth) ───────────────────*/
  const SITE_URL  = 'https://horexitsolutions.com';
  const PHONE     = '+91 9414122762';
  const EMAIL     = 'hello@horexitsolutions.com';
  const NAME      = 'Horex IT Solutions';
  const LOGO_URL  = SITE_URL + '/assets/img/favicon-512.png';
  const SAME_AS   = [
    'https://www.youtube.com/@HorexITSolutions',
    'https://www.instagram.com/horexitsolutions_/',
    'https://www.facebook.com/profile.php?id=61596749427169',
    'https://www.linkedin.com/company/horex-it-solutions/'
  ];

  /* ── helper: upsert a <script type="application/ld+json"> ─
     Each schema is keyed by `id` so re-renders update in place
     rather than appending duplicate tags.                      */
  function upsert(id, obj) {
    let el = document.getElementById('schema-' + id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id   = 'schema-' + id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(obj);
  }

  /* ── 1. LocalBusiness / ProfessionalService ───────────────*/
  upsert('localbusiness', {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': SITE_URL + '/#business',
    name: NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 512,
      height: 512
    },
    image: LOGO_URL,
    description: 'Horex IT Solutions builds websites, apps, and AI systems for businesses in Pali, Rajasthan, India — helping you get more customers online.',
    telephone: PHONE,
    email: EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pali',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.7718,
      longitude: 73.3234
    },
    areaServed: [
      { '@type': 'City',  name: 'Pali',     containedInPlace: { '@type': 'State', name: 'Rajasthan' } },
      { '@type': 'City',  name: 'Jodhpur',  containedInPlace: { '@type': 'State', name: 'Rajasthan' } },
      { '@type': 'City',  name: 'Jaipur',   containedInPlace: { '@type': 'State', name: 'Rajasthan' } },
      { '@type': 'State', name: 'Rajasthan', containedInPlace: { '@type': 'Country', name: 'India' } },
      { '@type': 'Country', name: 'India' }
    ],
    openingHours: 'Mo-Sa 09:00-21:00',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      opens: '09:00',
      closes: '21:00'
    },
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'UPI, Bank Transfer, Cash',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Digital Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Business Website Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mobile App Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Chatbot & Automation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Google Business Profile Setup' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Google Search SEO' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Meta Ads Management' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'WhatsApp Automation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Voice AI Agent' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Free Business Audit' } }
      ]
    },
    sameAs: SAME_AS
  });

  /* ── 2. Organization ──────────────────────────────────────*/
  upsert('organization', {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': SITE_URL + '/#organization',
    name: NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': SITE_URL + '/#logo',
      url: LOGO_URL,
      width: 512,
      height: 512,
      caption: NAME
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: PHONE,
        email: EMAIL,
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
          opens: '09:00',
          closes: '21:00'
        }
      },
      {
        '@type': 'ContactPoint',
        telephone: PHONE,
        contactType: 'sales',
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN'
      }
    ],
    sameAs: SAME_AS
  });

  /* ── 3. WebSite + SearchAction ────────────────────────────*/
  upsert('website', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_URL + '/#website',
    name: NAME,
    url: SITE_URL,
    description: 'Websites, apps, and AI systems for businesses in Pali, Rajasthan — helping you get more customers online.',
    publisher: { '@id': SITE_URL + '/#organization' },
    inLanguage: ['en-IN', 'hi-IN'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: SITE_URL + '/#services?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  });

  /* ── Public API for per-page dynamic schemas ──────────────
     Called by 03, 06, 07 after they render their FAQ/HowTo content.
     upsert() is used so navigating back to a page updates the schema
     in place — no duplicate <script> tags accumulate.          */

  /**
   * setFAQ(pageId, pairs)
   * pageId  – short string used as the schema element id, e.g. 'audit', 'website', 'app'
   * pairs   – array of [question, answer] tuples
   */
  function setFAQ(pageId, pairs) {
    if (!pairs || !pairs.length) return;
    upsert('faq-' + pageId, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pairs.map(function (p) {
        return {
          '@type': 'Question',
          name: p[0],
          acceptedAnswer: { '@type': 'Answer', text: p[1] }
        };
      })
    });
  }

  /**
   * setHowTo(pageId, title, steps)
   * pageId  – short string, e.g. 'app', 'website'
   * title   – the HowTo name, typically the service name
   * steps   – array of step description strings (3 items for every service)
   */
  function setHowTo(pageId, title, steps) {
    if (!steps || !steps.length) return;
    upsert('howto-' + pageId, {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to get ' + title + ' from ' + NAME,
      description: 'Three simple steps to get started with ' + title + '.',
      step: steps.map(function (text, i) {
        return {
          '@type': 'HowToStep',
          position: i + 1,
          name: 'Step ' + (i + 1),
          text: text
        };
      })
    });
  }

  /**
   * clearPageSchemas(pageId)
   * Remove FAQPage and HowTo schemas for a page when navigating away,
   * so stale schemas never linger for the wrong active view.
   */
  function clearPageSchemas(pageId) {
    ['faq-', 'howto-'].forEach(function (prefix) {
      var el = document.getElementById('schema-' + prefix + pageId);
      if (el) el.remove();
    });
  }

  window.HXSchema = { setFAQ: setFAQ, setHowTo: setHowTo, clearPageSchemas: clearPageSchemas };
})();
