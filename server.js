const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3025;

// City to State Map for high-precision WhatsApp messaging
const cityStateMap = {
  "hyderabad": "Hyderabad, Telangana",
  "secunderabad": "Secunderabad, Telangana",
  "bangalore": "Bangalore, Karnataka",
  "bengaluru": "Bengaluru, Karnataka",
  "mysore": "Mysore, Karnataka",
  "mysuru": "Mysuru, Karnataka",
  "chennai": "Chennai, Tamil Nadu",
  "coimbatore": "Coimbatore, Tamil Nadu",
  "madurai": "Madurai, Tamil Nadu",
  "mumbai": "Mumbai, Maharashtra",
  "pune": "Pune, Maharashtra",
  "nagpur": "Nagpur, Maharashtra",
  "nashik": "Nashik, Maharashtra",
  "thane": "Thane, Maharashtra",
  "navi-mumbai": "Navi Mumbai, Maharashtra",
  "indore": "Indore, Madhya Pradesh",
  "bhopal": "Bhopal, Madhya Pradesh",
  "delhi": "Delhi NCR",
  "noida": "Noida, Uttar Pradesh",
  "gurgaon": "Gurgaon, Haryana",
  "gurugram": "Gurugram, Haryana",
  "ghaziabad": "Ghaziabad, Uttar Pradesh",
  "faridabad": "Faridabad, Haryana",
  "kolkata": "Kolkata, West Bengal",
  "ahmedabad": "Ahmedabad, Gujarat",
  "surat": "Surat, Gujarat",
  "vadodara": "Vadodara, Gujarat",
  "rajkot": "Rajkot, Gujarat",
  "jaipur": "Jaipur, Rajasthan",
  "jodhpur": "Jodhpur, Rajasthan",
  "udaipur": "Udaipur, Rajasthan",
  "kochi": "Kochi, Kerala",
  "cochin": "Cochin, Kerala",
  "trivandrum": "Trivandrum, Kerala",
  "thiruvananthapuram": "Thiruvananthapuram, Kerala",
  "calicut": "Calicut, Kerala",
  "kozhikode": "Kozhikode, Kerala",
  "visakhapatnam": "Visakhapatnam, Andhra Pradesh",
  "vizag": "Vizag, Andhra Pradesh",
  "vijayawada": "Vijayawada, Andhra Pradesh",
  "guntur": "Guntur, Andhra Pradesh",
  "tirupati": "Tirupati, Andhra Pradesh",
  "nellore": "Nellore, Andhra Pradesh",
  "kurnool": "Kurnool, Andhra Pradesh",
  "rajahmundry": "Rajahmundry, Andhra Pradesh",
  "kakinada": "Kakinada, Andhra Pradesh",
  "warangal": "Warangal, Telangana",
  "karimnagar": "Karimnagar, Telangana",
  "nizamabad": "Nizamabad, Telangana",
  "khammam": "Khammam, Telangana",
  "hubli": "Hubli, Karnataka",
  "dharwad": "Dharwad, Karnataka",
  "mangalore": "Mangalore, Karnataka",
  "belgaum": "Belgaum, Karnataka",
  "belagavi": "Belagavi, Karnataka",
  "gulbarga": "Gulbarga, Karnataka",
  "kalaburagi": "Kalaburagi, Karnataka",
  "patna": "Patna, Bihar",
  "lucknow": "Lucknow, Uttar Pradesh",
  "kanpur": "Kanpur, Uttar Pradesh",
  "varanasi": "Varanasi, Uttar Pradesh",
  "agra": "Agra, Uttar Pradesh",
  "prayagraj": "Prayagraj, Uttar Pradesh",
  "meerut": "Meerut, Uttar Pradesh",
  "chandigarh": "Chandigarh",
  "mohali": "Mohali, Punjab",
  "panchkula": "Panchkula, Haryana",
  "ludhiana": "Ludhiana, Punjab",
  "amritsar": "Amritsar, Punjab",
  "jalandhar": "Jalandhar, Punjab",
  "bhubaneswar": "Bhubaneswar, Odisha",
  "cuttack": "Cuttack, Odisha",
  "raipur": "Raipur, Chhattisgarh",
  "ranchi": "Ranchi, Jharkhand",
  "jamshedpur": "Jamshedpur, Jharkhand",
  "guwahati": "Guwahati, Assam",
  "goa": "Goa",
  "panaji": "Panaji, Goa",
  "dehradun": "Dehradun, Uttarakhand"
};

