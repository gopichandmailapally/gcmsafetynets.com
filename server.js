const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3025;

// Comprehensive Pan-India City to State Mapping (28 States + 8 UTs + 250+ Hubs)
const cityStateMap = {
  // TELANGANA
  "hyderabad": "Hyderabad, Telangana",
  "secunderabad": "Secunderabad, Telangana",
  "cyberabad": "Cyberabad, Telangana",
  "warangal": "Warangal, Telangana",
  "karimnagar": "Karimnagar, Telangana",
  "nizamabad": "Nizamabad, Telangana",
  "khammam": "Khammam, Telangana",
  "ramagundam": "Ramagundam, Telangana",
  "mahbubnagar": "Mahbubnagar, Telangana",
  "nalgonda": "Nalgonda, Telangana",
  "adilabad": "Adilabad, Telangana",
  "siddipet": "Siddipet, Telangana",
  "suryapet": "Suryapet, Telangana",
  "miryalaguda": "Miryalaguda, Telangana",
  "jagtial": "Jagtial, Telangana",
  "nirmal": "Nirmal, Telangana",
  "kothagudem": "Kothagudem, Telangana",
  "mancherial": "Mancherial, Telangana",
  "kamareddy": "Kamareddy, Telangana",
  "sangareddy": "Sangareddy, Telangana",
  "medak": "Medak, Telangana",

  // ANDHRA PRADESH
  "visakhapatnam": "Visakhapatnam, Andhra Pradesh",
  "vizag": "Vizag, Andhra Pradesh",
  "vijayawada": "Vijayawada, Andhra Pradesh",
  "guntur": "Guntur, Andhra Pradesh",
  "nellore": "Nellore, Andhra Pradesh",
  "kurnool": "Kurnool, Andhra Pradesh",
  "kakinada": "Kakinada, Andhra Pradesh",
  "rajahmundry": "Rajahmundry, Andhra Pradesh",
  "tirupati": "Tirupati, Andhra Pradesh",
  "kadapa": "Kadapa, Andhra Pradesh",
  "anantapur": "Anantapur, Andhra Pradesh",
  "vizianagaram": "Vizianagaram, Andhra Pradesh",
  "eluru": "Eluru, Andhra Pradesh",
  "ongole": "Ongole, Andhra Pradesh",
  "nandyal": "Nandyal, Andhra Pradesh",
  "machilipatnam": "Machilipatnam, Andhra Pradesh",
  "tenali": "Tenali, Andhra Pradesh",
  "proddatur": "Proddatur, Andhra Pradesh",
  "chittoor": "Chittoor, Andhra Pradesh",
  "hindupur": "Hindupur, Andhra Pradesh",
  "bhimavaram": "Bhimavaram, Andhra Pradesh",
  "madanapalle": "Madanapalle, Andhra Pradesh",
  "srikakulam": "Srikakulam, Andhra Pradesh",
  "sri-city": "Sri City, Andhra Pradesh",

  // KARNATAKA
  "bangalore": "Bangalore, Karnataka",
  "bengaluru": "Bengaluru, Karnataka",
  "mysore": "Mysore, Karnataka",
  "mysuru": "Mysuru, Karnataka",
  "hubli": "Hubli, Karnataka",
  "dharwad": "Dharwad, Karnataka",
  "mangalore": "Mangalore, Karnataka",
  "mangaluru": "Mangaluru, Karnataka",
  "belgaum": "Belgaum, Karnataka",
  "belagavi": "Belagavi, Karnataka",
  "gulbarga": "Gulbarga, Karnataka",
  "kalaburagi": "Kalaburagi, Karnataka",
  "davanagere": "Davanagere, Karnataka",
  "bellary": "Bellary, Karnataka",
  "ballari": "Ballari, Karnataka",
  "shimoga": "Shimoga, Karnataka",
  "shivamogga": "Shivamogga, Karnataka",
  "tumkur": "Tumkur, Karnataka",
  "tumakuru": "Tumakuru, Karnataka",
  "raichur": "Raichur, Karnataka",
  "bidar": "Bidar, Karnataka",
  "hospet": "Hospet, Karnataka",
  "hosapete": "Hosapete, Karnataka",
  "udupi": "Udupi, Karnataka",
  "hassan": "Hassan, Karnataka",
  "chitradurga": "Chitradurga, Karnataka",
  "kolar": "Kolar, Karnataka",
  "mandya": "Mandya, Karnataka",
  "chikmagalur": "Chikmagalur, Karnataka",
  "whitefield": "Whitefield, Bangalore",
  "electronic-city": "Electronic City, Bangalore",

  // TAMIL NADU
  "chennai": "Chennai, Tamil Nadu",
  "coimbatore": "Coimbatore, Tamil Nadu",
  "madurai": "Madurai, Tamil Nadu",
  "tiruchirappalli": "Tiruchirappalli, Tamil Nadu",
  "trichy": "Trichy, Tamil Nadu",
  "salem": "Salem, Tamil Nadu",
  "tirunelveli": "Tirunelveli, Tamil Nadu",
  "tiruppur": "Tiruppur, Tamil Nadu",
  "ranipet": "Ranipet, Tamil Nadu",
  "nagercoil": "Nagercoil, Tamil Nadu",
  "thanjavur": "Thanjavur, Tamil Nadu",
  "vellore": "Vellore, Tamil Nadu",
  "kancheepuram": "Kancheepuram, Tamil Nadu",
  "erode": "Erode, Tamil Nadu",
  "tiruvannamalai": "Tiruvannamalai, Tamil Nadu",
  "pollachi": "Pollachi, Tamil Nadu",
  "rajapalayam": "Rajapalayam, Tamil Nadu",
  "sivakasi": "Sivakasi, Tamil Nadu",
  "pudukkottai": "Pudukkottai, Tamil Nadu",
  "hosur": "Hosur, Tamil Nadu",
  "thoothukudi": "Thoothukudi, Tamil Nadu",
  "dindigul": "Dindigul, Tamil Nadu",
  "cuddalore": "Cuddalore, Tamil Nadu",
  "kumbakonam": "Kumbakonam, Tamil Nadu",
  "karur": "Karur, Tamil Nadu",
  "omr-chennai": "OMR Chennai, Tamil Nadu",

  // KERALA
  "kochi": "Kochi, Kerala",
  "cochin": "Cochin, Kerala",
  "trivandrum": "Trivandrum, Kerala",
  "thiruvananthapuram": "Thiruvananthapuram, Kerala",
  "kozhikode": "Kozhikode, Kerala",
  "calicut": "Calicut, Kerala",
  "kollam": "Kollam, Kerala",
  "thrissur": "Thrissur, Kerala",
  "palakkad": "Palakkad, Kerala",
  "alappuzha": "Alappuzha, Kerala",
  "malappuram": "Malappuram, Kerala",
  "kannur": "Kannur, Kerala",
  "kottayam": "Kottayam, Kerala",
  "kasaragod": "Kasaragod, Kerala",
  "wayanad": "Wayanad, Kerala",
  "pathanamthitta": "Pathanamthitta, Kerala",
  "idukki": "Idukki, Kerala",

  // MAHARASHTRA
  "mumbai": "Mumbai, Maharashtra",
  "pune": "Pune, Maharashtra",
  "nagpur": "Nagpur, Maharashtra",
  "thane": "Thane, Maharashtra",
  "pimpri-chinchwad": "Pimpri Chinchwad, Maharashtra",
  "nashik": "Nashik, Maharashtra",
  "kalyan-dombivli": "Kalyan-Dombivli, Maharashtra",
  "vasai-virar": "Vasai-Virar, Maharashtra",
  "navi-mumbai": "Navi Mumbai, Maharashtra",
  "aurangabad": "Aurangabad, Maharashtra",
  "chhatrapati-sambhajinagar": "Chhatrapati Sambhajinagar, Maharashtra",
  "solapur": "Solapur, Maharashtra",
  "mira-bhayandar": "Mira-Bhayandar, Maharashtra",
  "bhiwandi": "Bhiwandi, Maharashtra",
  "amravati": "Amravati, Maharashtra",
  "nanded": "Nanded, Maharashtra",
  "kolhapur": "Kolhapur, Maharashtra",
  "akola": "Akola, Maharashtra",
  "ulhasnagar": "Ulhasnagar, Maharashtra",
  "sangli": "Sangli, Maharashtra",
  "malegaon": "Malegaon, Maharashtra",
  "jalgaon": "Jalgaon, Maharashtra",
  "latur": "Latur, Maharashtra",
  "dhule": "Dhule, Maharashtra",
  "ahmednagar": "Ahmednagar, Maharashtra",
  "chandrapur": "Chandrapur, Maharashtra",
  "parbhani": "Parbhani, Maharashtra",
  "jalna": "Jalna, Maharashtra",
  "panvel": "Panvel, Maharashtra",
  "satara": "Satara, Maharashtra",
  "ratnagiri": "Ratnagiri, Maharashtra",
  "hinjewadi": "Hinjewadi, Pune",

  // GUJARAT
  "ahmedabad": "Ahmedabad, Gujarat",
  "surat": "Surat, Gujarat",
  "vadodara": "Vadodara, Gujarat",
  "rajkot": "Rajkot, Gujarat",
  "bhavnagar": "Bhavnagar, Gujarat",
  "jamnagar": "Jamnagar, Gujarat",
  "junagadh": "Junagadh, Gujarat",
  "gandhinagar": "Gandhinagar, Gujarat",
  "gandhidham": "Gandhidham, Gujarat",
  "anand": "Anand, Gujarat",
  "navsari": "Navsari, Gujarat",
  "morbi": "Morbi, Gujarat",
  "nadiad": "Nadiad, Gujarat",
  "surendranagar": "Surendranagar, Gujarat",
  "bharuch": "Bharuch, Gujarat",
  "mehsana": "Mehsana, Gujarat",
  "bhuj": "Bhuj, Gujarat",
  "porbandar": "Porbandar, Gujarat",
  "palanpur": "Palanpur, Gujarat",
  "valsad": "Valsad, Gujarat",
  "vapi": "Vapi, Gujarat",
  "sanand": "Sanand, Gujarat",
  "dholera": "Dholera, Gujarat",

  // GOA
  "goa": "Goa",
  "panaji": "Panaji, Goa",
  "margao": "Margao, Goa",
  "vasco-da-gama": "Vasco da Gama, Goa",
  "mapusa": "Mapusa, Goa",
  "ponda": "Ponda, Goa",

  // MADHYA PRADESH
  "indore": "Indore, Madhya Pradesh",
  "bhopal": "Bhopal, Madhya Pradesh",
  "jabalpur": "Jabalpur, Madhya Pradesh",
  "gwalior": "Gwalior, Madhya Pradesh",
  "ujjain": "Ujjain, Madhya Pradesh",
  "sagar": "Sagar, Madhya Pradesh",
  "dewas": "Dewas, Madhya Pradesh",
  "satna": "Satna, Madhya Pradesh",
  "ratlam": "Ratlam, Madhya Pradesh",
  "rewa": "Rewa, Madhya Pradesh",
  "singrauli": "Singrauli, Madhya Pradesh",
  "burhanpur": "Burhanpur, Madhya Pradesh",
  "khandwa": "Khandwa, Madhya Pradesh",
  "chhindwara": "Chhindwara, Madhya Pradesh",
  "pithampur": "Pithampur, Madhya Pradesh",

  // CHHATTISGARH
  "raipur": "Raipur, Chhattisgarh",
  "bhilai": "Bhilai, Chhattisgarh",
  "bilaspur": "Bilaspur, Chhattisgarh",
  "korba": "Korba, Chhattisgarh",
  "rajnandgaon": "Rajnandgaon, Chhattisgarh",
  "jagdalpur": "Jagdalpur, Chhattisgarh",
  "raigarh": "Raigarh, Chhattisgarh",
  "durg": "Durg, Chhattisgarh",

  // DELHI NCR & UT
  "delhi": "Delhi NCR",
  "new-delhi": "New Delhi",
  "ncr": "Delhi NCR",
  "dwarka": "Dwarka, Delhi",
  "rohini": "Rohini, Delhi",
  "south-delhi": "South Delhi",

  // UTTAR PRADESH
  "noida": "Noida, Uttar Pradesh",
  "greater-noida": "Greater Noida, Uttar Pradesh",
  "ghaziabad": "Ghaziabad, Uttar Pradesh",
  "lucknow": "Lucknow, Uttar Pradesh",
  "kanpur": "Kanpur, Uttar Pradesh",
  "agra": "Agra, Uttar Pradesh",
  "meerut": "Meerut, Uttar Pradesh",
  "varanasi": "Varanasi, Uttar Pradesh",
  "prayagraj": "Prayagraj, Uttar Pradesh",
  "allahabad": "Prayagraj, Uttar Pradesh",
  "bareilly": "Bareilly, Uttar Pradesh",
  "aligarh": "Aligarh, Uttar Pradesh",
  "moradabad": "Moradabad, Uttar Pradesh",
  "saharanpur": "Saharanpur, Uttar Pradesh",
  "gorakhpur": "Gorakhpur, Uttar Pradesh",
  "firozabad": "Firozabad, Uttar Pradesh",
  "jhansi": "Jhansi, Uttar Pradesh",
  "muzaffarnagar": "Muzaffarnagar, Uttar Pradesh",
  "mathura": "Mathura, Uttar Pradesh",
  "ayodhya": "Ayodhya, Uttar Pradesh",

  // HARYANA
  "gurgaon": "Gurgaon, Haryana",
  "gurugram": "Gurugram, Haryana",
  "faridabad": "Faridabad, Haryana",
  "panipat": "Panipat, Haryana",
  "ambala": "Ambala, Haryana",
  "yamunanagar": "Yamunanagar, Haryana",
  "rohtak": "Rohtak, Haryana",
  "hisar": "Hisar, Haryana",
  "karnal": "Karnal, Haryana",
  "sonipat": "Sonipat, Haryana",
  "panchkula": "Panchkula, Haryana",
  "manesar": "Manesar, Haryana",
  "bahadurgarh": "Bahadurgarh, Haryana",
  "rewari": "Rewari, Haryana",

  // PUNJAB & CHANDIGARH
  "chandigarh": "Chandigarh",
  "ludhiana": "Ludhiana, Punjab",
  "amritsar": "Amritsar, Punjab",
  "jalandhar": "Jalandhar, Punjab",
  "patiala": "Patiala, Punjab",
  "bathinda": "Bathinda, Punjab",
  "mohali": "Mohali, Punjab",
  "hoshiarpur": "Hoshiarpur, Punjab",
  "pathankot": "Pathankot, Punjab",
  "moga": "Moga, Punjab",

  // RAJASTHAN
  "jaipur": "Jaipur, Rajasthan",
  "jodhpur": "Jodhpur, Rajasthan",
  "kota": "Kota, Rajasthan",
  "bikaner": "Bikaner, Rajasthan",
  "ajmer": "Ajmer, Rajasthan",
  "udaipur": "Udaipur, Rajasthan",
  "bhilwara": "Bhilwara, Rajasthan",
  "alwar": "Alwar, Rajasthan",
  "bharatpur": "Bharatpur, Rajasthan",
  "sikar": "Sikar, Rajasthan",
  "pali": "Pali, Rajasthan",
  "sri-ganganagar": "Sri Ganganagar, Rajasthan",
  "bhiwadi": "Bhiwadi, Rajasthan",

  // UTTARAKHAND & HIMACHAL PRADESH
  "dehradun": "Dehradun, Uttarakhand",
  "haridwar": "Haridwar, Uttarakhand",
  "roorkee": "Roorkee, Uttarakhand",
  "rishikesh": "Rishikesh, Uttarakhand",
  "haldwani": "Haldwani, Uttarakhand",
  "rudrapur": "Rudrapur, Uttarakhand",
  "nainital": "Nainital, Uttarakhand",
  "shimla": "Shimla, Himachal Pradesh",
  "dharamshala": "Dharamshala, Himachal Pradesh",
  "solan": "Solan, Himachal Pradesh",
  "mandi": "Mandi, Himachal Pradesh",
  "baddi": "Baddi, Himachal Pradesh",
  "kullu": "Kullu, Himachal Pradesh",

  // JAMMU & KASHMIR
  "jammu": "Jammu, Jammu & Kashmir",
  "srinagar": "Srinagar, Jammu & Kashmir",
  "anantnag": "Anantnag, Jammu & Kashmir",
  "udhampur": "Udhampur, Jammu & Kashmir",

  // WEST BENGAL
  "kolkata": "Kolkata, West Bengal",
  "howrah": "Howrah, West Bengal",
  "asansol": "Asansol, West Bengal",
  "siliguri": "Siliguri, West Bengal",
  "durgapur": "Durgapur, West Bengal",
  "bardhaman": "Bardhaman, West Bengal",
  "malda": "Malda, West Bengal",
  "baharampur": "Baharampur, West Bengal",
  "kharagpur": "Kharagpur, West Bengal",
  "haldia": "Haldia, West Bengal",
  "darjeeling": "Darjeeling, West Bengal",

  // BIHAR & JHARKHAND
  "patna": "Patna, Bihar",
  "gaya": "Gaya, Bihar",
  "bhagalpur": "Bhagalpur, Bihar",
  "muzaffarpur": "Muzaffarpur, Bihar",
  "purnia": "Purnia, Bihar",
  "darbhanga": "Darbhanga, Bihar",
  "bihar-sharif": "Bihar Sharif, Bihar",
  "ranchi": "Ranchi, Jharkhand",
  "dhanbad": "Dhanbad, Jharkhand",
  "jamshedpur": "Jamshedpur, Jharkhand",
  "bokaro": "Bokaro Steel City, Jharkhand",
  "deoghar": "Deoghar, Jharkhand",
  "hazaribagh": "Hazaribagh, Jharkhand",

  // ODISHA
  "bhubaneswar": "Bhubaneswar, Odisha",
  "cuttack": "Cuttack, Odisha",
  "rourkela": "Rourkela, Odisha",
  "berhampur": "Berhampur, Odisha",
  "sambalpur": "Sambalpur, Odisha",
  "puri": "Puri, Odisha",
  "balasore": "Balasore, Odisha",
  "jharsuguda": "Jharsuguda, Odisha",
  "kalinganagar": "Kalinganagar, Odisha",

  // ASSAM & NORTH EAST
  "guwahati": "Guwahati, Assam",
  "silchar": "Silchar, Assam",
  "dibrugarh": "Dibrugarh, Assam",
  "jorhat": "Jorhat, Assam",
  "tezpur": "Tezpur, Assam",
  "agartala": "Agartala, Tripura",
  "shillong": "Shillong, Meghalaya",
  "aizawl": "Aizawl, Mizoram",
  "imphal": "Imphal, Manipur",
  "kohima": "Kohima, Nagaland",
  "dimapur": "Dimapur, Nagaland",
  "itanagar": "Itanagar, Arunachal Pradesh",
  "gangtok": "Gangtok, Sikkim",

  // PUDUCHERRY & UNION TERRITORIES
  "puducherry": "Puducherry",
  "pondicherry": "Pondicherry",
  "port-blair": "Port Blair, Andaman & Nicobar",
  "daman": "Daman",
  "diu": "Diu",
  "silvassa": "Silvassa",
  "leh": "Leh, Ladakh"
};

