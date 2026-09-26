const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3025;

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
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    }
  }
}));

// AI Discovery Header (GEO)
app.use((req, res, next) => {
  res.setHeader('Link', '<https://www.gcmsafetynets.com/llms.txt>; rel="describedby"; type="text/markdown"');
  next();
});

// Load Pre-rendered Views
const loadView = (viewName) => {
  const p = path.join(__dirname, 'views', viewName);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null;
};

// Routes
app.get('/', (req, res) => {
  const homeHtml = loadView('home.html');
  res.send(homeHtml || '<h1>GCM Safety Nets India</h1>');
});

app.get('/contact', (req, res) => {
  const contactHtml = loadView('contact.html');
  res.send(contactHtml || '<h1>Contact GCM Safety Nets</h1>');
});

app.get('/blog', (req, res) => {
  const blogHtml = loadView('blog.html');
  res.send(blogHtml || '<h1>Safety Nets Blog</h1>');
});

// Services routes (e.g. /services/balcony-safety-nets)
app.get('/services/:slug', (req, res) => {
  const slug = req.params.slug;
  const sHtml = loadView('service-' + slug + '.html');
  if (sHtml) {
    const serviceName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const customWaMsg = 'Hi GCM Safety Nets, I am looking for ' + serviceName + ' installation. Please share details and schedule a free site survey.';
    const customWaUrl = 'https://wa.me/919912399224?text=' + encodeURIComponent(customWaMsg);
    let rendered = sHtml.replace(/https:\/\/wa\.me\/919912399224\?text=[^"\'\s>]+/g, customWaUrl);
    rendered = rendered.replace(/https:\/\/wa\.me\/919912399224(?=["\'\s>])/g, customWaUrl);
    return res.send(rendered);
  }
  return res.redirect('/');
});

// Programmatic Dynamic City/Service Routes (e.g. /anti-bird-net/indore, /balcony-safety-nets/mumbai)
app.get('/:service/:city', (req, res) => {
  const serviceSlug = req.params.service;
  const citySlug = req.params.city;

  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const serviceName = serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const cityTemplate = loadView('city-template.html');

  if (cityTemplate) {
    let rendered = cityTemplate;

    // Replace city and service names
    rendered = rendered.replace(/Hyderabad/g, cityName);
    rendered = rendered.replace(/hyderabad/g, citySlug);
    rendered = rendered.replace(/Anti Bird Net/g, serviceName);
    rendered = rendered.replace(/anti-bird-net/g, serviceSlug);
    rendered = rendered.replace(/Garware/g, 'Russea™');
    rendered = rendered.replace(/garware/g, 'russea');

    // Dynamic WhatsApp custom message tailored precisely to service and area without mismatch
    const customWaMsg = 'Hi GCM Safety Nets, I am looking for ' + serviceName + ' installation in ' + cityName + '. Please share details and schedule a free site survey.';
    const customWaUrl = 'https://wa.me/919912399224?text=' + encodeURIComponent(customWaMsg);

    rendered = rendered.replace(/https:\/\/wa\.me\/919912399224\?text=[^"\'\s>]+/g, customWaUrl);
    rendered = rendered.replace(/https:\/\/wa\.me\/919912399224(?=["\'\s>])/g, customWaUrl);

    // Dynamic Service Image matching
    const serviceImgMap = {
      'pigeon': '/images/services/bird-pigeon-nets.jpg?v=1790396500',
      'bird': '/images/services/bird-pigeon-nets.jpg?v=1790396500',
      'balcony': '/images/services/balcony-safety-nets.jpg?v=1790396500',
      'child': '/images/services/children-pet-safety-nets.jpg?v=1790396500',
      'pet': '/images/services/children-pet-safety-nets.jpg?v=1790396500',
      'construction': '/images/services/construction-safety-nets.jpg?v=1790396500',
      'sports': '/images/services/sports-nets-turf.jpg?v=1790396500',
      'cricket': '/images/services/sports-nets-turf.jpg?v=1790396500',
      'hdpe': '/images/services/hdpe-nets.jpg?v=1790396500',
      'grill': '/images/services/invisible-grills.jpg?v=1790396500',
      'hanger': '/images/services/cloth-hangers.jpg?v=1790396500'
    };
    let matchedImg = '/images/services/balcony-safety-nets.jpg?v=1790396500';
    for (const [k, v] of Object.entries(serviceImgMap)) {
      if (serviceSlug.includes(k)) {
        matchedImg = v;
        break;
      }
    }
    rendered = rendered.replace(/\/images\/services\/bird-pigeon-nets\.jpg\?v=1790396500/g, matchedImg);

    return res.send(rendered);
  }

  const homeHtml = loadView('home.html');
  res.send(homeHtml || '<h1>GCM Safety Nets</h1>');
});

// Contact form API
app.post('/contact/submit', (req, res) => {
  console.log('Lead received:', req.body);
  res.json({ success: true, message: 'Inquiry received. Our specialist will contact you in 15 minutes.' });
});

// Tracking & IndexNow API
app.all('/track*', (req, res) => res.json({ status: 'ok' }));
app.all('/indexnow*', (req, res) => res.json({ status: 'ok' }));

// Zero-404 Fallback
app.use((req, res) => {
  const homeHtml = loadView('home.html');
  res.status(200).send(homeHtml || '<h1>GCM Safety Nets</h1>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('GCM Safety Nets server running on port ' + PORT);
});
