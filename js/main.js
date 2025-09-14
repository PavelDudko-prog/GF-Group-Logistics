(function () {
  let lang = 'en';

  function get(path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), window.I18N[lang]) ?? '';
  }

  function t(path) {
    const v = get(path);
    return typeof v === 'string' ? v : '';
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = get(el.getAttribute('data-i18n-html')) || '';
    });

    document.getElementById('phoneLink').textContent = window.I18N[lang].meta.phoneDisplay;
    document.getElementById('phoneLink').setAttribute('href', 'tel:' + window.I18N[lang].meta.phoneRaw);
    document.getElementById('callNow').setAttribute('href', 'tel:' + window.I18N[lang].meta.phoneRaw);

    document.getElementById('emailLink').textContent = window.I18N[lang].meta.email;
    document.getElementById('emailLink').setAttribute('href', 'mailto:' + window.I18N[lang].meta.email);
  }

  function initLang() {
    document.querySelectorAll('.lang__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        lang = btn.getAttribute('data-lang');
        applyI18n();
        history.replaceState({}, '', `#${lang}`);
      });
    });
    if (location.hash === '#ru') lang = 'ru';
    if (location.hash === '#uk') lang = 'uk';
  }

  function initPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    const openers = [document.getElementById('privacyLink'), document.getElementById('openPrivacy')];
    const close = document.getElementById('closePrivacy');
    openers.forEach(a => a && a.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.remove('hidden');
    }));
    close.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.classList.add('hidden');
    });
  }

  function initPlaceholders() {
    document.getElementById('formTs').value = Date.now().toString();
    document.getElementById('usdotValue').textContent = '—';
    document.getElementById('mcValue').textContent = '—';
    document.getElementById('insValue').textContent = '—';
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLang();
    applyI18n();
    initPrivacyModal();
    initPlaceholders();
    window.initFormSubmit({ t, dict: window.I18N[lang] });
  });
})();
const modal=document.getElementById('privacyModal')
const openers=[document.getElementById('openPrivacy'),document.getElementById('privacyLink')]
const closeBtn=document.getElementById('closePrivacy')

function openModal(){
  modal.classList.remove('hidden')
  document.body.classList.add('modal-open')
  modal.focus()
}
function closeModal(){
  modal.classList.add('hidden')
  document.body.classList.remove('modal-open')
}

openers.forEach(el=>el&&el.addEventListener('click',e=>{e.preventDefault();openModal()}))
closeBtn&&closeBtn.addEventListener('click',e=>{e.preventDefault();closeModal()})
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()})
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))closeModal()})
