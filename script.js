const switcher = document.querySelector('.switcher');

const trackPrevious = (el) => {
    const radios = el.querySelectorAll('input[type="radio"]');
    let previousValue = null;


    const initiallyChecked = el.querySelector('input[type="radio"]:checked');
    if (initiallyChecked) {
        previousValue = initiallyChecked.getAttribute("c-option");
        el.setAttribute('c-previous', previousValue);
    }

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                el.setAttribute('c-previous', previousValue ?? '');
                previousValue = radio.getAttribute("c-option");
            }
        });
    });
}

trackPrevious(switcher);

// Theme toggle button
const themeToggle = document.querySelector('.theme-toggle');
const lightRadio = document.querySelector('input[name="theme"][value="light"]');
const darkRadio = document.querySelector('input[name="theme"][value="dark"]');

if (themeToggle && lightRadio && darkRadio) {
    themeToggle.addEventListener('click', (e) => {
        // Add jelly animation
        themeToggle.classList.remove('icon-jelly');
        // Force reflow
        void themeToggle.offsetWidth;
        themeToggle.classList.add('icon-jelly');

        // Create overlay
        const overlay = document.createElement('div');
        overlay.classList.add('theme-transition');

        // Determine next theme
        const isLight = lightRadio.checked;
        const nextTheme = isLight ? 'dark' : 'light';
        // Match CSS colors: #E8E8E9 (Light), #1b1b1d (Dark)
        const nextColor = nextTheme === 'light' ? '#E8E8E9' : '#1b1b1d';

        overlay.style.backgroundColor = nextColor;

        // Set initial clip path at click position
        const x = e.clientX;
        const y = e.clientY;
        overlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;

        document.body.appendChild(overlay);

        // Force reflow
        overlay.offsetHeight;

        // Animate
        // Calculate radius to cover screen
        const maxRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );
        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;

        // Switch theme when animation covers screen
        // CSS transition is 0.8s, wait slightly less to ensure coverage
        setTimeout(() => {
            if (nextTheme === 'dark') {
                darkRadio.checked = true;
                darkRadio.dispatchEvent(new Event('change'));
            } else {
                lightRadio.checked = true;
                lightRadio.dispatchEvent(new Event('change'));
            }

            // Allow DOM to update
            requestAnimationFrame(() => {
                setTimeout(() => {
                    overlay.remove();
                }, 50);
            });

        }, 800);
    });
}

// Navigation - scroll to sections on click
const navInputs = document.querySelectorAll('.switcher input[type="radio"]');

navInputs.forEach(input => {
    input.addEventListener('change', () => {
        const sectionId = input.value;
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Optimization: Use IntersectionObserver for better performance
const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('id');
            // Find input efficiently
            const correspondingInput = document.querySelector(`.switcher input[value="${sectionId}"]`);

            if (correspondingInput && !correspondingInput.checked) {
                // Programmatically setting checked does not trigger 'change' event
                correspondingInput.checked = true;
                // Update previous tracking for bubble animation
                switcher.setAttribute('c-previous', correspondingInput.getAttribute('c-option'));
            }
        }
    });
}, observerOptions);

const sections = document.querySelectorAll('section');
sections.forEach(section => observer.observe(section));

// Drag navigation bubble to switch sections
let isDragging = false;
let startX = 0;
let initialTranslate = 0;
let maxTranslate = 0;
let currentTranslate = 0;
let animationFrameId = null;

const bubble = document.querySelector('.switcher__bubble');
const options = Array.from(document.querySelectorAll('.switcher__option'));

function getCheckedIndex() {
    return options.findIndex(opt => opt.querySelector('input').checked);
}

function updateLayout() {
    const optWidth = switcher.offsetWidth / options.length;
    maxTranslate = switcher.offsetWidth - optWidth;

    // Snap bubble to current selection on resize
    const checkedIndex = getCheckedIndex();
    if (checkedIndex !== -1 && !isDragging) {
        const finalTranslate = checkedIndex * optWidth;
        bubble.style.transform = `translateX(${finalTranslate}px)`;
    }

    return optWidth;
}

// Handle resize to keep bubble aligned
window.addEventListener('resize', () => {
    requestAnimationFrame(updateLayout);
});

function updateVisuals() {
    if (!isDragging) return;
    // Add slight squeeze effect while dragging
    bubble.style.transform = `translateX(${currentTranslate}px) scale(0.95)`;
    animationFrameId = requestAnimationFrame(updateVisuals);
}

function startDrag(e) {
    if (!e.target.closest('.switcher')) return;
    if (e.type === 'mousedown' && e.button !== 0) return;

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;

    // Bounds Check
    const rect = switcher.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const optWidth = switcher.offsetWidth / options.length;
    const currentIndex = getCheckedIndex();
    const bubbleX = currentIndex * optWidth;

    // Buffer for easier grabbing
    if (relativeX < bubbleX - 10 || relativeX > bubbleX + optWidth + 10) {
        return;
    }

    isDragging = true;
    startX = clientX;

    if (e.cancelable) e.preventDefault();

    updateLayout();
    initialTranslate = currentIndex * optWidth;
    currentTranslate = initialTranslate;

    switcher.classList.add('switcher--dragging');
    bubble.style.transition = 'none';
    switcher.style.cursor = 'grabbing';

    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updateVisuals);

    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function moveDrag(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = clientX - startX;

    let newPos = initialTranslate + deltaX;
    newPos = Math.max(0, Math.min(newPos, maxTranslate));

    currentTranslate = newPos;
}

function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    cancelAnimationFrame(animationFrameId);
    switcher.style.cursor = '';
    switcher.classList.remove('switcher--dragging');

    bubble.style.transition = '';

    const optWidth = switcher.offsetWidth / options.length;
    const nearestIndex = Math.round(currentTranslate / optWidth);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, options.length - 1));
    const finalTranslate = clampedIndex * optWidth;

    bubble.style.transform = `translateX(${finalTranslate}px)`;
    bubble.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

    const input = options[clampedIndex].querySelector('input');
    if (!input.checked) {
        input.checked = true;
        input.dispatchEvent(new Event('change'));
    }

    setTimeout(() => { bubble.style.transition = ''; }, 400);

    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('touchmove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);
}

switcher.addEventListener('mousedown', startDrag);
switcher.addEventListener('touchstart', startDrag, { passive: false });
