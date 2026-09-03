(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.querySelector('.nav');

  function onScroll() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      burger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Модальное окно записи ---------- */
  var modal = document.getElementById('bookingModal');
  var modalForm = document.getElementById('bookingForm');
  var formStatus = document.getElementById('formStatus');

  // Telegram-бот: сюда впишите токен бота и ID вашего чата,
  // чтобы заявки падали прямо в Telegram. Если оставить пустыми —
  // форма отправит заявку на email через FormSubmit (см. action в HTML).
  var TELEGRAM_BOT_TOKEN = 'ЗАМЕНИТЕ_НА_ТОКЕН_БОТА';
  var TELEGRAM_CHAT_ID = 'ЗАМЕНИТЕ_НА_CHAT_ID';

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var firstInput = modal.querySelector('input, select');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 250);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('.js-open-form').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Отправка в Telegram-бот (если настроен), иначе — стандартная отправка на email
  function sendToTelegram(name, phone, service) {
    var text = 'Новая заявка с лендинга%0A' +
      'Имя: ' + encodeURIComponent(name) + '%0A' +
      'Телефон: ' + encodeURIComponent(phone) + '%0A' +
      'Услуга: ' + encodeURIComponent(service);
    return fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text.replace(/%0A/g, '\n')
      })
    }).then(function (r) { return r.json(); });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      var botConfigured = TELEGRAM_BOT_TOKEN.indexOf('ЗАМЕНИТЕ') === -1 && TELEGRAM_CHAT_ID.indexOf('ЗАМЕНИТЕ') === -1;
      if (!botConfigured) return; // отдаём стандартный POST на FormSubmit

      e.preventDefault();
      var name = modalForm.querySelector('[name="Имя"]').value.trim();
      var phone = modalForm.querySelector('[name="Телефон"]').value.trim();
      var service = modalForm.querySelector('[name="Услуга"]').value;

      if (formStatus) {
        formStatus.className = '';
        formStatus.textContent = 'Отправляю заявку…';
      }

      sendToTelegram(name, phone, service)
        .then(function () {
          if (formStatus) {
            formStatus.className = 'form__status ok';
            formStatus.textContent = 'Заявка отправлена. Свяжусь с вами в течение 15 минут.';
          }
          modalForm.reset();
        })
        .catch(function () {
          if (formStatus) {
            formStatus.className = 'form__status err';
            formStatus.textContent = 'Не удалось отправить. Позвоните: +7-966-011-64-47';
          }
        });
    });
  }

  var revealEls = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(function (el, i) {
    var delay = el.getAttribute('data-delay') || 0;
    if (delay) el.style.setProperty('--delay', delay + 'ms');
    observer.observe(el);
  });
})();
