// Anch Launcher — Destek formu. Yerel e-posta ile gönderim; sunucuya veri gönderilmez.
(function () {
  "use strict";

  // Destek e-posta adresi — buradan talepleri alırsın
  var SUPPORT_EMAIL = "support@anchproducts.com";

  var form = document.getElementById("supportForm");
  if (!form) return;

  var issueType = document.getElementById("issueType");
  var otherGroup = document.getElementById("otherIssueGroup");
  var otherIssue = document.getElementById("otherIssue");
  var description = document.getElementById("description");
  var userEmail = document.getElementById("userEmail");
  var appVersion = document.getElementById("appVersion");
  var formError = document.getElementById("formError");
  var formSuccess = document.getElementById("formSuccess");

  issueType.addEventListener("change", function () {
    var isOther = issueType.value === "Diğer";
    otherGroup.style.display = isOther ? "" : "none";
    otherIssue.required = isOther;
    if (!isOther) otherIssue.value = "";
  });

  function showError(msg) {
    formError.textContent = msg;
    formError.classList.add("show");
    formSuccess.classList.remove("show");
  }

  function clearError() {
    formError.classList.remove("show");
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    formSuccess.classList.remove("show");

    if (!issueType.value) {
      showError("Lütfen bir sorun kategorisi seçin.");
      issueType.focus();
      return;
    }
    if (issueType.value === "Diğer" && !otherIssue.value.trim()) {
      showError("Lütfen sorun başlığını yazın.");
      otherIssue.focus();
      return;
    }
    if (description.value.trim().length < 10) {
      showError("Açıklama en az 10 karakter olmalıdır.");
      description.focus();
      return;
    }
    if (!isValidEmail(userEmail.value.trim())) {
      showError("Lütfen geçerli bir e-posta adresi girin (yanıt bu adrese yapılacak).");
      userEmail.focus();
      return;
    }

    var title = issueType.value === "Diğer"
      ? otherIssue.value.trim()
      : issueType.value;

    var lines = [
      "Anch Launcher Destek Talebi",
      "==========================",
      "Kategori: " + title,
      "Kod: " + issueType.value,
      "Sürüm: " + (appVersion.value.trim() || "belirtilmedi"),
      "Tarih: " + new Date().toLocaleString("tr-TR"),
      "Kullanıcı E-postası: " + userEmail.value.trim(),
      "",
      "Açıklama:",
      description.value.trim(),
      ""
    ];

    var subject = "[Destek] " + title;
    var body = lines.join("\n");
    var mailto = "mailto:" + SUPPORT_EMAIL
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);

    // Yerel kaydedici (admin paneli senkronu için — sadece bu tarayıcıda)
    try {
      var tickets = JSON.parse(localStorage.getItem("anch_support_tickets") || "[]");
      tickets.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        category: title,
        code: issueType.value,
        version: appVersion.value.trim() || "-",
        email: userEmail.value.trim(),
        description: description.value.trim(),
        status: "open"
      });
      // En fazla 200 kayıt tut
      if (tickets.length > 200) tickets.length = 200;
      localStorage.setItem("anch_support_tickets", JSON.stringify(tickets));
    } catch (err) { /* localStorage kapalı olabilir */ }

    formSuccess.classList.add("show");
    window.location.href = mailto;
  });
})();
