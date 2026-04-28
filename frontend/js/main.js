/* ==========================================================================
   IntegroSystems.ai — Main JavaScript
   ========================================================================== */

(function () {
    'use strict';

    // ======================================================================
    // Header scroll effect
    // ======================================================================
    const header = document.getElementById('main-header');

    function handleHeaderScroll() {
        if (!header) return;
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // ======================================================================
    // Mobile menu
    // ======================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    mobileMenuBtn?.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.className = 'fas fa-bars';
        } else {
            icon.className = 'fas fa-times';
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn?.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        });
    });

    // ======================================================================
    // Scroll Reveal Animations
    // ======================================================================
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ======================================================================
    // Animated Counters
    // ======================================================================
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ======================================================================
    // Smooth scroll for anchor links
    // ======================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // ======================================================================
    // Phone mask
    // ======================================================================
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('8')) value = '7' + value.slice(1);
            if (!value.startsWith('7') && value.length > 0) value = '7' + value;

            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.slice(1, 4);
            if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
            if (value.length >= 7) formatted += '-' + value.slice(7, 9);
            if (value.length >= 9) formatted += '-' + value.slice(9, 11);

            e.target.value = formatted;
        });
    }

    // ======================================================================
    // Pricing buttons -> подставляют тариф в скрытое поле и комментарий
    // ======================================================================
    const pricingBtns = document.querySelectorAll('.pricing-btn');
    pricingBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tariff = this.dataset.tariff;
            const tariffInput = document.getElementById('tariff');
            const sourceInput = document.getElementById('source');
            const messageInput = document.getElementById('message');

            if (tariffInput) tariffInput.value = tariff;
            if (sourceInput) sourceInput.value = 'pricing';
            if (messageInput && !messageInput.value) {
                messageInput.value = `Интересует тариф ${tariff}. Прошу связаться для уточнения деталей.`;
            }

            const form = document.getElementById('contact-form');
            if (form) {
                const offset = 80;
                const targetPos = form.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // ======================================================================
    // Form submission -> POST /api/leads
    // ======================================================================
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitText = document.getElementById('submitText');
            const submitLoader = document.getElementById('submitLoader');
            const successMsg = document.getElementById('successMsg');
            const submitBtn = leadForm.querySelector('button[type="submit"]');

            // Состояние "Отправка..."
            submitBtn.disabled = true;
            submitText?.classList.add('hidden');
            submitLoader?.classList.remove('hidden');

            // Собираем компанию + тариф в общее поле message,
            // чтобы соответствовать API { name, phone, message }
            const company = document.getElementById('company')?.value.trim() || '';
            const tariff  = document.getElementById('tariff')?.value.trim() || '';
            const userMsg = document.getElementById('message')?.value.trim() || '';

            const messageParts = [];
            if (userMsg) messageParts.push(userMsg);
            if (company) messageParts.push(`Компания: ${company}`);
            if (tariff)  messageParts.push(`Тариф: ${tariff}`);

            const payload = {
                name:    document.getElementById('name').value.trim(),
                phone:   document.getElementById('phone').value.trim(),
                message: messageParts.join(' | ')
            };

            try {
                const response = await fetch('/api/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name:    payload.name,
                        phone:   payload.phone,
                        message: payload.message
                    })
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success) {
                    // Очищаем форму
                    leadForm.reset();

                    // Показываем уведомление «Заявка успешно отправлена»
                    if (successMsg) {
                        successMsg.textContent = '✅ Заявка успешно отправлена';
                        successMsg.classList.remove('hidden');
                    }
                    submitBtn.style.display = 'none';

                    console.log('✅ Заявка успешно отправлена в Telegram');

                    // Через 8 секунд возвращаем форму к исходному виду
                    setTimeout(() => {
                        successMsg?.classList.add('hidden');
                        submitBtn.style.display = '';
                        submitBtn.disabled = false;
                        submitText?.classList.remove('hidden');
                        submitLoader?.classList.add('hidden');
                    }, 8000);
                } else {
                    throw new Error(data.message || 'Ошибка отправки');
                }
            } catch (error) {
                console.error('❌ Ошибка отправки формы:', error);
                alert('Ошибка отправки. Попробуйте позже');
                submitBtn.disabled = false;
                submitText?.classList.remove('hidden');
                submitLoader?.classList.add('hidden');
            }
        });
    }

    // ======================================================================
    // Active nav link based on scroll position
    // ======================================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('text-brand-purple');
            link.classList.add('text-gray-700');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.remove('text-gray-700');
                link.classList.add('text-brand-purple');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    console.log('%c🚀 IntegroSystems.ai загружен', 'color:#7B3FE4;font-size:16px;font-weight:bold;');
})();
