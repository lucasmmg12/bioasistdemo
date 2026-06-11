const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// =====================================================
// PRODUCT DATA - JUNIO 2026 (extracted from LISTA DE PRECIOS JUNIO.pdf)
// Columna DISTRIBUIDOR eliminada por solicitud
// =====================================================

const vyperProducts = [
  { name: 'WHEY BLEND PROTEIN BLACK XTREME DOYPACK 2lb - (Chocolate-Vainilla-Frutilla)', ml3c: '$71.500,00', mlf: '$66.000,00', ec3c: '$66.000,00', ecf: '$61.600,00', may: '$51.359,00' },
  { name: 'FIX BCAA 300g - (Frutos rojos-Limon-Uva-mango)', ml3c: '$32.890,00', mlf: '$28.600,00', ec3c: '$23.140,00', ecf: '$19.700,00', may: '$16.860,00' },
  { name: 'NITROXPLOD 450g - (Arandanos-Limon-Uva)', ml3c: '$40.360,00', mlf: '$35.100,00', ec3c: '$28.410,00', ecf: '$24.100,00', may: '$20.800,00' },
  { name: 'NITRORIPPED - Pre Entreno + Quemador 300g - (Arandanos-Limon-Uva)', ml3c: '$34.040,00', mlf: '$29.600,00', ec3c: '$24.000,00', ecf: '$20.400,00', may: '$17.480,00' },
  { name: 'CREASTACK - Creatina + HMB + Ácido Alfalipoico 300g - FRUTOS ROJOS', ml3c: '$28.900,00', mlf: '$25.200,00', ec3c: '$25.200,00', ecf: '$21.900,00', may: '$16.790,00' },
  { name: 'TESTOFULL ULTRA 300g - (Multifruta-Uva-Naranja-Pomelo)', ml3c: '$22.320,00', mlf: '$19.400,00', ec3c: '$20.360,00', ecf: '$17.300,00', may: '$14.840,00' },
  { name: 'ALL AMINO 9 - Aminos Esenciales 350g - (Uva-Lima-Frutos Rojos)', ml3c: '$39.780,00', mlf: '$34.600,00', ec3c: '$28.100,00', ecf: '$23.900,00', may: '$20.480,00' },
  { name: 'ZMA - Zinc, Magnesio, Vitamina B6 - CAPSULAS', ml3c: '$20.480,00', mlf: '$17.800,00', ec3c: '$14.520,00', ecf: '$12.300,00', may: '$10.580,00' },
  { name: 'HMB (β-Hidroxi β-Metilbutarato) - CAPSULAS', ml3c: '$28.980,00', mlf: '$25.200,00', ec3c: '$20.400,00', ecf: '$17.300,00', may: '$14.860,00' },
  { name: 'CAFFEINE PURE - Quemador - CAPSULAS', ml3c: '$17.940,00', mlf: '$15.600,00', ec3c: '$12.600,00', ecf: '$10.700,00', may: '$9.200,00' },
  { name: 'MULTISPORT - Multivitamínico - CAPSULAS', ml3c: '$17.820,00', mlf: '$15.400,00', ec3c: '$12.310,00', ecf: '$10.500,00', may: '$8.980,00' },
  { name: 'GLUTAMINE 100% Pura 300g', ml3c: '$29.440,00', mlf: '$25.600,00', ec3c: '$20.680,00', ecf: '$17.600,00', may: '$15.060,00' },
  { name: 'L-ARGININE 100% Pura 180g', ml3c: '$23.240,00', mlf: '$20.200,00', ec3c: '$16.350,00', ecf: '$13.900,00', may: '$11.920,00' },
  { name: 'L-LEUCINE 100% Pura 250g', ml3c: '$24.380,00', mlf: '$21.200,00', ec3c: '$17.140,00', ecf: '$14.600,00', may: '$12.490,00' },
  { name: 'BETA ALANINE 100% Pura 300g', ml3c: '$23.240,00', mlf: '$20.200,00', ec3c: '$16.350,00', ecf: '$13.900,00', may: '$11.920,00' },
  { name: 'CREATINE 300 100% Pura 300g', ml3c: '$25.760,00', mlf: '$22.400,00', ec3c: '$22.400,00', ecf: '$19.000,00', may: '$13.800,00' },
  { name: 'CREATINE 1KG 100% Pura', ml3c: '$78.430,00', mlf: '$68.200,00', ec3c: '$59.150,00', ecf: '$50.300,00', may: '$45.540,00' },
  { name: 'TONE UP - Quemador - CAPSULAS', ml3c: '$21.620,00', mlf: '$18.800,00', ec3c: '$15.220,00', ecf: '$12.900,00', may: '$11.080,00' },
  { name: 'CLA+ CARNITINA - En polvo 150g - (Limon-Pomelo)', ml3c: '$26.920,00', mlf: '$23.400,00', ec3c: '$19.040,00', ecf: '$16.200,00', may: '$13.880,00' },
  { name: 'HIDROFLEX - Colágeno 240g - (Anana-Multifruta-Pomelo-Cereza)', ml3c: '$31.740,00', mlf: '$27.600,00', ec3c: '$22.320,00', ecf: '$19.000,00', may: '$16.260,00' },
  { name: 'CREAPURE 100% Pura 300g', ml3c: '$62.340,00', mlf: '$54.200,00', ec3c: '$57.350,00', ecf: '$48.700,00', may: '$39.640,00' },
  { name: 'CITRATO DE MAGNESIO (120 CAPSULAS) - VYPER SUPLEMENTOS - BLACK LINE', ml3c: '$21.160,00', mlf: '$18.400,00', ec3c: '$17.240,00', ecf: '$14.600,00', may: '$12.560,00' },
  { name: 'OMEGA 3 (60 CAPSULAS)', ml3c: '$43.700,00', mlf: '$38.000,00', ec3c: '$40.170,00', ecf: '$34.100,00', may: '$32.200,00' },
];

