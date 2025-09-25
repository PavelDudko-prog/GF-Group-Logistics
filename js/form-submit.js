const FUNCTION_URL = "https://functions.yandexcloud.net/d4e6trmmpihi7150pp25";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const tsEl = form.querySelector("#formTs");
  if (tsEl) tsEl.value = Date.now().toString();

  const btn = form.querySelector('button[type="submit"]');
  const okBox = form.querySelector(".form__status .success");
  const failBox = form.querySelector(".form__status .fail");
  const hp = form.querySelector('input[name="company"]');

  const getErr = (n) => form.querySelector(`.error[data-error-for="${n}"]`);
  const setErr = (n, msg) => {
    const el = getErr(n);
    if (el) {
      el.textContent = msg || "";
      el.classList.toggle("hidden", !msg);
    }
  };

  const clearAll = () => {
    ["name", "phone", "email", "pickup", "dropoff", "cargo", "consent"].forEach(
      (n) => setErr(n, "")
    );
  };

  const showStatus = (ok) => {
    if (ok) {
      okBox?.classList.remove("hidden");
      failBox?.classList.add("hidden");
    } else {
      failBox?.classList.remove("hidden");
      okBox?.classList.add("hidden");
    }
  };

  const vEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const vPhone = (s) => s.replace(/[^\d+]/g, "").length >= 7;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearAll();
    okBox?.classList.add("hidden");
    failBox?.classList.add("hidden");

    const data = {
      company: (hp?.value || "").trim(),
      ts: (tsEl?.value || "").trim(),
      name: (form.name?.value || "").trim(),
      phone: (form.phone?.value || "").trim(),
      email: (form.email?.value || "").trim(),
      pickup: (form.pickup?.value || "").trim(),
      dropoff: (form.dropoff?.value || "").trim(),
      cargo: (form.cargo?.value || "").trim(),
      consent: !!form.consent?.checked,
      lang: document.documentElement.lang || "en",
    };

    let bad = false;
    if (data.company) bad = true;
    if (!data.name) {
      setErr("name", "Required");
      bad = true;
    }
    if (!data.phone || !vPhone(data.phone)) {
      setErr("phone", "Invalid");
      bad = true;
    }
    if (!data.email || !vEmail(data.email)) {
      setErr("email", "Invalid");
      bad = true;
    }
    if (!data.pickup) {
      setErr("pickup", "Required");
      bad = true;
    }
    if (!data.dropoff) {
      setErr("dropoff", "Required");
      bad = true;
    }
    if (!data.cargo) {
      setErr("cargo", "Required");
      bad = true;
    }
    if (!data.consent) {
      setErr("consent", "Required");
      bad = true;
    }
    if (!data.ts) bad = true;

    if (bad) {
      showStatus(false);
      return;
    }

    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");

    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": data.lang,
        },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      if (res.ok) {
        showStatus(true);
        form.reset();
        if (tsEl) tsEl.value = Date.now().toString();
      } else {
        showStatus(false);
        if (text) getErr("consent")?.insertAdjacentText("afterend", "");
      }
    } catch (err) {
      showStatus(false);
    } finally {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
    }
  });
});
