call npm run build
cd dist
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe init
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe add .
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe commit -m "Deploy to GitHub Pages"
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe push -f https://github.com/alan-varghese-git/nex-qr.git HEAD:gh-pages
cd ..
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe add vite.config.ts
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe commit -m "Fix vite config base path for GitHub Pages"
C:\Users\alanv\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe push origin main
