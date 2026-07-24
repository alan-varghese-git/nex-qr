const { execSync } = require('child_process');
const gitPath = 'C:\\\\Users\\\\alanv\\\\AppData\\\\Local\\\\GitHubDesktop\\\\app-3.6.3\\\\resources\\\\app\\\\git\\\\cmd\\\\git.exe';

const filterScript = `
if test "$GIT_AUTHOR_NAME" = "Alan-varghese" || test "$GIT_AUTHOR_NAME" = "ALAN VARGHESE" || test "$GIT_AUTHOR_NAME" = "Alan-Varghese"; then
    export GIT_AUTHOR_NAME="Alan Varghese"
    export GIT_AUTHOR_EMAIL="99276146+alan-varghese-git@users.noreply.github.com"
    export GIT_COMMITTER_NAME="Alan Varghese"
    export GIT_COMMITTER_EMAIL="99276146+alan-varghese-git@users.noreply.github.com"
fi
if test "$GIT_COMMITTER_NAME" = "Alan-varghese" || test "$GIT_COMMITTER_NAME" = "ALAN VARGHESE" || test "$GIT_COMMITTER_NAME" = "Alan-Varghese"; then
    export GIT_AUTHOR_NAME="Alan Varghese"
    export GIT_AUTHOR_EMAIL="99276146+alan-varghese-git@users.noreply.github.com"
    export GIT_COMMITTER_NAME="Alan Varghese"
    export GIT_COMMITTER_EMAIL="99276146+alan-varghese-git@users.noreply.github.com"
fi
`;

try {
  console.log('Running git filter-branch...');
  execSync(`"${gitPath}" filter-branch --force --env-filter "${filterScript.replace(/\n/g, ' ')}" --tag-name-filter cat -- --branches --tags`, { stdio: 'inherit' });
  console.log('Done rewriting history. Now pushing...');
  execSync(`"${gitPath}" push origin --force --all`, { stdio: 'inherit' });
  execSync(`"${gitPath}" push origin --force --tags`, { stdio: 'inherit' });
  console.log('Force push completed!');
} catch (e) {
  console.error('Error:', e.message);
}