function getCityLocation(citySlug) {
  if (!citySlug) return 'India';
  const clean = citySlug.toLowerCase().trim();
  if (cityStateMap[clean]) {
    return cityStateMap[clean];
  }
  return citySlug.replace(/-/g, ' ').replace(/\w/g, c => c.toUpperCase());
}

function getCityOnlyName(citySlug) {
  if (!citySlug) return 'India';
  const loc = getCityLocation(citySlug);
  return loc.split(',')[0].trim();
}

function getStateName(citySlug) {
  if (!citySlug) return 'India';
  const loc = getCityLocation(citySlug);
  const parts = loc.split(',');
  return parts.length > 1 ? parts[1].trim() : 'India';
}

function getServiceName(serviceSlug) {
  if (!serviceSlug) return 'Safety Nets';
  const slugClean = serviceSlug.toLowerCase();
  if (slugClean === 'anti-bird-net' || slugClean === 'pigeon-safety-nets' || slugClean === 'bird-pigeon-nets') return 'Anti Bird & Pigeon Nets';
  if (slugClean === 'balcony-safety-nets' || slugClean === 'balcony-nets') return 'Balcony Safety Nets';
  if (slugClean === 'children-pet-safety-nets' || slugClean === 'child-safety-nets' || slugClean === 'pet-safety-nets') return 'Children & Pet Safety Nets';
  if (slugClean === 'construction-safety-nets' || slugClean === 'construction-nets' || slugClean === 'scaffolding-nets') return 'Construction Safety Nets';
  if (slugClean === 'sports-nets-turf' || slugClean === 'sports-nets' || slugClean === 'cricket-nets' || slugClean === 'turf') return 'Sports Nets & Turf';
  if (slugClean === 'hdpe-nets' || slugClean === 'industrial-nets' || slugClean === 'duct-area-nets') return 'Industrial HDPE Nets';
  if (slugClean === 'invisible-grills' || slugClean === 'ss-invisible-grills') return 'Stainless Steel Invisible Grills';
  if (slugClean === 'cloth-hangers' || slugClean === 'ceiling-cloth-hangers') return 'SS Ceiling Cloth Drying Hangers';
  return serviceSlug.replace(/-/g, ' ').replace(/\w/g, c => c.toUpperCase());
}

