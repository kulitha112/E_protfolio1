document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.getElementById('themeToggleBtn');
  const setTheme = theme => {
    document.documentElement.setAttribute('data-theme', theme);
    themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  setTheme(localStorage.getItem('kh_theme') || 'dark');
  themeButton?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('kh_theme', next);
    setTheme(next);
  });

  const menuButton = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navMenu');
  const closeMenu = () => {
    menu?.classList.remove('active');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const open = !menu?.classList.contains('active');
    menu?.classList.toggle('active', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (menu && menuButton && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  const reveal = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -25px 0px', threshold: .08 });
    reveal.forEach(item => observer.observe(item));
  } else reveal.forEach(item => item.classList.add('visible'));

  const modal = document.querySelector('.erp-lightbox');
  const modalImage = modal?.querySelector('img');
  const modalCaption = modal?.querySelector('p');
  const closeModal = () => modal?.close();
  modal?.querySelector('.erp-lightbox-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  modal?.addEventListener('close', () => { if (modalImage) modalImage.removeAttribute('src'); });
  document.querySelectorAll('.erp-slide img, .single-project-image, .campaign-image, .erp-cert-image').forEach(img => {
    img.addEventListener('click', () => {
      if (!modal || !modalImage || !modalCaption) return;
      modalImage.src = img.src;
      modalImage.alt = img.alt;
      modalCaption.textContent = img.alt;
      modal.showModal();
    });
  });

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const track = slider.querySelector('.erp-slider-track');
    const slides = [...slider.querySelectorAll('.erp-slide')];
    const count = slider.querySelector('.erp-slide-count');
    const dots = slider.querySelector('.erp-slide-dots');
    const prev = slider.querySelector('.erp-prev');
    const next = slider.querySelector('.erp-next');
    if (!track || !slides.length) return;
    let index = 0;
    let timer = null;
    const go = value => {
      index = (value + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      dots?.querySelectorAll('button').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      if (!motionReduced && slides.length > 1 && !timer && !document.hidden) timer = setInterval(() => go(index + 1), 4500);
    };
    const reset = () => { stop(); start(); };
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show image ${i + 1} of ${slides.length}`);
      dot.addEventListener('click', () => { go(i); reset(); });
      dots?.appendChild(dot);
    });
    prev?.addEventListener('click', () => { go(index - 1); reset(); });
    next?.addEventListener('click', () => { go(index + 1); reset(); });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', event => { if (!slider.contains(event.relatedTarget)) start(); });
    slider.addEventListener('touchstart', event => { slider.dataset.touchX = String(event.changedTouches[0].screenX); }, { passive: true });
    slider.addEventListener('touchend', event => {
      const delta = Number(slider.dataset.touchX) - event.changedTouches[0].screenX;
      if (Math.abs(delta) > 50) { go(index + (delta > 0 ? 1 : -1)); reset(); }
    }, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    go(0);
    start();
  });

  const sections = [...document.querySelectorAll('main section[id], footer[id]')];
  const navLinks = [...document.querySelectorAll('.nav-menu .nav-link')];
  const updateNav = () => {
    const current = sections.filter(section => section.getBoundingClientRect().top <= 130).at(-1)?.id || 'home';
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
});
