// ==========================================
// GSAP Scroll Animations — FIXED VERSION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth < 768;

    if (!window.gsap || !window.ScrollTrigger) {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ------------------------------------------
    // INITIAL STATE (Prevent FOUC)
    // ------------------------------------------
    gsap.set(
        '.hero__badge, .hero__title, .hero__description, .hero__buttons',
        { opacity: 0, y: 40 }
    );

    gsap.set('.hero__visual', {
        opacity: 0,
        scale: 0.9,
        rotationX: 10,
        transformPerspective: 1000,
    });

    // ------------------------------------------
    // 1. HERO ENTRY ANIMATION
    // ------------------------------------------
    const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.8 }
    });

    heroTl
        .to('.hero__badge', { opacity: 1, y: 0 })
        .to('.hero__title', { opacity: 1, y: 0 }, '-=0.6')
        .to('.hero__description', { opacity: 1, y: 0 }, '-=0.6')
        .to('.hero__buttons', { opacity: 1, y: 0 }, '-=0.6')
        .to('.hero__visual', {
            opacity: 1,
            scale: 1,
            rotationX: 0,
            duration: 1,
            ease: 'back.out(1.2)'
        }, '-=0.8');

    // ------------------------------------------
    // 2. SECTION TITLES
    // ------------------------------------------
    gsap.utils.toArray('.section__title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                once: true
            },
            opacity: 0,
            y: 30,
            duration: 0.8
        });
    });

    // ------------------------------------------
    // 3. ABOUT SECTION - Fixed for proper alignment on refresh
    // ------------------------------------------
    const visionCards = document.querySelectorAll('.vision-card');
    if (visionCards.length && !isMobile) {
        // Set initial hidden state
        gsap.set(visionCards, { opacity: 0, y: 40 });

        // Check if cards are already in viewport on page load
        const aboutSection = document.querySelector('.about__visions');
        if (aboutSection) {
            const rect = aboutSection.getBoundingClientRect();
            const inViewport = rect.top < window.innerHeight * 0.8;

            if (inViewport) {
                visionCards.forEach((card, index) => {
                    card.dataset.animated = 'true';
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        delay: index * 0.2,
                        ease: 'power2.out'
                    });
                });
            } else {
                // Set up scroll trigger for cards not yet visible
                gsap.to('.vision-card', {
                    scrollTrigger: {
                        trigger: '.about__visions',
                        start: 'top 80%',
                        once: true,
                        onEnter: () => {
                            visionCards.forEach(card => card.dataset.animated = 'true');
                        }
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: 'power2.out'
                });
            }
        }
    }

    const statItems = document.querySelectorAll('.stat');
    if (statItems.length && !isMobile) {
        // Set initial hidden state
        gsap.set(statItems, { opacity: 0, scale: 0.6 });

        const statsSection = document.querySelector('.about__stats');
        if (statsSection) {
            const rect = statsSection.getBoundingClientRect();
            const inViewport = rect.top < window.innerHeight * 0.85;

            if (inViewport) {
                statItems.forEach((stat, index) => {
                    stat.dataset.animated = 'true';
                    gsap.to(stat, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        delay: index * 0.15,
                        ease: 'back.out(1.7)'
                    });
                });
            } else {
                gsap.to('.stat', {
                    scrollTrigger: {
                        trigger: '.about__stats',
                        start: 'top 85%',
                        once: true,
                        onEnter: () => {
                            statItems.forEach(stat => stat.dataset.animated = 'true');
                        }
                    },
                    opacity: 1,
                    scale: 1,
                    stagger: 0.15,
                    duration: 0.6,
                    ease: 'back.out(1.7)'
                });
            }
        }
    }

    // ------------------------------------------
    // 4. SERVICES GRID - Fixed to prevent layout shift on refresh
    // ------------------------------------------
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length && !isMobile) {
        // Set initial hidden state
        gsap.set(serviceCards, { opacity: 0, y: 30 });

        // Check if cards are already in viewport on page load
        const checkAndAnimateServices = () => {
            serviceCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const inViewport = rect.top < window.innerHeight * 0.9;

                if (inViewport && card.dataset.animated !== 'true') {
                    card.dataset.animated = 'true';
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: 'power2.out'
                    });
                }
            });
        };

        // Run immediately for cards already in viewport
        checkAndAnimateServices();

        // Also set up scroll trigger for cards not yet visible
        ScrollTrigger.batch('.service-card', {
            start: 'top 90%',
            once: true,
            onEnter: batch => {
                batch.forEach((card, index) => {
                    if (card.dataset.animated !== 'true') {
                        card.dataset.animated = 'true';
                        gsap.to(card, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        });
    }

    // ------------------------------------------
    // 5. PRICING CARDS - Fixed to prevent layout shift on refresh
    // ------------------------------------------
    const pricingCards = document.querySelectorAll('.pricing-card');
    if (pricingCards.length && !isMobile) {
        // Set initial hidden state
        gsap.set(pricingCards, { opacity: 0, y: 30, scale: 0.98 });

        // Check if cards are already in viewport on page load
        const checkAndAnimatePricing = () => {
            pricingCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const inViewport = rect.top < window.innerHeight * 0.9;

                if (inViewport && card.dataset.animated !== 'true') {
                    card.dataset.animated = 'true';
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        delay: index * 0.15,
                        ease: 'power2.out'
                    });
                }
            });
        };

        // Run immediately for cards already in viewport
        checkAndAnimatePricing();

        // Also set up scroll trigger for cards not yet visible
        ScrollTrigger.batch('.pricing-card', {
            start: 'top 90%',
            once: true,
            onEnter: batch => {
                batch.forEach((card, index) => {
                    if (card.dataset.animated !== 'true') {
                        card.dataset.animated = 'true';
                        gsap.to(card, {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.6,
                            delay: index * 0.15,
                            ease: 'power2.out'
                        });
                    }
                });
            }
        });
    }

    // ------------------------------------------
    // 6. PARALLAX GRADIENT ORBS (OPTIMIZED)
    // ------------------------------------------
    gsap.utils.toArray('.gradient-orb').forEach((orb, i) => {
        gsap.to(orb, {
            y: i === 0 ? 300 : i === 1 ? -150 : 100,
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1 + i * 0.5
            }
        });
    });

    // ------------------------------------------
    // 7. FOOTER
    // ------------------------------------------
    if (document.querySelector('.footer')) {
        gsap.from('.footer__content', {
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 90%',
                once: true
            },
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power2.out'
        });
    }

    // ------------------------------------------
    // 8. MOUSE GLOW EFFECT (FIXED)
    // ------------------------------------------
    gsap.utils.toArray('.glass-card, .vision-card, .pricing-card').forEach(card => {

        let glow = card.querySelector('.scroll-glow-effect');
        if (!glow) {
            glow = document.createElement('div');
            glow.className = 'scroll-glow-effect';
            card.appendChild(glow);
        }

        Object.assign(glow.style, {
            position: 'absolute',
            inset: '0',
            background: 'radial-gradient(circle at center, rgba(200,80,192,0.35), transparent 70%)',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            mixBlendMode: 'overlay'
        });

        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        // Throttle mousemove for better performance
        let ticking = false;
        card.addEventListener('mousemove', e => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    glow.style.background =
                        `radial-gradient(circle at ${x}px ${y}px, rgba(200,80,192,0.45), transparent 70%)`;

                    glow.style.opacity = 1;
                    ticking = false;
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            glow.style.opacity = 0;
        });

    });

});
