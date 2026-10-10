const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3025;

// Load Pan-India 3-Million Geo-Taxonomy Database into Memory
let geoDb = { services: [], intents: [], locations: [] };
const geoDbPath = path.join(__dirname, 'data', 'geo_database.json');

if (fs.existsSync(geoDbPath)) {
  try {
    geoDb = JSON.parse(fs.readFileSync(geoDbPath, 'utf-8'));
    console.log(`[GEO-ENGINE] Loaded ${geoDb.locations.length} locations across India with ${geoDb.services.length * geoDb.intents.length} service intents (Total ${geoDb.locations.length * geoDb.services.length * geoDb.intents.length} URLs ready).`);
  } catch (err) {
    console.error('[GEO-ENGINE ERROR] Could not parse geo_database.json:', err.message);
  }
}

// Build O(1) Fast Lookup Map & District/City Clustering for internal linking
const locationMap = new Map();
const districtClusters = new Map();

if (geoDb.locations && geoDb.locations.length > 0) {
  for (const loc of geoDb.locations) {
    locationMap.set(loc.slug, loc);
    
    // Cluster by city or district for contextual internal linking
    const clusterKey = (loc.city || loc.district || loc.state || 'India').toLowerCase();
    if (!districtClusters.has(clusterKey)) {
      districtClusters.set(clusterKey, []);
    }
    districtClusters.get(clusterKey).push(loc);
  }
}

// Load Master Geo Taxonomy Resolver
require('./public/js/geo_resolver.js');

// Format Location string based on exact user specification
function formatLocationDisplay(locationSlug) {
  let cleanSlug = (locationSlug || '').toLowerCase();
  const fullName = typeof resolveSmartGeoLocation === 'function' 
    ? resolveSmartGeoLocation(cleanSlug, 'India')
    : (cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ', India');
  const shortName = fullName.split(',')[0].trim();

  let state = 'India';
  if (fullName.includes('Telangana')) state = 'Telangana';
  else if (fullName.includes('Andhra Pradesh')) state = 'Andhra Pradesh';
  else if (fullName.includes('Karnataka')) state = 'Karnataka';
  else if (fullName.includes('Tamil Nadu')) state = 'Tamil Nadu';
  else if (fullName.includes('Maharashtra')) state = 'Maharashtra';
  else if (fullName.includes('Gujarat')) state = 'Gujarat';
  else if (fullName.includes('Uttar Pradesh')) state = 'Uttar Pradesh';
  else if (fullName.includes('Kerala')) state = 'Kerala';

  return {
    shortName,
    fullName,
    state,
    city: '',
    district: ''
  };
}
// Human-friendly Service Name & Image Resolver
function resolveServiceDetails(serviceSlug) {
  const clean = (serviceSlug || '').toLowerCase();
  
  let intentText = '';
  if (clean.includes('-price-per-sqft')) {
    intentText = 'Price & Cost Per Sq.Ft';
  } else if (clean.includes('-dealers')) {
    intentText = 'Authorized Dealers & Suppliers';
  } else if (clean.includes('-installation-near-me')) {
    intentText = 'Fast Installation Near Me';
  }

  let baseServiceName = 'Safety Nets';
  let matchedImg = '/images/services/balcony-safety-nets.jpg?v=1790396500';

  if (clean.includes('invisible-grills') || clean.includes('grill')) {
    baseServiceName = 'SS Invisible Grills';
    matchedImg = '/images/services/invisible-grills.jpg?v=1790396500';
  } else if (clean.includes('cloth-hangers') || clean.includes('hanger') || clean.includes('drying')) {
    baseServiceName = 'SS Ceiling Cloth Drying Hangers';
    matchedImg = '/images/services/cloth-hangers.jpg?v=1790396500';
  } else if (clean.includes('spike')) {
    baseServiceName = 'Bird & Pigeon Protection Spikes';
    matchedImg = '/images/services/bird-pigeon-nets.jpg?v=1790396500';
  } else if (clean.includes('coconut')) {
    baseServiceName = 'Coconut Tree Safety Nets';
    matchedImg = '/images/services/balcony-safety-nets.jpg?v=1790396500';
  } else if (clean.includes('duct')) {
    baseServiceName = 'Duct Area Safety Nets';
    matchedImg = '/images/services/hdpe-nets.jpg?v=1790396500';
  } else if (clean.includes('bird') || clean.includes('pigeon')) {
    baseServiceName = 'Anti Bird & Pigeon Nets';
    matchedImg = '/images/services/bird-pigeon-nets.jpg?v=1790396500';
  } else if (clean.includes('balcony')) {
    baseServiceName = 'Balcony Safety Nets';
    matchedImg = '/images/services/balcony-safety-nets.jpg?v=1790396500';
  } else if (clean.includes('child') || clean.includes('cat') || clean.includes('pet')) {
    baseServiceName = 'Children & Pet Safety Nets';
    matchedImg = '/images/services/children-pet-safety-nets.jpg?v=1790396500';
  } else if (clean.includes('construction') || clean.includes('scaffolding')) {
    baseServiceName = 'Construction Safety Nets';
    matchedImg = '/images/services/construction-safety-nets.jpg?v=1790396500';
  } else if (clean.includes('cricket') || clean.includes('box-cricket') || clean.includes('football') || clean.includes('sports') || clean.includes('turf')) {
    baseServiceName = 'Sports Nets & Turf Arena';
    matchedImg = '/images/services/sports-nets-turf.jpg?v=1790396500';
  } else if (clean.includes('hdpe') || clean.includes('industrial')) {
    baseServiceName = 'Industrial HDPE Nets';
    matchedImg = '/images/services/hdpe-nets.jpg?v=1790396500';
  }

  const fullDisplayName = intentText ? `${baseServiceName} (${intentText})` : baseServiceName;

  return {
    baseServiceName,
    fullDisplayName,
    intentText,
    image: matchedImg
  };
}

