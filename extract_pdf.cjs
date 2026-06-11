const fs = require('fs');
const path = require('path');

async function extractPDF() {
  // Dynamic import for ESM module
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const pdfPath = path.join(__dirname, 'LISTA DE PRECIOS JUNIO.pdf');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  
  console.log('Pages:', doc.numPages);
  
  let fullText = '';
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map(item => item.str)
      .join(' ');
    
    fullText += `\n--- PAGE ${i} ---\n${pageText}`;
  }
  
  fs.writeFileSync('pdf_extracted_text.txt', fullText, 'utf-8');
  console.log('Extracted text saved to pdf_extracted_text.txt');
  console.log('Text length:', fullText.length);
  console.log(fullText);
}

extractPDF().catch(err => console.error('Error:', err.message));