function generateWhatsAppUrl(serviceSlug, citySlug, pageUrl) {
  const serviceName = getServiceName(serviceSlug);
  const locationName = citySlug ? getCityLocation(citySlug) : "India";
  const isClothHangers = /hanger|cloth|drying|stand/i.test(serviceSlug || "");
  const closingLine = isClothHangers
    ? "Please share pricing per piece / set, model options, technical specifications, and installation availability."
    : "Please share pricing per sq ft, technical specifications, and installation availability.";

  let msg = "";
  if (citySlug) {
    msg = [
      "Hi GCM Safety Nets, I would like to inquire about " + serviceName + " in " + locationName + ".",
      "",
      "* Service: " + serviceName,
      "* Location: " + locationName,
      "* Page: " + pageUrl,
      "* Website: www.gcmsafetynets.com",
      "",
      closingLine
    ].join(String.fromCharCode(10));
  } else if (serviceSlug) {
    msg = [
      "Hi GCM Safety Nets, I would like to inquire about " + serviceName + ".",
      "",
      "* Service: " + serviceName,
      "* Location: India",
      "* Page: " + pageUrl,
      "* Website: www.gcmsafetynets.com",
      "",
      closingLine
    ].join(String.fromCharCode(10));
  } else {
    msg = [
      "Hi GCM Safety Nets, I would like to inquire about Safety Nets installation.",
      "",
      "* Service: Safety Nets & Anti Bird Protection",
      "* Location: India",
      "* Page: " + pageUrl,
      "* Website: www.gcmsafetynets.com",
      "",
      "Please share pricing per sq ft, technical specifications, and installation availability."
    ].join(String.fromCharCode(10));
  }

  return "https://wa.me/919912399224?text=" + encodeURIComponent(msg);
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
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/contact', (req, res) => {
  const contactHtml = loadView('contact.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/contact');
  let rendered = (contactHtml || '<h1>Contact GCM Safety Nets</h1>')
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
  res.send(rendered);
});

