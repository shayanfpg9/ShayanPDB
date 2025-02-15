document.querySelectorAll("form").forEach((el) => {
    el.onsubmit = (e) => e.preventDefault();
});

window.privateKey = "";

(() => {
    if (!localStorage.getItem("privateKey")) {
        document.getElementById("privkey").classList.remove("hide");
    } else {
        const [ex, p] = atob(localStorage.getItem("privateKey")).split("==");
        if (ex >= Date.now()) {
            privateKey = atob(p);
            document.getElementById("form").classList.remove("hide");
        } else {
            localStorage.removeItem("privateKey");
            document.getElementById("privkey").classList.remove("hide");
        }
    }
})();

function GetPrivateKey() {
    privateKey = document.getElementById("privkey_inp").value;
    localStorage.setItem(
        "privateKey",
        btoa(Date.now() + 86400000 + "==" + btoa(privateKey))
    );
    document.getElementById("form").classList.remove("hide");
    document.getElementById("privkey").classList.add("hide");
}

function deleteKey() {
    localStorage.removeItem("privateKey");
    alert("کلید خصوصی حذف شد!");

    document.getElementById("form").classList.add("hide");
    document.getElementById("privkey").classList.remove("hide");
}