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
    // Debounce slightly or just run
    requestAnimationFrame(updateLayout);
});

function updateVisuals() {
    if (!isDragging) return;
    bubble.style.transform = `translateX(${currentTranslate}px)`;
    animationFrameId = requestAnimationFrame(updateVisuals);
}

function startDrag(e) {
    // Only drag if left click (for mouse)
    if (e.type === 'mousedown' && e.button !== 0) return;

    // Check if we are interacting with the switcher area generally
    // (We allow dragging from anywhere in the switcher for easier touch targets)

    isDragging = true;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    startX = clientX;

    // Prevent default to stop text selection/native dragging
    if (e.cancelable && e.type === 'mousedown') e.preventDefault();

    // Calculate initial state
    const optWidth = updateLayout();
    initialTranslate = getCheckedIndex() * optWidth;
    currentTranslate = initialTranslate;

    // Immediate feedback
    bubble.style.transition = 'none';
    switcher.style.cursor = 'grabbing';

    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updateVisuals);

    // optimize: attach move/end listeners only when dragging
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

function moveDrag(e) {
    if (!isDragging) return;

    // Prevent default to ensure smooth drag without scrolling or other browser interventions
    if (e.cancelable) e.preventDefault();

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const deltaX = clientX - startX;

    let newPos = initialTranslate + deltaX;

    // Simple clamping without resistance (1:1 movement)
    // "Simple drag" - just stops at edges, no rubber band force
    newPos = Math.max(0, Math.min(newPos, maxTranslate));

    currentTranslate = newPos;
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationFrameId);
    switcher.style.cursor = '';

    // Re-enable transition for smooth snap
    // Using a springier bezier for the snap
    bubble.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

    // Find nearest option
    const optWidth = switcher.offsetWidth / options.length;
    const nearestIndex = Math.round(currentTranslate / optWidth);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, options.length - 1));

    // Snap visually first
    const finalTranslate = clampedIndex * optWidth;
    bubble.style.transform = `translateX(${finalTranslate}px)`;

    // Update input state
    const input = options[clampedIndex].querySelector('input');
    if (!input.checked) {
        input.checked = true;
        input.dispatchEvent(new Event('change'));
    }

    // Clean up style after transition to let CSS take over if needed
    // But we need to keep inline transform until checking next time or rely on CSS classes
    // Here we clear it after a timeout matching transition duration to let CSS state take over
    setTimeout(() => {
        bubble.style.transition = '';
        bubble.style.transform = '';
    }, 600);

    // optimize: remove listeners
    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('touchmove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
}

// Event Listeners
switcher.addEventListener('mousedown', startDrag);
switcher.addEventListener('touchstart', startDrag, { passive: false }); // passive: false to allow preventing scroll if needed