app.get('/blog', (req, res) => {
  const blogHtml = loadView('blog.html');
  const customWaUrl = generateWhatsAppUrl(null, null, 'https://www.gcmsafetynets.com/blog');
  let rendered = (blogHtml || '<h1>Safety Nets Blog</h1>')
    .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
    .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
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
      .replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl)
      .replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);
    return res.send(rendered);
  }
  return res.redirect('/');
});

// State directory route (e.g. /state/telangana, /state/maharashtra)
app.get('/state/:state', (req, res) => {
  const stateSlug = req.params.state.toLowerCase();
  const stateName = stateSlug.replace(/-/g, ' ').replace(/\w/g, c => c.toUpperCase());
  const cityTemplate = loadView('city-template.html');
  if (cityTemplate) {
    let rendered = renderCityTemplate(cityTemplate, 'balcony-safety-nets', stateSlug, stateName, stateName);
    return res.send(rendered);
  }
  return res.redirect('/');
});

// Programmatic Dynamic City/Service Routes (e.g. /anti-bird-net/indore, /balcony-safety-nets/mumbai, /sports-nets-turf/jaipur)
function renderCityTemplate(cityTemplate, serviceSlug, citySlug, cityName, stateName) {
  const serviceName = getServiceName(serviceSlug);
  const locationFormatted = stateName && stateName !== cityName && stateName !== 'India' 
    ? cityName + ', ' + stateName 
    : cityName;
  
  let rendered = cityTemplate;

  // Replace Titles & SEO descriptions
  rendered = rendered.replace(/Best Anti Bird Net in Hyderabad \| GCM Safety Nets — 5-Year Warranty/g, 'Best ' + serviceName + ' in ' + locationFormatted + ' | GCM Safety Nets — 5-Year Warranty');
  rendered = rendered.replace(/Expert Anti Bird Net in Hyderabad using 100% genuine Russea™ HDPE nets\./g, 'Expert ' + serviceName + ' in ' + locationFormatted + ' using 100% genuine Russea™ HDPE nets.');
  rendered = rendered.replace(/href="https:\/\/www\.gcmsafetynets\.com\/anti-bird-net\/hyderabad"/g, 'href="https://www.gcmsafetynets.com/' + serviceSlug + '/' + citySlug + '"');

  // Replace OpenGraph & Twitter
  rendered = rendered.replace(/Best Anti Bird Net in Hyderabad \| GCM Safety Nets/g, 'Best ' + serviceName + ' in ' + locationFormatted + ' | GCM Safety Nets');
  rendered = rendered.replace(/https:\/\/www\.gcmsafetynets\.com\/anti-bird-net\/hyderabad/g, 'https://www.gcmsafetynets.com/' + serviceSlug + '/' + citySlug);

  // Replace text tokens
  rendered = rendered.replace(/Hyderabad, Telangana/g, locationFormatted);
  rendered = rendered.replace(/Hyderabad/g, cityName);
  rendered = rendered.replace(/hyderabad/g, citySlug);
  rendered = rendered.replace(/Anti Bird Net/g, serviceName);
  rendered = rendered.replace(/anti-bird-net/g, serviceSlug);
  rendered = rendered.replace(/Garware/g, 'Russea™');
  rendered = rendered.replace(/garware/g, 'russea');

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
    'turf': '/images/services/sports-nets-turf.jpg?v=1790396500',
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

  // Generate accurate custom WhatsApp pre-filled message matching gcm.enterprises pattern
  const pageUrl = 'https://www.gcmsafetynets.com/' + serviceSlug + '/' + citySlug;
  const customWaUrl = generateWhatsAppUrl(serviceSlug, citySlug, pageUrl);

  rendered = rendered.replace(/https:\/\/wa\.me\/919912399224\?text=[^"'\s>]+/g, customWaUrl);
  rendered = rendered.replace(/https:\/\/wa\.me\/919912399224(?=["'\s>])/g, customWaUrl);

  return rendered;
}

app.get('/:service/:city', (req, res) => {
  const serviceSlug = req.params.service;
  const citySlug = req.params.city;

  const cityName = getCityOnlyName(citySlug);
  const stateName = getStateName(citySlug);
  const cityTemplate = loadView('city-template.html');

  if (cityTemplate) {
    const rendered = renderCityTemplate(cityTemplate, serviceSlug, citySlug, cityName, stateName);
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
  console.log('GCM Safety Nets Pan-India server running on port ' + PORT);
});
