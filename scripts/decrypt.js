// async function decryptFile() {
//     try {
//         debugger
//         const fileName = document.getElementById("fileName").value
//         const privateKeyPem = window.privateKey

//         if (!fileName || !privateKeyPem) throw new Error("نام فایل و کلید خصوصی الزامی است");

//         const fileHash = CryptoJS.MD5(fileName.trim()).toString();
//         const baseUrl = window.location.origin;
//         const currentPath = window.location.pathname;
//         const directoryPath = baseUrl + currentPath.substring(0, currentPath.lastIndexOf('/')) + "/";

//         const keyResponse = await fetch(directoryPath + "/aes_keys.json");
//         if (!keyResponse.ok) throw new Error("فایل کلید یافت نشد");

//         const { key: encryptedKey, iv: encryptedIV } = await keyResponse.json();

//         const dataResponse = await fetch(directoryPath + `database/${fileHash}.txt`);
//         if (!dataResponse.ok) throw new Error("فایل داده یافت نشد");

//         const encryptedData = await dataResponse.text();
//         const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
//         const aesKey = privateKey.decrypt(forge.util.decode64(encryptedKey), "RSA-OAEP");
//         const iv = privateKey.decrypt(forge.util.decode64(encryptedIV), "RSA-OAEP");

//         const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(aesKey), {
//             iv: CryptoJS.enc.Utf8.parse(iv),
//             mode: CryptoJS.mode.CBC,
//             padding: CryptoJS.pad.Pkcs7
//         });

//         const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

//         if (decryptedData) {
//             document.getElementById("output").textContent = JSON.stringify(JSON.parse(decryptedData), null, 2);
//             return { success: true, data: JSON.parse(decryptedData) };
//         } else {
//             document.getElementById("output").textContent = "رمزگشایی ناموفق بود";
//             return { success: false, error: "رمزگشایی ناموفق بود" };
//         }
//     } catch {
//         document.getElementById("output").textContent = "خطا رخ داد";
//         return { success: false, error: "خطا رخ داد" };
//     }
// }


async function decrypt() {
    const username = document.getElementById("username").value.trim();
    const hash = CryptoJS.MD5(username).toString();
    const keyInput = document.getElementById("privateKeyFile");
    const output = document.getElementById("output");
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const directoryPath = baseUrl + currentPath.substring(0, currentPath.lastIndexOf('/')) + "/";


    const url = `${directoryPath}/data/${hash}.json`;

    if (!username || !keyInput.files[0]) {
        output.innerText = "❌ لطفاً نام کاربری و کلید خصوصی را وارد کنید";
        return;
    }

    try {
        const privateKeyPem = await keyInput.files[0].text();

        // بارگذاری کلید خصوصی با forge
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

        // دریافت فایل رمزنگاری‌شده
        const res = await fetch(url);
        if (!res.ok) {
            output.innerText = "❌ فایل مربوط به این کاربر پیدا نشد";
            return;
        }

        const encryptedContent = await res.json();

        // رمزگشایی AES Key با RSA
        const encryptedKeyBytes = forge.util.decode64(
            encryptedContent.encryptedKey
        );
        const aesKeyBytes = privateKey.decrypt(encryptedKeyBytes, "RSA-OAEP");

        // آماده‌سازی IV و داده رمزنگاری‌شده
        const iv = forge.util.decode64(encryptedContent.iv);
        const encryptedData = forge.util.decode64(encryptedContent.data);

        // رمزگشایی با AES-CBC
        const decipher = forge.cipher.createDecipher("AES-CBC", aesKeyBytes);
        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(encryptedData));
        const success = decipher.finish();

        if (success) {
            output.innerText = JSON.stringify(JSON.parse(decipher.output.toString()), null, 2);
        } else {
            output.innerText = "❌ رمزگشایی AES ناموفق بود";
        }
    } catch (err) {
        console.error(err);
        output.innerText = "❌ خطا در رمزگشایی: " + err.message;
    }
}