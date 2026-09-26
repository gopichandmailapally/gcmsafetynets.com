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
  setHeaders: (res, path) => {
    if (path.endsWith('.html') || path.endsWith('.xml') || path.endsWith('.txt')) {
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

const homeHtml = loadView('home.html');
const contactHtml = loadView('contact.html');
const blogHtml = loadView('blog.html');
const cityTemplate = loadView('city-template.html');

// Routes
app.get('/', (req, res) => {
  res.send(homeHtml || '<h1>GCM Safety Nets India</h1>');
});

app.get('/contact', (req, res) => {
  res.send(contactHtml || '<h1>Contact GCM Safety Nets</h1>');
});

app.get('/blog', (req, res) => {
  res.send(blogHtml || '<h1>Safety Nets Blog</h1>');
});

// Services routes
app.get('/services/:slug', (req, res) => {
  const slug = req.params.slug;
  const sHtml = loadView(`service-${slug}.html`);
  if (sHtml) {
    return res.send(sHtml);
  }
  return res.redirect('/');
});

// Programmatic Dynamic City/Service Routes (e.g. /anti-bird-net/hyderabad, /balcony-safety-nets/mumbai)
app.get('/:service/:city', (req, res) => {
  const serviceSlug = req.params.service;
  const citySlug = req.params.city;

  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const serviceName = serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (cityTemplate) {
    let rendered = cityTemplate;
    rendered = rendered.replace(/Hyderabad/g, cityName);
    rendered = rendered.replace(/hyderabad/g, citySlug);
    rendered = rendered.replace(/Anti Bird Net/g, serviceName);
    rendered = rendered.replace(/anti-bird-net/g, serviceSlug);
    rendered = rendered.replace(/Garware/g, 'Russea™');
    rendered = rendered.replace(/garware/g, 'russea');
    return res.send(rendered);
  }

  res.send(homeHtml);
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
  res.status(200).send(homeHtml);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GCM Safety Nets (gcmsafetynets.com) running on port ${PORT}`);
});
