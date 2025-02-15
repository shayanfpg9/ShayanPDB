function decryptFile() {
    const fileName = CryptoJS.MD5(
        document.getElementById("fileName").value.trim()
    ).toString();

    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;
    const directoryPath = baseUrl + currentPath.substring(0, currentPath.lastIndexOf('/')) + "/";

    fetch(directoryPath + `database/${fileName}.txt`)
        .then((response) => response.text())
        .then(async (encryptedData) => {
            console.log(window.privateKey, encryptedData);

            const privateKey = forge.pki.privateKeyFromPem(window.privateKey);
            const encrypted = forge.util.decode64(encryptedData);
            const decrypted = decodeURIComponent(escape(privateKey.decrypt(encrypted, 'RSA-OAEP')));



            if (decrypted) {
                document.getElementById("output").textContent = decrypted.replaceAll(",", ",\n\t").replaceAll("{", "{\n\t").replaceAll("}", "\n}");
            } else {
                document.getElementById("output").textContent =
                    "رمزگشایی ناموفق بود!";
            }
        })
        .catch((error) => {
            console.error("خطا در خواندن فایل:", error);
            document.getElementById("output").textContent = "فایل یافت نشد!";
        });
}