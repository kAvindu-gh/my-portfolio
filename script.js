document.addEventListener('DOMContentLoaded', () => {

    /* ── Particles (desktop only) ── */
    const canvas = document.getElementById('particles-canvas');
    if (canvas && window.innerWidth > 768) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];
        function resizeCanvas() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * W; this.y = Math.random() * H;
                this.r = Math.random() * 1.2 + 0.3;
                this.dx = (Math.random() - 0.5) * 0.22; this.dy = (Math.random() - 0.5) * 0.22;
                this.alpha = Math.random() * 0.3 + 0.05;
                this.hue = Math.random() > 0.5 ? '168,85,247' : '129,140,248';
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.hue},${this.alpha})`;
                ctx.shadowBlur = 4; ctx.shadowColor = `rgba(${this.hue},.2)`;
                ctx.fill();
            }
            update() {
                this.x += this.dx; this.y += this.dy;
                if (this.x < 0 || this.x > W) this.dx *= -1;
                if (this.y < 0 || this.y > H) this.dy *= -1;
            }
        }
        for (let i = 0; i < 60; i++) particles.push(new Particle());
        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(168,85,247,${0.04 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.4; ctx.stroke();
                    }
                }
            }
        }
        (function animateParticles() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            requestAnimationFrame(animateParticles);
        })();
    }

    /* ── Sticky Header — RAF throttled ── */
    const header = document.getElementById('header');
    const backBtn = document.getElementById('backToTop');
    let lastScroll = 0, ticking = false;
    window.addEventListener('scroll', () => {
        lastScroll = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(() => {
                header.classList.toggle('scrolled', lastScroll > 50);
                if (backBtn) backBtn.classList.toggle('visible', lastScroll > 400);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    if (backBtn) backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ── Mobile menu ── */
    const hamburger  = document.getElementById('hamburger');
    const navMenu    = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    function openMenu() {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('open');
        navOverlay.classList.add('visible');
        requestAnimationFrame(() => navOverlay.classList.add('active'));
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        navOverlay.classList.remove('active');
        setTimeout(() => navOverlay.classList.remove('visible'), 380);
        document.body.style.overflow = '';
    }
    if (hamburger) hamburger.addEventListener('click', () => navMenu.classList.contains('open') ? closeMenu() : openMenu());
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    if (navMenu) navMenu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ── Active nav — RAF throttled ── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link');
    let navTicking  = false;
    window.addEventListener('scroll', () => {
        if (!navTicking) {
            requestAnimationFrame(() => {
                let current = '';
                sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 200) current = sec.id; });
                navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
                navTicking = false;
            });
            navTicking = true;
        }
    }, { passive: true });

    /* ── Scroll Reveal ── */
    const revealEls = document.querySelectorAll('.reveal,.reveal-up,.reveal-left,.reveal-right');
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); revealObs.unobserve(entry.target); }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => revealObs.observe(el));

    /* ── Typing Effect ── */
    const typed = document.getElementById('typed');
    const words = ['beautiful UIs', 'robust backends', 'mobile apps', 'clean code'];
    let wi = 0, ci = 0, deleting = false;
    function type() {
        const word = words[wi];
        typed.textContent = deleting ? word.substring(0, ci--) : word.substring(0, ci++);
        if (!deleting && ci > word.length) { deleting = true; setTimeout(type, 1400); return; }
        if (deleting && ci < 0) { deleting = false; wi = (wi + 1) % words.length; }
        setTimeout(type, deleting ? 45 : 85);
    }
    if (typed) type();

    /* ── About counters ── */
    const countersEl = document.querySelector('.about-counters');
    if (countersEl) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.querySelectorAll('.ac-num').forEach(el => {
                    const target = +el.dataset.target;
                    let cur = 0;
                    const t = setInterval(() => { cur++; el.textContent = cur; if (cur >= target) clearInterval(t); }, 80);
                });
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.4 });
        obs.observe(countersEl);
    }

    /* ── Skill Bar Animation: race to 100% → settle ── */
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
        const barItems = document.querySelectorAll('.skill-bar-item');
        let animated = false;
        function animateBars() {
            if (animated) return;
            animated = true;
            barItems.forEach((item, idx) => {
                const fill = item.querySelector('.skill-bar-fill');
                const pctLabel = item.querySelector('.skill-bar-pct');
                const targetPct = parseInt(item.dataset.pct, 10);
                setTimeout(() => {
                    fill.style.transition = 'width 0.5s cubic-bezier(.4,0,.2,1)';
                    fill.style.width = '100%';
                    pctLabel.textContent = '100%';
                    setTimeout(() => {
                        fill.style.transition = 'width 1.2s cubic-bezier(.34,1.1,.64,1)';
                        fill.style.width = targetPct + '%';
                        let cur = 100;
                        const step = Math.ceil((100 - targetPct) / 28);
                        const counter = setInterval(() => {
                            cur -= step;
                            if (cur <= targetPct) { cur = targetPct; clearInterval(counter); }
                            pctLabel.textContent = cur + '%';
                        }, 32);
                    }, 680);
                }, idx * 55);
            });
        }
        const skillsObs = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) { animateBars(); skillsObs.unobserve(entry.target); } });
        }, { threshold: 0.15 });
        skillsObs.observe(skillsSection);
    }

    /* ── Project image fallback ── */
    document.querySelectorAll('.proj-row-img img').forEach(img => {
        img.addEventListener('error', () => { img.style.display = 'none'; });
        if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
    });

    /* ── Contact Form ── */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            btn.querySelector('span').textContent = 'Sending…';
            btn.disabled = true;
            setTimeout(() => {
                btn.querySelector('span').textContent = 'Send Message';
                btn.disabled = false;
                if (success) { success.classList.add('show'); form.reset(); setTimeout(() => success.classList.remove('show'), 5000); }
            }, 1500);
        });
    }

    /* ── Smooth scroll ── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    /* ── Desktop mouse parallax on hero frame ── */
    if (window.matchMedia('(pointer:fine) and (min-width:769px)').matches) {
        const frame = document.querySelector('.hero-img-frame');
        if (frame) {
            window.addEventListener('mousemove', e => {
                const x = (e.clientX / window.innerWidth - 0.5) * 12;
                const y = (e.clientY / window.innerHeight - 0.5) * 8;
                frame.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
            }, { passive: true });
        }
    }

});