const { execSync } = require('child_process');
const gitPath = 'C:\\\\Users\\\\alanv\\\\AppData\\\\Local\\\\GitHubDesktop\\\\app-3.6.3\\\\resources\\\\app\\\\git\\\\cmd\\\\git.exe';
const scriptPath = 'C:/Users/alanv/.gemini/antigravity-ide/scratch/nexqr/frontend/env-filter.sh';

try {
  console.log('Running git filter-branch...');
  execSync(`"${gitPath}" filter-branch --force --env-filter ". ${scriptPath}" --tag-name-filter cat -- --branches --tags`, { stdio: 'inherit' });
  console.log('Done rewriting history. Now pushing...');
  execSync(`"${gitPath}" push origin --force --all`, { stdio: 'inherit' });
  execSync(`"${gitPath}" push origin --force --tags`, { stdio: 'inherit' });
  console.log('Force push completed!');
} catch (e) {
  console.error('Error:', e.message);
}