function getCityLocation(citySlug) {
  if (!citySlug) return 'India';
  const clean = citySlug.toLowerCase().trim();
  if (cityStateMap[clean]) return cityStateMap[clean];
  return citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getServiceName(serviceSlug) {
  if (!serviceSlug) return 'Safety Nets';
  return serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function generateWhatsAppUrl(serviceSlug, citySlug, pageUrl) {
  const serviceName = getServiceName(serviceSlug);
  const locationName = citySlug ? getCityLocation(citySlug) : 'India';
  const isClothHangers = /hanger|cloth|drying|stand/i.test(serviceSlug || '');
  const closingLine = isClothHangers
    ? 'Please share pricing per piece / set, model options, technical specifications, and installation availability.'
    : 'Please share pricing per sq ft, technical specifications, and installation availability.';

  let msg = '';
  if (citySlug) {
    msg = 'Hi GCM Safety Nets, I would like to inquire about ' + serviceName + ' in ' + locationName + '.\n\n' +
          '* Service: ' + serviceName + '\n' +
          '* Location: ' + locationName + '\n' +
          '* Page: ' + pageUrl + '\n' +
          '* Website: www.gcmsafetynets.com\n\n' +
          closingLine;
  } else if (serviceSlug) {
    msg = 'Hi GCM Safety Nets, I would like to inquire about ' + serviceName + '.\n\n' +
          '* Service: ' + serviceName + '\n' +
          '* Location: India\n' +
          '* Page: ' + pageUrl + '\n' +
          '* Website: www.gcmsafetynets.com\n\n' +
          closingLine;
  } else {
    msg = 'Hi GCM Safety Nets, I would like to inquire about Safety Nets installation.\n\n' +
          '* Service: Safety Nets & Anti Bird Protection\n' +
          '* Location: India\n' +
          '* Page: ' + pageUrl + '\n' +
          '* Website: www.gcmsafetynets.com\n\n' +
          'Please share pricing per sq ft, technical specifications, and installation availability.';
  }

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
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/');
  let rendered = (homeHtml || '<h1>GCM Safety Nets India</h1>')
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"\'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["\'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/contact', (req, res) => {
  const contactHtml = loadView('contact.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/contact');
  let rendered = (contactHtml || '<h1>Contact GCM Safety Nets</h1>')
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"\'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["\'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/blog', (req, res) => {
  const blogHtml = loadView('blog.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/blog');
  let rendered = (blogHtml || '<h1>Safety Nets Blog</h1>')
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"\'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["\'\s>])/g, customWaUrl);
  res.send(rendered);
});

// Services routes (e.g. /services/balcony-safety-nets)
app.get('/services/:slug', (req, res) => {
  const slug = req.params.slug;
  const sHtml = loadView('service-' + slug + '.html');
  if (sHtml) {
    const pageUrl = 'https://www.gcmsafetynets.com/services/' + slug;
    const customWaUrl = generateWhatsAppUrl(slug, null, pageUrl);
    let rendered = sHtml
      .replace(/https:\/\/wa\.me\/919912399224\?text=[^"\'\s>]+/g, customWaUrl)
      .replace(/https:\/\/wa\.me\/919912399224(?=["\'\s>])/g, customWaUrl);
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

    // Generate accurate custom WhatsApp pre-filled message matching gcm.enterprises pattern
    const pageUrl = 'https://www.gcmsafetynets.com/' + serviceSlug + '/' + citySlug;
    const customWaUrl = generateWhatsAppUrl(serviceSlug, citySlug, pageUrl);

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
