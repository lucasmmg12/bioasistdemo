const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

async function extractPDF(filepath) {
  const data = new Uint8Array(fs.readFileSync(filepath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += `\n--- PAGE ${i} ---\n` + strings.join(' ');
  }
  return fullText;
}

async function run() {
  const files = [
    'R GC 05-1 Acciones Correctivas.pdf',
    'R GC 06-0 Oportunidad de Mejora.pdf',
    'R GC 07-0 Seguimiento de AC y OM.pdf',
    'R GC 08-1 Gestión de reclamos de clientes^.pdf',
  ];

  for (const f of files) {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('FILE: ' + f);
      console.log('='.repeat(60));
      const text = await extractPDF(f);
      console.log(text);
    } catch (e) {
      console.log('ERROR: ' + e.message);
    }
  }
}

run();
