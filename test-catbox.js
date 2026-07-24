import fs from 'fs';

async function testCatbox() {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  
  // Create a dummy text file to upload
  fs.writeFileSync('dummy.txt', 'Hello Catbox!');
  const fileBlob = new Blob([fs.readFileSync('dummy.txt')]);
  form.append('fileToUpload', fileBlob, 'dummy.txt');

  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });
    const url = await response.text();
    console.log('Upload successful! URL:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

testCatbox();
