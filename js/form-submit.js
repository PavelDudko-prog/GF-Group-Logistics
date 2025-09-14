(function () {
  const EMAIL_SUBJECT = 'New quote request';
  const FORM_ENDPOINT = '';
  const RECAPTCHA_PROVIDER = 'none';
  const MIN_SECONDS = 2;

  function validate(form, t) {
    const v = (name) => form.elements[name]?.value?.trim() || '';
    const errs = {};
    if (!v('name')) errs.name = t('alerts.validation.required');
    if (!v('phone')) errs.phone = t('alerts.validation.required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) errs.email = t('alerts.validation.email');
    if (!v('pickup')) errs.pickup = t('alerts.validation.required');
    if (!v('dropoff')) errs.dropoff = t('alerts.validation.required');
    if (!v('cargo')) errs.cargo = t('alerts.validation.required');
    if (!v('volume')) errs.volume = t('alerts.validation.required');
    if (!v('weight')) errs.weight = t('alerts.validation.required');
    if (!form.elements['consent'].checked) errs.consent = t('alerts.validation.consent');
    const ts = parseInt(v('ts') || '0', 10);
    if (Date.now() - ts < MIN_SECONDS * 1000) errs.ts = 'slowdown';
    if (v('company')) errs.company = 'bot';
    return errs;
  }

  function showErrors(form, errs) {
    const fields = ['name','phone','email','pickup','dropoff','cargo','volume','weight','comment'];
    fields.forEach(f => {
      const el = form.querySelector(`[data-error-for="${f}"]`);
      if (el) el.textContent = errs[f] || '';
    });
  }

  function buildPayload(form, dict) {
    const data = {
      brand: dict.meta.brand,
      phone: dict.meta.phoneDisplay,
      email: dict.meta.email,
      name: form.elements['name'].value.trim(),
      phone_client: form.elements['phone'].value.trim(),
      email_client: form.elements['email'].value.trim(),
      pickup: form.elements['pickup'].value.trim(),
      dropoff: form.elements['dropoff'].value.trim(),
      cargo: form.elements['cargo'].value.trim(),
      volume: form.elements['volume'].value.trim(),
      weight: form.elements['weight'].value.trim(),
      comment: form.elements['comment'].value.trim()
    };
    const text =
      `Brand: ${data.brand}\n` +
      `Client: ${data.name}\n` +
      `Phone: ${data.phone_client}\n` +
      `Email: ${data.email_client}\n` +
      `Pickup: ${data.pickup}\n` +
      `Drop-off: ${data.dropoff}\n` +
      `Cargo: ${data.cargo}\n` +
      `Volume: ${data.volume}\n` +
      `Weight: ${data.weight}\n` +
      `Comment: ${data.comment || '-'}`;
    return { subject: `${EMAIL_SUBJECT} — ${data.brand}`, text, data };
  }

  async function send(form, payload) {
    if (!FORM_ENDPOINT) {
      await new Promise(r => setTimeout(r, 600));
      return { ok: true, mock: true };
    }
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { ok: res.ok };
  }

  function toggleStatus(ok, dict) {
    const okEl = document.querySelector('.success');
    const failEl = document.querySelector('.fail');
    if (ok) {
      okEl.classList.remove('hidden');
      failEl.classList.add('hidden');
    } else {
      okEl.classList.add('hidden');
      failEl.classList.remove('hidden');
    }
  }

  window.initFormSubmit = function ({ t, dict }) {
    const form = document.getElementById('quoteForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errs = validate(form, t);
      showErrors(form, errs);
      if (Object.keys(errs).length) {
        toggleStatus(false, dict);
        return;
      }
      const payload = buildPayload(form, dict);
      try {
        const result = await send(form, payload);
        toggleStatus(result.ok, dict);
        if (result.ok) form.reset();
      } catch {
        toggleStatus(false, dict);
      }
    });
  };
})();