// Generate single, clean, properly-encoded WhatsApp CTA URL
function generateWhatsAppUrl(serviceSlug, locationSlug, pageUrl) {
  const serviceInfo = resolveServiceDetails(serviceSlug);
  const locInfo = locationSlug ? formatLocationDisplay(locationSlug) : { fullName: 'India' };
  
  const isClothHangers = /hanger|cloth|drying|stand/i.test(serviceSlug || '');
  const closingLine = isClothHangers
    ? 'Please share pricing per piece / set, model options, technical specifications, and installation availability.'
    : 'Please share pricing per sq ft, technical specifications, and installation availability.';

  let msg = [
    `Hi GCM Safety Nets, I would like to inquire about *${serviceInfo.fullDisplayName}* in *${locInfo.fullName}*.`,
    '',
    `• Service: ${serviceInfo.fullDisplayName}`,
    `• Location: ${locInfo.fullName}`,
    `• Page: ${pageUrl}`,
    `• Website: www.gcmsafetynets.com`,
    '',
    closingLine
  ].join(String.fromCharCode(10));

  return 'https://wa.me/919912399224?text=' + encodeURIComponent(msg);
}

// Middleware
app.use(compression());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets with aggressive caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.xml') || filePath.endsWith('.txt')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// AI Discovery Header (GEO Protocol)
app.use((req, res, next) => {
  res.setHeader('Link', '<https://www.gcmsafetynets.com/llms.txt>; rel="describedby"; type="text/markdown"');
  next();
});

// Load Pre-rendered Views
const loadView = (viewName) => {
  const p = path.join(__dirname, 'views', viewName);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
};

// ==========================================
// 3 MILLION URLS SITEMAP INDEX & CHUNKS (1 to 60)
// ==========================================

