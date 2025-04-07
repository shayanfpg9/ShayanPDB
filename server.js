const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const config = JSON.parse(fs.readFileSync("keys.json", "utf8"));
const publicKeyPath = config.publicKeyPath;
const outputFolder = config.outputFolder;

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

app.post("/submit", (req, res) => {
    try {
        const username = req.body.username?.trim();
        if (!username) return res.status(400).send("❌ نام کاربری الزامی است");

        const hash = crypto.createHash("md5").update(username).digest("hex");

        const data = Object.entries(req.body)
            .filter(([key]) => key !== "username")
            .map(([key, value]) => ({
                name: key,
                type: "text",
                value
            }));

        const aesKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);

        let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
        encrypted += cipher.final("base64");

        const publicKey = fs.readFileSync(publicKeyPath, "utf8");
        const encryptedKey = crypto.publicEncrypt(publicKey, aesKey).toString("base64");

        const result = {
            encryptedKey,
            data: encrypted,
            iv: iv.toString("base64")
        };

        const filePath = path.join(outputFolder, `${hash}.json`);
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

        res.send("✅ داده با موفقیت ذخیره شد");

    } catch (err) {
        console.error("❌ خطا:", err.message);
        res.status(500).send("❌ خطا در پردازش درخواست");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "encrypt.html"));
})

app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
});
