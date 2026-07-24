const fs = require('fs');
let content = fs.readFileSync('src/components/generator/QRGenerator.tsx', 'utf8');

// Replace all standard inputs with the new properties
content = content.replace(/<input(?![^>]*type="(?:color|file|datetime-local)")[^>]*>/g, (match) => {
  // If it already has autoComplete="off", we replace it. Otherwise we just append to the end before /> or >.
  let newMatch = match;
  
  // Clean up existing autoComplete and spellCheck to prevent duplicates
  newMatch = newMatch.replace(/\sautoComplete="[^"]*"/g, '');
  newMatch = newMatch.replace(/\sspellCheck="[^"]*"/g, '');
  newMatch = newMatch.replace(/\sdata-form-type="[^"]*"/g, '');
  newMatch = newMatch.replace(/\sonKeyDown=\{[^}]*\}/g, '');

  const restrictTyping = `onKeyDown={(e) => { if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault(); }}`;
  
  // Make inputs look premium in dark mode by changing background class from bg-background/50 to bg-black/5 dark:bg-black/20 or something similar
  newMatch = newMatch.replace(/bg-background\/50/g, 'bg-muted/30 dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 backdrop-blur-sm');

  // Insert the new attributes before the closing bracket
  if (newMatch.endsWith('/>')) {
    return newMatch.slice(0, -2) + ` autoComplete="new-password" data-form-type="other" spellCheck="false" ${restrictTyping} />`;
  } else {
    return newMatch.slice(0, -1) + ` autoComplete="new-password" data-form-type="other" spellCheck="false" ${restrictTyping} >`;
  }
});

// Also replace Textareas
content = content.replace(/<textarea[^>]*>/g, (match) => {
  let newMatch = match;
  newMatch = newMatch.replace(/\sautoComplete="[^"]*"/g, '');
  newMatch = newMatch.replace(/\sspellCheck="[^"]*"/g, '');
  newMatch = newMatch.replace(/\sdata-form-type="[^"]*"/g, '');
  newMatch = newMatch.replace(/\sonKeyDown=\{[^}]*\}/g, '');
  newMatch = newMatch.replace(/bg-background\/50/g, 'bg-muted/30 dark:bg-black/20 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 backdrop-blur-sm');

  const restrictTyping = `onKeyDown={(e) => { if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault(); }}`;

  if (newMatch.endsWith('/>')) {
    return newMatch.slice(0, -2) + ` autoComplete="new-password" data-form-type="other" spellCheck="false" ${restrictTyping} />`;
  } else {
    return newMatch.slice(0, -1) + ` autoComplete="new-password" data-form-type="other" spellCheck="false" ${restrictTyping} >`;
  }
});

fs.writeFileSync('src/components/generator/QRGenerator.tsx', content);
console.log('Done replacing attributes.');
