/* ==========================================================================
   LENTE BINARIA - JavaScript Principal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initMobileNavigation();
    initHeaderScroll();
    initSmoothScroll();
    initCounterAnimation();
    initFormValidation();
    initScrollAnimations();
    initCallBooking();
    initMobileStatsPosition();
});

/* ==========================================================================
   Mobile Navigation
   ========================================================================== */
function initMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!navToggle || !nav) return;

    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.contains('nav--open');

        nav.classList.toggle('nav--open');
        navToggle.classList.toggle('nav__toggle--open');

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? '' : 'hidden';

        // Accessibility
        navToggle.setAttribute('aria-expanded', !isOpen);
        navToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav--open');
            navToggle.classList.remove('nav__toggle--open');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
            nav.classList.remove('nav--open');
            navToggle.classList.remove('nav__toggle--open');
            document.body.style.overflow = '';
        }
    });
}

/* ==========================================================================
   Header Scroll Effect
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 100;

    const handleScroll = () => {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class
        if (currentScroll > scrollThreshold) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        lastScroll = currentScroll;
    };

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ==========================================================================
   Smooth Scroll for Anchor Links
   ========================================================================== */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const headerHeight = document.getElementById('header')?.offsetHeight || 0;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

/* ==========================================================================
   Counter Animation
   ========================================================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    // Use Intersection Observer to trigger animation when visible
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/* ==========================================================================
   Form Validation and Submission
   ========================================================================== */
function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Custom validation messages
    const validationMessages = {
        nombre: 'Por favor, introduce tu nombre',
        email: 'Por favor, introduce un email válido',
        privacidad: 'Debes aceptar la política de privacidad'
    };

    // Style inputs on validation
    const styleInput = (input, isValid) => {
        if (isValid) {
            input.style.borderColor = '';
        } else {
            input.style.borderColor = '#ef4444';
        }
    };

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handle input blur for real-time validation
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.required && !input.value.trim()) {
                styleInput(input, false);
            } else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
                styleInput(input, false);
            } else {
                styleInput(input, true);
            }
        });

        input.addEventListener('input', () => {
            styleInput(input, true);
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Validate all fields
        let isValid = true;
        const formData = new FormData(form);

        // Check required fields
        const nombre = form.querySelector('#nombre');
        const email = form.querySelector('#email');
        const privacidad = form.querySelector('#privacidad');

        if (!nombre.value.trim()) {
            styleInput(nombre, false);
            isValid = false;
        }

        if (!email.value.trim() || !isValidEmail(email.value)) {
            styleInput(email, false);
            isValid = false;
        }

        if (!privacidad.checked) {
            isValid = false;
            privacidad.style.outline = '2px solid #ef4444';
        }

        if (!isValid) {
            // Shake animation for submit button
            submitBtn.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                submitBtn.style.animation = '';
            }, 500);
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spinner" viewBox="0 0 24 24" style="width: 20px; height: 20px; animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/>
            </svg>
            Enviando...
        `;

        // Send form to Formspree
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success state
                submitBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    ¡Mensaje enviado!
                `;
                submitBtn.style.backgroundColor = '#00D64F';

                // Reset form after success
                setTimeout(() => {
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            } else {
                throw new Error('Error en el servidor');
            }

        } catch (error) {
            // Error state
            submitBtn.innerHTML = 'Error al enviar. Inténtalo de nuevo.';
            submitBtn.style.backgroundColor = '#ef4444';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.backgroundColor = '';
            }, 3000);
        }
    });
}

/* ==========================================================================
   Scroll Animations (Intersection Observer)
   ========================================================================== */
function initScrollAnimations() {
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll(`
        .pack,
        .caso,
        .nosotros__member,
        .nosotros__value,
        .proceso__step,
        .section-header
    `);

    if (animatedElements.length === 0) return;

    const observerOptions = {
        threshold: 0.05,
        rootMargin: '50px 0px 0px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach((el, index) => {
        // Initial state - faster animations with minimal delay
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.3s ease ${Math.min(index * 0.05, 0.2)}s, transform 0.3s ease ${Math.min(index * 0.05, 0.2)}s`;

        animationObserver.observe(el);
    });
}

/* ==========================================================================
   Call Booking Functionality
   ========================================================================== */
function initCallBooking() {
    const btnReservarLlamada = document.getElementById('btnReservarLlamada');
    const contactForm = document.getElementById('contactForm');
    const tipoContactoField = document.getElementById('tipoContacto');

    if (!btnReservarLlamada || !contactForm) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

    // Handle "Reservar llamada" button click
    btnReservarLlamada.addEventListener('click', (e) => {
        e.preventDefault();

        // Set form to call booking mode
        if (tipoContactoField) {
            tipoContactoField.value = 'reserva_llamada';
        }

        // Update submit button text
        if (submitBtn) {
            submitBtn.innerHTML = `
                Reservar llamada
                <span class="btn__arrow">→</span>
            `;
        }

        // Add visual indicator to form
        contactForm.classList.add('form--call-mode');

        // Scroll to form
        const headerHeight = document.getElementById('header')?.offsetHeight || 0;
        const targetPosition = contactForm.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Focus on first field
        setTimeout(() => {
            const firstInput = contactForm.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 500);
    });

    // Reset form mode when form is reset or submitted successfully
    contactForm.addEventListener('reset', () => {
        if (tipoContactoField) {
            tipoContactoField.value = 'mensaje';
        }
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
        }
        contactForm.classList.remove('form--call-mode');
    });

    // Check URL for call booking parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reservar') === 'llamada') {
        btnReservarLlamada.click();

        // If pack parameter is present, pre-select it in the form
        const packParam = urlParams.get('pack');
        if (packParam) {
            const packSelect = contactForm.querySelector('#pack');
            if (packSelect) {
                packSelect.value = packParam;
            }
        }
    }
}

/* ==========================================================================
   Mobile Stats Position
   ========================================================================== */
function initMobileStatsPosition() {
    const statsWrapper = document.querySelector('.hero__stats-wrapper');
    const serviciosSection = document.querySelector('.servicios');
    const sectionHeader = serviciosSection?.querySelector('.section-header');

    if (!statsWrapper || !serviciosSection || !sectionHeader) return;

    let statsOriginalParent = statsWrapper.parentElement;
    let statsNextSibling = statsWrapper.nextElementSibling;
    let isMoved = false;

    const moveStats = () => {
        const isMobile = window.innerWidth <= 1024;

        if (isMobile && !isMoved) {
            // Mover estadísticas después del section-header
            sectionHeader.insertAdjacentElement('afterend', statsWrapper);
            isMoved = true;
        } else if (!isMobile && isMoved) {
            // Restaurar estadísticas a su posición original
            if (statsNextSibling) {
                statsOriginalParent.insertBefore(statsWrapper, statsNextSibling);
            } else {
                statsOriginalParent.appendChild(statsWrapper);
            }
            isMoved = false;
        }
    };

    // Ejecutar al cargar
    moveStats();

    // Ejecutar al redimensionar
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(moveStats, 150);
    });
}

/* ==========================================================================
   Utility: Add shake animation keyframes
   ========================================================================== */
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .spinner {
        display: inline-block;
        margin-right: 8px;
    }
`;
document.head.appendChild(style);
