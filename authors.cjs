const { execSync } = require('child_process');
try {
  const gitPath = 'C:\\\\Users\\\\alanv\\\\AppData\\\\Local\\\\GitHubDesktop\\\\app-3.6.3\\\\resources\\\\app\\\\git\\\\cmd\\\\git.exe';
  const stdout = execSync(`"${gitPath}" log --all --format="%an | %ae"`).toString();
  const authors = [...new Set(stdout.split('\n').filter(Boolean))];
  console.log(authors.join('\n'));
} catch (e) {
  console.error(e.message);
}
