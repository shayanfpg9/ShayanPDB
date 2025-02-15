const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

if (!fs.existsSync("database")) { fs.mkdirSync("database") }

const app = express();
app.use(bodyParser.json());

const publicKeyPath = './publicKey.pem';
let publicKey;

if (fs.existsSync(publicKeyPath)) {
    publicKey = fs.readFileSync(publicKeyPath, 'utf8').trim();
} else {
    console.error('فایل کلید عمومی یافت نشد!');
    process.exit(1);
}

app.post('/submit', (req, res) => {
    const data = req.body;

    const fileName = crypto.createHash('md5').update(data.nickname).digest('hex');
    const jsonData = (JSON.stringify(data));

    const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(jsonData)).toString("base64");

    fs.writeFileSync(path.join(__dirname, "database", `${fileName}.txt`), encryptedData);

    res.json({ success: true, ...req.query });
});

// app.post('/decrypt', (req, res) => {
//     const { fileName, privateKey: userPrivateKey } = req.body;

//     try {
//         const encryptedData = fs.readFileSync(path.join(__dirname, "database", `${fileName}.txt`), 'utf8');
//         const decryptedData = crypto.privateDecrypt(userPrivateKey, Buffer.from(encryptedData, "base64")).toString()

//         res.json({ success: true, decryptedData: JSON.parse(decryptedData) });
//     } catch (error) {
//         console.error('خطا در رمزگشایی:', error);
//         res.json({ success: false });
//     }
// });

app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "encrypt.html"));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});