const oneFitProducts = [
  { name: 'CLASSIC WHEY PROTEIN DOYPACK 2lbs. - (Chocolate-Frutilla-Vainilla)', ml3c: '$51.150,00', mlf: '$44.440,00', ec3c: '$44.440,00', ecf: '$39.600,00', may: '$30.228,00' },
  { name: 'PUSH BCAA 300g - (Cereza-Limon)', ml3c: '$28.865,00', mlf: '$25.100,00', ec3c: '$19.570,00', ecf: '$16.600,00', may: '$14.260,00' },
  { name: 'CREATINE MICRONIZED 200g', ml3c: '$18.285,00', mlf: '$15.900,00', ec3c: '$15.900,00', ecf: '$13.500,00', may: '$9.200,00' },
  { name: 'CREATINE MICRONIZED 500g', ml3c: '$35.420,00', mlf: '$30.800,00', ec3c: '$30.800,00', ecf: '$26.200,00', may: '$21.850,00' },
  { name: 'OPTIMUS COLLAGE - COLAGENO 240g (Frutilla-Naranja)', ml3c: '$19.550,00', mlf: '$17.000,00', ec3c: '$15.500,00', ecf: '$13.100,00', may: '$11.280,00' },
  { name: 'EAA+ ESSENTIAL AMINO ACID 300g - (Pomelo-Naranja-Cereza-Uva)', ml3c: '$32.890,00', mlf: '$28.600,00', ec3c: '$22.410,00', ecf: '$19.000,00', may: '$16.340,00' },
  { name: 'GLUTAMINE MICRONIZED 200g', ml3c: '$20.010,00', mlf: '$17.400,00', ec3c: '$13.560,00', ecf: '$11.500,00', may: '$9.880,00' },
  { name: 'FRICTION 3.2 300g - (Limon-Uva)', ml3c: '$29.670,00', mlf: '$25.800,00', ec3c: '$20.270,00', ecf: '$17.200,00', may: '$14.760,00' },
  { name: 'OXIDO NITRICO 210g - LIMON', ml3c: '$27.485,00', mlf: '$23.900,00', ec3c: '$18.750,00', ecf: '$15.900,00', may: '$13.660,00' },
  { name: 'THE BEST GAINER 1,5 KG - (Chocolate-Frutilla-Vainilla)', ml3c: '$47.035,00', mlf: '$40.900,00', ec3c: '$37.600,00', ecf: '$32.760,00', may: '$25.200,00' },
  { name: 'FAT DESTROYER 2.0 - 90 CAPSULAS', ml3c: '$20.240,00', mlf: '$17.600,00', ec3c: '$13.700,00', ecf: '$11.600,00', may: '$9.980,00' },
  { name: 'CITRATO DE MAGNESIO 150g', ml3c: '$11.385,00', mlf: '$9.900,00', ec3c: '$7.670,00', ecf: '$6.500,00', may: '$5.590,00' },
  { name: 'CITRATO DE POTASIO 150g', ml3c: '$11.385,00', mlf: '$9.900,00', ec3c: '$7.670,00', ecf: '$6.500,00', may: '$5.590,00' },
  { name: 'VITAMINA C 150g - (Naranja)', ml3c: '$14.260,00', mlf: '$12.400,00', ec3c: '$9.540,00', ecf: '$8.100,00', may: '$6.940,00' },
  { name: 'CITRATO DE MAGNESIO 450g', ml3c: '$30.130,00', mlf: '$26.200,00', ec3c: '$20.650,00', ecf: '$17.500,00', may: '$15.040,00' },
  { name: 'OMEGA 3 30 CAPSULAS - VYPER SUPLEMENTOS', ml3c: '$28.750,00', mlf: '$25.000,00', ec3c: '$22.220,00', ecf: '$19.900,00', may: '$16.190,00' },
  { name: 'RESVERATROL CAPSULAS - VYPER SUPLEMENTOS - RED LINE', ml3c: '$28.750,00', mlf: '$25.000,00', ec3c: '$25.320,00', ecf: '$21.500,00', may: '$18.440,00' },
  { name: 'MULTI VITAMINS 60 cápsulas', ml3c: '$17.020,00', mlf: '$14.800,00', ec3c: '$14.800,00', ecf: '$13.500,00', may: '$9.800,00' },
  { name: 'D3 + K2 VITAMINS 60 cápsulas', ml3c: '$17.020,00', mlf: '$14.800,00', ec3c: '$14.800,00', ecf: '$13.500,00', may: '$9.800,00' },
];

