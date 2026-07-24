const fs = require('fs');
let content = fs.readFileSync('src/components/generator/QRGenerator.tsx', 'utf8');

// Add import if not present
if (!content.includes('CodeFileUpload')) {
  content = content.replace("import { AdvancedQRCode } from 'react-qrcode-generate';", "import { AdvancedQRCode } from 'react-qrcode-generate';\nimport CodeFileUpload from './CodeFileUpload';");
}

// Replace the code tab content
const codeTabRegex = /{activeTab === 'code' && \(\s*<div className="space-y-4">\s*<textarea[^>]*>[\s\S]*?<\/div>\s*\)}/m;

const newCodeTab = `{activeTab === 'code' && (
              <CodeFileUpload 
                currentCode={qrValue} 
                onCodeExtracted={setQrValue} 
              />
            )}`;

content = content.replace(codeTabRegex, newCodeTab);

fs.writeFileSync('src/components/generator/QRGenerator.tsx', content);
console.log('Integrated CodeFileUpload');