// Master Sitemap Index: /sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');

  const today = new Date().toISOString().split('T')[0];
  const serviceIntentsCount = (geoDb.services.length || 18) * (geoDb.intents.length || 4);
  let totalCombinations = (geoDb.locations.length || 1) * serviceIntentsCount;
  const chunkSize = 50000;
  const totalChunks = Math.ceil(totalCombinations / chunkSize); // 62 sitemaps for 3,082,968 URLs

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Core pages sitemap
  xml += '  <sitemap>\n';
  xml += '    <loc>https://www.gcmsafetynets.com/sitemap-core.xml</loc>\n';
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '  </sitemap>\n';

  // 60 Programmatic chunked sitemaps
  for (let i = 1; i <= totalChunks; i++) {
    xml += '  <sitemap>\n';
    xml += `    <loc>https://www.gcmsafetynets.com/sitemap-${i}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }
  
  xml += '</sitemapindex>';
  res.send(xml);
});

// Core Pages Sitemap: /sitemap-core.xml
app.get('/sitemap-core.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const today = new Date().toISOString().split('T')[0];
  const coreUrls = [
    { loc: 'https://www.gcmsafetynets.com/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://www.gcmsafetynets.com/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/contact', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://www.gcmsafetynets.com/services/bird-pigeon-nets', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/balcony-safety-nets', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/children-pet-safety-nets', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/construction-safety-nets', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/sports-nets-turf', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/hdpe-nets', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/invisible-grills', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://www.gcmsafetynets.com/services/cloth-hangers', priority: '0.9', changefreq: 'weekly' }
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const u of coreUrls) {
    xml += '  <url>\n';
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>';
  res.send(xml);
});

// Dynamic 50,000-URL Chunked Sitemaps: /sitemap-:id.xml (1 to 60)
app.get('/sitemap-:id.xml', (req, res) => {
  const serviceIntentsCount = (geoDb.services.length || 18) * (geoDb.intents.length || 4);
  let totalCombinations = (geoDb.locations.length || 1) * serviceIntentsCount;
  const chunkSize = 50000;
  const totalChunks = Math.ceil(totalCombinations / chunkSize);

  const chunkId = parseInt(req.params.id, 10);
  if (isNaN(chunkId) || chunkId < 1 || chunkId > totalChunks) {
    return res.status(404).send('Sitemap chunk not found');
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');

  const today = new Date().toISOString().split('T')[0];
  const startIndex = (chunkId - 1) * chunkSize;
  const endIndex = startIndex + chunkSize;

  // Total services * intents = 60 paths per location
  const serviceIntents = [];
  const sList = geoDb.services.length > 0 ? geoDb.services : ['balcony-safety-nets', 'bird-pigeon-nets', 'sports-nets-turf', 'invisible-grills', 'hdpe-nets', 'construction-safety-nets'];
  const iList = geoDb.intents.length > 0 ? geoDb.intents : ['', '-price-per-sqft', '-dealers', '-installation-near-me'];
  
  for (const s of sList) {
    for (const it of iList) {
      serviceIntents.push(s + it);
    }
  }

  const totalLocs = geoDb.locations.length > 0 ? geoDb.locations.length : 1;
  totalCombinations = totalLocs * serviceIntents.length;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (let i = startIndex; i < endIndex && i < totalCombinations; i++) {
    const locIndex = Math.floor(i / serviceIntents.length) % totalLocs;
    const servIndex = i % serviceIntents.length;

    const loc = geoDb.locations[locIndex];
    const servSlug = serviceIntents[servIndex];

    xml += '  <url>\n';
    xml += `    <loc>https://www.gcmsafetynets.com/${servSlug}/${loc.slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  res.send(xml);
});

// ==========================================
// CORE PAGES & SERVICES
// ==========================================

