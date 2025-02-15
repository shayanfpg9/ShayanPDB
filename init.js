const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
});

const fs = require("fs");
fs.writeFileSync("publicKey.pem", publicKey);
fs.writeFileSync("privateKey.pem", privateKey);