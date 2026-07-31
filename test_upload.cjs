const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch'); // we can just use native fetch in node 18+

fs.writeFileSync('dummy.txt', 'hello world');

const formData = new FormData();
formData.append('file', fs.createReadStream('dummy.txt'));

fetch('https://corsproxy.io/?https://pixeldrain.com/api/file', {
  method: 'POST',
  body: formData,
  headers: {
    'Origin': 'https://nex-qr.vercel.app'
  }
}).then(res => {
  console.log("Status:", res.status);
  console.log("Headers:");
  for (let [key, value] of res.headers) {
    console.log(key, ":", value);
  }
  return res.text();
}).then(text => console.log(text)).catch(err => console.error(err));