app.get('/', (req, res) => {
  const homeHtml = loadView('home.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/');
  let rendered = (homeHtml || '<h1>GCM Safety Nets India</h1>')
    .replace(/{{WHATSAPP_URL}}/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/contact', (req, res) => {
  const contactHtml = loadView('contact.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/contact');
  let rendered = (contactHtml || '<h1>Contact GCM Safety Nets</h1>')
    .replace(/{{WHATSAPP_URL}}/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/blog', (req, res) => {
  const blogHtml = loadView('blog.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/blog');
  let rendered = (blogHtml || '<h1>Safety Nets Blog</h1>')
    .replace(/{{WHATSAPP_URL}}/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/services/:slug', (req, res) => {
  const slug = req.params.slug;
  const sHtml = loadView('service-' + slug + '.html');
  if (sHtml) {
    const pageUrl = 'https://www.gcmsafetynets.com/services/' + slug;
    const customWaUrl = generateWhatsAppUrl(slug, null, pageUrl);
    let rendered = sHtml
      .replace(/{{WHATSAPP_URL}}/g, customWaUrl)
      .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
      .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
    return res.send(rendered);
  }
  return res.redirect('/');
});

app.get('/state/:state', (req, res) => {
  const stateSlug = req.params.state.toLowerCase();
  const cityTemplate = loadView('city-template.html');
  if (cityTemplate) {
    let rendered = renderProgrammaticPage(cityTemplate, 'balcony-safety-nets', stateSlug);
    return res.send(rendered);
  }
  return res.redirect('/');
});

// ==========================================
// 3 MILLION PROGRAMMATIC JIT GEO-SILO ROUTER
// ==========================================

function renderProgrammaticPage(cityTemplate, serviceSlug, locationSlug) {
  const serviceInfo = resolveServiceDetails(serviceSlug);
  const locInfo = formatLocationDisplay(locationSlug);
  const canonicalUrl = 'https://www.gcmsafetynets.com/' + serviceSlug + '/' + locationSlug;
  const customWaUrl = generateWhatsAppUrl(serviceSlug, locationSlug, canonicalUrl);

  const pageTitle = 'Best ' + serviceInfo.fullDisplayName + ' in ' + locInfo.fullName + ' | 5-Year Warranty | GCM Safety Nets';
  const metaDesc = 'Certified Russea™ ' + serviceInfo.baseServiceName + ' in ' + locInfo.fullName + '. ISO 9001:2015 certified 100% virgin HDPE, 100+ kg load tested, 5-year replacement warranty, free on-site survey. Call 9912399224.';

  let rendered = cityTemplate
    .replaceAll('{{PAGE_TITLE}}', pageTitle)
    .replaceAll('{{META_DESC}}', metaDesc)
    .replaceAll('{{CANONICAL_URL}}', canonicalUrl)
    .replaceAll('{{WHATSAPP_URL}}', customWaUrl)
    .replaceAll('{{LOCATION_FULL}}', locInfo.fullName)
    .replaceAll('{{LOCATION_SHORT}}', locInfo.shortName)
    .replaceAll('{{LOCATION_SLUG}}', locationSlug)
    .replaceAll('{{SERVICE_NAME}}', serviceInfo.fullDisplayName)
    .replaceAll('{{SERVICE_BASE}}', serviceInfo.baseServiceName)
    .replaceAll('{{SERVICE_SLUG}}', serviceSlug)
    .replaceAll('{{SERVICE_IMG}}', serviceInfo.image)
    .replaceAll('Garware', 'Russea™')
    .replaceAll('garware', 'russea');

  // Fallback cleanup if any old hardcoded links exist
  
  

  // Dynamic Internal Linking Web (Injecting 12-14 nearby hubs from the same city/district/state)
  const clusterKey = (locInfo.city || locInfo.district || locInfo.state || 'India').toLowerCase();
  const cluster = districtClusters.get(clusterKey) || [];
  if (cluster.length > 0) {
    const nearbyLinks = cluster
      .filter(l => l.slug !== locationSlug)
      .slice(0, 14)
      .map(l => '<a href="/' + serviceSlug + '/' + l.slug + '" class="city-chip" style="margin:4px;">' + l.name + '</a>')
      .join(' ');
    
    rendered = rendered.replace(/<div class="sidebar-cities-grid"[^>]*>[\s\S]*?<\/div>/i, '<div class="sidebar-cities-grid" style="display:flex; flex-wrap:wrap; gap:8px;">' + nearbyLinks + '</div>');
  }

  return rendered;
}
// Auto-redirect hyphenated slugs /service-in-location -> /service/location
app.get('/:slug([a-z0-9-]+-in-[a-z0-9-]+)', (req, res) => {
  const slug = req.params.slug;
  const match = slug.match(/^([a-z0-9-]+)-in-([a-z0-9-]+)$/i);
  if (match) {
    return res.redirect(301, '/' + match[1] + '/' + match[2]);
  }
  res.redirect(301, '/');
});

app.get('/:service/:location', (req, res) => {
  const serviceSlug = req.params.service;
  const locationSlug = req.params.location;

  // Auto-clean any synthetic suffix and 301 redirect to clean canonical location
  const cleanLocationSlug = locationSlug.replace(/-(phase|road|sector|extension|colony|layout|apartments|gated-community|main-road|cross|junction|street|lane|marg|avenue)$/i, '');
  if (cleanLocationSlug !== locationSlug && (locationMap.has(cleanLocationSlug) || !locationMap.has(locationSlug))) {
    return res.redirect(301, '/' + serviceSlug + '/' + cleanLocationSlug);
  }

  const cityTemplate = loadView('city-template.html');

  if (cityTemplate) {
    const rendered = renderProgrammaticPage(cityTemplate, serviceSlug, locationSlug);
    return res.send(rendered);
  }

  const homeHtml = loadView('home.html');
  res.send(homeHtml || '<h1>GCM Safety Nets</h1>');
});
app.post('/contact/submit', (req, res) => {
  console.log('Lead received:', req.body);
  res.json({ success: true, message: 'Inquiry received. Our specialist will contact you in 15 minutes.' });
});

// IndexNow & Tracking Protocol
app.all('/track*', (req, res) => res.json({ status: 'ok' }));
app.all('/indexnow*', (req, res) => res.json({ status: 'ok' }));

// Zero-404 Fallback
app.use((req, res) => {
  const homeHtml = loadView('home.html');
  res.status(200).send(homeHtml || '<h1>GCM Safety Nets</h1>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[GCM PAN-INDIA ENGINE] Running on port ${PORT} with 3 Million programmatic landing pages.`);
});