// =====================================================
// HTML TEMPLATE
// =====================================================

function generateProductRows(products) {
  return products.map((p, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="product-name">${p.name}</td>
      <td class="price">${p.ml3c}</td>
      <td class="price">${p.mlf}</td>
      <td class="price">${p.ec3c}</td>
      <td class="price">${p.ecf}</td>
      <td class="price">${p.may}</td>
    </tr>
  `).join('');
}

function generateTable(title, products) {
  return `
    <div class="table-section">
      <div class="table-header-bar">
        <img src="data:image/jpeg;base64,LOGO_PLACEHOLDER" class="table-logo" alt="Vyper">
        <h2>${title}</h2>
        <img src="data:image/jpeg;base64,LOGO_PLACEHOLDER" class="table-logo" alt="Vyper">
      </div>
      <table>
        <thead>
          <tr class="header-group">
            <th rowspan="2" class="th-product">PRODUCTO</th>
            <th colspan="2" class="th-group">MERCADO LIBRE</th>
            <th colspan="2" class="th-group">ECOMMERCE / LOCAL</th>
            <th rowspan="2" class="th-mayorista">MAYORISTA</th>
          </tr>
          <tr class="header-sub">
            <th class="th-sub">CONSUMIDOR<br>FINAL 3 CUOTAS<br>S/I</th>
            <th class="th-sub">CONSUMIDOR<br>FINAL</th>
            <th class="th-sub">CONSUMIDOR<br>FINAL 3 CUOTAS<br>S/I</th>
            <th class="th-sub">CONSUMIDOR<br>FINAL</th>
          </tr>
        </thead>
        <tbody>
          ${generateProductRows(products)}
        </tbody>
      </table>
    </div>
  `;
}

function generateHTML(logoBase64) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lista de Precios - Vyper Suplementos - Junio 2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      color: #1a1a1a;
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* ======================== */
    /* COVER / HERO SECTION     */
    /* ======================== */
    .cover {
      background: linear-gradient(160deg, #0d0d0d 0%, #1a1a1a 40%, #2a2a2a 100%);
      color: #fff;
      padding: 32px 40px 28px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
      page-break-after: avoid;
    }

    .cover::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%);
      pointer-events: none;
    }

    .cover-title {
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 8px;
      position: relative;
    }

    .cover-title::after {
      content: '';
      display: block;
      width: 80px;
      height: 3px;
      background: #fff;
      margin: 12px auto 0;
    }

    .cover-subtitle {
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 3px;
      color: rgba(255,255,255,0.6);
      margin-top: 8px;
    }

    .cover-logo {
      width: 130px;
      height: auto;
      margin: 18px auto 6px;
      display: block;
      filter: invert(1) brightness(2);
    }

    .cover-brand {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 8px;
      margin-top: 6px;
      text-transform: uppercase;
    }

    .cover-tagline {
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 4px;
      color: rgba(255,255,255,0.5);
      margin-top: 4px;
    }

    .cover-date {
      font-size: 10px;
      font-weight: 300;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.4);
      margin-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 10px;
      display: inline-block;
    }

    /* ======================== */
    /* TABLE SECTION            */
    /* ======================== */
    .table-section {
      margin-top: 0;
    }

    .table-header-bar {
      background: linear-gradient(90deg, #111 0%, #222 50%, #111 100%);
      color: #fff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .table-header-bar h2 {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      text-align: center;
      flex: 1;
    }

    .table-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      filter: invert(1) brightness(2);
    }

    /* ======================== */
    /* TABLE                    */
    /* ======================== */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      table-layout: fixed;
    }

    .th-product {
      width: 28%;
      background: #1a1a1a;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 700;
      font-size: 8.5px;
      letter-spacing: 0.5px;
      border: 1px solid #333;
      vertical-align: middle;
    }

    .th-group {
      background: #2a2a2a;
      color: #fff;
      padding: 6px 4px;
      text-align: center;
      font-weight: 700;
      font-size: 8px;
      letter-spacing: 0.5px;
      border: 1px solid #444;
    }

    .th-sub {
      background: #3a3a3a;
      color: #e0e0e0;
      padding: 5px 4px;
      text-align: center;
      font-weight: 600;
      font-size: 7px;
      letter-spacing: 0.3px;
      border: 1px solid #444;
      line-height: 1.3;
    }

    .th-mayorista {
      background: #1a1a1a;
      color: #fff;
      padding: 8px 4px;
      text-align: center;
      font-weight: 700;
      font-size: 8px;
      letter-spacing: 0.5px;
      border: 1px solid #333;
      vertical-align: middle;
    }

    .row-even {
      background: #f8f8f8;
    }

    .row-odd {
      background: #fff;
    }

    tr:hover {
      background: #f0f0f0;
    }

    .product-name {
      padding: 6px 8px;
      font-size: 8px;
      font-weight: 500;
      color: #1a1a1a;
      border: 1px solid #e0e0e0;
      line-height: 1.3;
      text-align: left;
    }

    .price {
      padding: 6px 4px;
      font-size: 8.5px;
      font-weight: 600;
      color: #222;
      text-align: center;
      border: 1px solid #e0e0e0;
      font-variant-numeric: tabular-nums;
    }

    /* ======================== */
    /* PAGE BREAKS              */
    /* ======================== */
    .page-break {
      page-break-before: always;
    }

    /* ======================== */
    /* FOOTER                   */
    /* ======================== */
    .footer {
      background: #111;
      color: rgba(255,255,255,0.4);
      padding: 10px 24px;
      text-align: center;
      font-size: 7px;
      letter-spacing: 1px;
    }

    /* ======================== */
    /* SECOND TABLE SPACING     */
    /* ======================== */
    .table-spacer {
      height: 20px;
      background: #fff;
    }

    @media print {
      body { -webkit-print-color-adjust: exact !important; }
      .cover { page-break-after: avoid; }
    }
  </style>
</head>
<body>

  <!-- COVER SECTION -->
  <div class="cover">
    <div class="cover-title">LISTA DE PRECIOS</div>
    <div class="cover-subtitle">JUNIO 2026</div>
    <img src="data:image/jpeg;base64,${logoBase64}" class="cover-logo" alt="Vyper Suplementos">
    <div class="cover-brand">VYPER SUPLEMENTOS</div>
    <div class="cover-tagline">SUPLEMENTACIÓN DEPORTIVA</div>
    <div class="cover-date">PRECIOS VIGENTES — JUNIO 2026</div>
  </div>

  <!-- TABLE 1: Vyper Suplementos Línea Black -->
  ${generateTable('LISTA DE PRECIOS VYPER SUPLEMENTOS — LÍNEA BLACK', vyperProducts).replace(/LOGO_PLACEHOLDER/g, logoBase64)}

  <div class="footer">VYPER SUPLEMENTOS — Todos los precios incluyen IVA — Precios sujetos a cambios sin previo aviso</div>

  <!-- PAGE BREAK BEFORE SECOND TABLE -->
  <div style="page-break-before: always;"></div>

  <!-- TABLE 2: Vyper Suplementos Línea One Fit -->
  ${generateTable('LISTA DE PRECIOS VYPER SUPLEMENTOS — LÍNEA ONE FIT', oneFitProducts).replace(/LOGO_PLACEHOLDER/g, logoBase64)}

  <div class="footer">VYPER SUPLEMENTOS — Todos los precios incluyen IVA — Precios sujetos a cambios sin previo aviso</div>

</body>
</html>`;

  return html;
}

// =====================================================
// PDF GENERATION
// =====================================================

async function main() {
  console.log('🔧 Generando PDF de Vyper Suplementos - JUNIO 2026...');
  console.log('');

  // Read the Vyper logo
  const logoPath = path.join(__dirname, 'WhatsApp Image 2026-06-04 at 10.53.39 AM.jpeg');
  if (!fs.existsSync(logoPath)) {
    console.error('❌ No se encontró la imagen del logo:', logoPath);
    process.exit(1);
  }
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  console.log('✅ Logo Vyper cargado');

  // Generate HTML
  const html = generateHTML(logoBase64);
  
  // Save HTML for debugging
  const htmlPath = path.join(__dirname, 'preview_lista.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('✅ HTML template generado:', htmlPath);

  // Find Edge or Chrome browser
  const browserPaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  let browserPath = null;
  for (const bp of browserPaths) {
    if (fs.existsSync(bp)) {
      browserPath = bp;
      break;
    }
  }

  if (!browserPath) {
    console.error('❌ No se encontró Edge ni Chrome. Buscando...');
    // Try to find via powershell
    const { execSync } = require('child_process');
    try {
      const result = execSync('powershell -Command "(Get-ItemProperty \'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe\').\\\"(default)\\\"" 2>$null', { encoding: 'utf-8' }).trim();
      if (result && fs.existsSync(result)) {
        browserPath = result;
      }
    } catch(e) {}
    
    if (!browserPath) {
      try {
        const result = execSync('where msedge 2>nul || where chrome 2>nul', { encoding: 'utf-8' }).trim().split('\n')[0];
        if (result && fs.existsSync(result.trim())) {
          browserPath = result.trim();
        }
      } catch(e) {}
    }
  }

  if (!browserPath) {
    console.error('❌ No se pudo encontrar ningún navegador Chromium.');
    console.log('   Guardando solo el HTML. Ábrelo en el navegador e imprime como PDF.');
    return;
  }

  console.log('✅ Navegador encontrado:', browserPath);

  // Launch browser and generate PDF
  console.log('🚀 Lanzando navegador headless...');
  
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set content with timeout for font loading
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait a bit for fonts to load
    await new Promise(r => setTimeout(r, 2000));

    // Generate PDF
    const outputPath = path.join(__dirname, 'LISTA VYPER SUPLEMENTOS. ONE FIT JUNIO.pdf');
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      preferCSSPageSize: false,
    });

    console.log('');
    console.log('✅ ¡PDF generado exitosamente!');
    console.log('📄 Archivo:', outputPath);
    console.log('📏 Tamaño:', (fs.statSync(outputPath).size / 1024).toFixed(1), 'KB');

  } finally {
    await browser.close();
    console.log('🔒 Navegador cerrado');
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
