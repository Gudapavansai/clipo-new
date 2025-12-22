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
    const handleThemeToggle = (e) => {
        // Prevent double-firing on touch devices
        if (e.type === 'touchend') {
            e.preventDefault();
        }

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
        // Handle both mouse/touch coordinates
        const clientX = e.clientX || (e.changedTouches ? e.changedTouches[0].clientX : window.innerWidth / 2);
        const clientY = e.clientY || (e.changedTouches ? e.changedTouches[0].clientY : window.innerHeight / 2);

        const x = clientX;
        const y = clientY;

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
    };

    themeToggle.addEventListener('click', handleThemeToggle);
    themeToggle.addEventListener('touchend', handleThemeToggle);
}

// Navigation - scroll to sections on click
const navInputs = document.querySelectorAll('.switcher input[type="radio"]');
const navOptions = Array.from(document.querySelectorAll('.switcher__option'));

navInputs.forEach((input, index) => {
    input.addEventListener('change', () => {
        const sectionId = input.value;
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Move bubble to clicked item using the precise positioning function
        moveBubbleToIndex(index);
    });
});

// Optimization: Use IntersectionObserver for better performance
const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0.1
};

const inputMap = new Map();
navInputs.forEach((input, idx) => {
    inputMap.set(input.value, { input, index: idx });
});

// Function to smoothly move bubble to a specific index
function moveBubbleToIndex(index) {
    const bubble = document.querySelector('.switcher__bubble');
    const options = document.querySelectorAll('.switcher__option');
    if (!bubble || options.length === 0 || !switcher) return;

    // Clamp index to valid range (0 to options.length - 1)
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    // Get the target option element for precise positioning
    const targetOption = options[clampedIndex];
    if (!targetOption) return;

    // Remove active class from all options and add to current
    options.forEach(opt => opt.classList.remove('active'));
    targetOption.classList.add('active');

    // Calculate position based on option's actual position
    const switcherRect = switcher.getBoundingClientRect();
    const optionRect = targetOption.getBoundingClientRect();

    // Calculate the translate value relative to the switcher
    const targetTranslate = optionRect.left - switcherRect.left;

    // Update bubble width to match option width
    bubble.style.width = `${optionRect.width}px`;

    // Apply smooth transition
    bubble.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease';
    bubble.style.transform = `translateX(${targetTranslate}px)`;

    // Clean up transition after animation
    setTimeout(() => {
        bubble.style.transition = '';
    }, 500);
}

// Initialize bubble position on page load
document.addEventListener('DOMContentLoaded', () => {
    const checkedInput = document.querySelector('.switcher input:checked');
    if (checkedInput) {
        const data = inputMap.get(checkedInput.value);
        if (data) {
            // Set initial position without animation
            const bubble = document.querySelector('.switcher__bubble');
            const options = document.querySelectorAll('.switcher__option');
            if (bubble && options.length > 0 && switcher) {
                const targetOption = options[data.index];
                if (targetOption) {
                    // Set initial active class
                    options.forEach(opt => opt.classList.remove('active'));
                    targetOption.classList.add('active');

                    const switcherRect = switcher.getBoundingClientRect();
                    const optionRect = targetOption.getBoundingClientRect();
                    bubble.style.width = `${optionRect.width}px`;
                    bubble.style.transform = `translateX(${optionRect.left - switcherRect.left}px)`;
                }
            }
        }
    }
});

// IntersectionObserver to update bubble when sections come into view
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('id');
            const data = inputMap.get(sectionId);

            if (data && !data.input.checked) {
                data.input.checked = true;
                switcher.setAttribute('c-previous', data.input.getAttribute('c-option'));
                moveBubbleToIndex(data.index);
            }
        }
    });
}, observerOptions);

// Observe all sections with IDs
const sections = document.querySelectorAll('section[id]');
sections.forEach(section => sectionObserver.observe(section));

// Additional scroll-based update for reliability
let scrollTimeout = null;
window.addEventListener('scroll', () => {
    // Debounce scroll updates
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const scrollPos = window.scrollY + window.innerHeight * 0.4;

        let currentSection = null;
        sections.forEach(section => {
            if (section.offsetTop <= scrollPos) {
                currentSection = section;
            }
        });

        if (currentSection) {
            const sectionId = currentSection.getAttribute('id');
            const data = inputMap.get(sectionId);

            if (data && !data.input.checked) {
                data.input.checked = true;
                switcher.setAttribute('c-previous', data.input.getAttribute('c-option'));
                moveBubbleToIndex(data.index);
            }
        }
    }, 50);
}, { passive: true });

// Drag navigation bubble to switch sections
let isDragging = false;
let ignoreClick = false;
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

    // Update bubble width
    bubble.style.width = `${optWidth}px`;

    // Snap bubble to current selection on resize
    const checkedIndex = getCheckedIndex();
    if (checkedIndex !== -1 && !isDragging) {
        const finalTranslate = checkedIndex * optWidth;
        bubble.style.transform = `translateX(${finalTranslate}px)`;
    }

    return optWidth;
}

// Handle resize to keep bubble aligned (using ResizeObserver for element changes)
const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateLayout);
});

if (switcher) {
    resizeObserver.observe(switcher);
}

// Fallback for window resize
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
    ignoreClick = false;
    startX = clientX;

    // Prevent default to stop text selection/native dragging
    if (e.cancelable) e.preventDefault();

    // Clear any previous highlights
    options.forEach(opt => opt.classList.remove('switcher__option--highlight'));

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

    // If moved significantly, treat as drag (suppress click)
    if (Math.abs(deltaX) > 5) {
        ignoreClick = true;
    }

    let newPos = initialTranslate + deltaX;
    newPos = Math.max(0, Math.min(newPos, maxTranslate));

    currentTranslate = newPos;

    // Calculate which options the bubble is touching/overlapping
    const optWidth = switcher.offsetWidth / options.length;
    const bubbleLeft = newPos;
    const bubbleRight = newPos + optWidth;

    // Update active classes for all options that bubble touches
    options.forEach((opt, idx) => {
        const optLeft = idx * optWidth;
        const optRight = (idx + 1) * optWidth;

        // Check if bubble overlaps with this option
        const isOverlapping = bubbleLeft < optRight && bubbleRight > optLeft;

        if (isOverlapping) {
            opt.classList.add('active');
            opt.classList.add('switcher__option--highlight');
        } else {
            opt.classList.remove('active');
            opt.classList.remove('switcher__option--highlight');
        }
    });
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

    // Remove highlight and active classes, then set active on final selection
    options.forEach((opt, idx) => {
        opt.classList.remove('switcher__option--highlight');
        if (idx === clampedIndex) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });

    // Snap animation
    bubble.style.transform = `translateX(${finalTranslate}px)`;
    bubble.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

    // Update input state
    const input = options[clampedIndex].querySelector('input');
    // Only dispatch change if we actually changed tabs
    if (!input.checked) {
        input.checked = true;
        input.dispatchEvent(new Event('change'));

        // Also update the switcher's c-previous attribute
        const previousValue = switcher.getAttribute('c-previous');
        switcher.setAttribute('c-previous', previousValue);
    }

    // Cleanup style after animation
    setTimeout(() => { bubble.style.transition = ''; }, 400);

    // Reset click ignore flag after short delay
    setTimeout(() => { ignoreClick = false; }, 50);

    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('touchmove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);
}

// Event Listeners
switcher.addEventListener('mousedown', startDrag);
switcher.addEventListener('touchstart', startDrag, { passive: false });

// Robust Click Suppression
switcher.addEventListener('click', (e) => {
    if (isDragging || ignoreClick) {
        e.preventDefault();
        e.stopPropagation();
    }
});

// ==========================================
// GSAP handles scroll animations in script-animations.js
// ==========================================

// ==========================================
// Contact Form Submission to Google Sheets
// ==========================================

// Custom Glassy Alert Function
function showGlassyAlert(message) {
    // Remove existing overlay if any (to prevent stacking)
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'custom-modal';

    const content = document.createElement('div');
    content.className = 'custom-modal-content';
    content.innerHTML = message;

    const btn = document.createElement('button');
    btn.className = 'custom-modal-btn';
    btn.innerText = 'OK';

    // Close event
    btn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    };

    // Close on clicking outside (optional, but good UX)
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    };

    modal.appendChild(content);
    modal.appendChild(btn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

// Success Notification with checkmark icon
function showSuccessNotification(userName) {
    // Remove existing overlay if any
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'custom-modal success-modal';

    // Checkmark icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'success-icon';
    iconDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    // Title
    const title = document.createElement('h3');
    title.className = 'success-title';
    title.textContent = 'Request Received!';

    // Message
    const message = document.createElement('p');
    message.className = 'success-message';
    message.innerHTML = `Thanks <span class="highlight">${userName}</span>! We'll call you within 24 hours.`;

    // Button
    const btn = document.createElement('button');
    btn.className = 'success-btn';
    btn.textContent = 'Got It';

    // Close event
    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    };

    btn.onclick = closeModal;

    // Close on clicking outside
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    };

    modal.appendChild(iconDiv);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(btn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

const scriptURL = 'https://script.google.com/macros/s/AKfycbw31N52W_a9osfowfMOjgEsiJpGwHvBjQuAX4FSfmpptrD-aHXImaBbjI50RB2VAr44ew/exec';

const form = document.getElementById('contactForm');

if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Warning: using the spreadsheet URL directly will cause a CORS/Network error.
        // You MUST deploy the Apps Script as a Web App to get the correct 'script.google.com' URL.

        // --- Validation Start ---
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const phoneInput = form.querySelector('input[name="phone"]');

        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const phoneVal = phoneInput.value.trim();

        // 1. Name: First letter must be capital
        // We check if the first character matches [A-Z].
        // If empty, standard required check handles it (but we check empty here too to be safe)
        if (!nameVal || !/^[A-Z]/.test(nameVal)) {
            showGlassyAlert("Please enter a valid Name. The first letter must be capitalized (e.g., 'John').");
            return;
        }

        // 2. Email: Must contain "@gmail.com"
        if (!emailVal || !emailVal.toLowerCase().includes('@gmail.com')) {
            showGlassyAlert("Please enter a valid Gmail address (must contain @gmail.com).");
            return;
        }

        // 3. Phone: Must have exactly 10 digits
        if (!phoneVal || !/^\d{10}$/.test(phoneVal)) {
            showGlassyAlert("Please enter a valid Phone Number (must be exactly <span class='number-text'>10</span> digits).");
            return;
        }
        // --- Validation End ---

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        fetch(scriptURL, { method: 'POST', body: new FormData(form) })
            .then(response => {
                // If the response is not ok (e.g. 404, 500, 401), we throw an error to be caught below
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                // Show success notification with user's name
                showSuccessNotification(nameVal);
                form.reset();
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error details:', error);

                // More helpful error message for common issues
                let errorMessage = "Something went wrong. Please try again.";

                if (error.message && (error.message.includes('405') || error.message.includes('401') || error.message.includes('403') || error.message === 'Failed to fetch')) {
                    errorMessage = "Connection Error (" + error.message + ").\n\nPossible Cause: Google Script permissions.\nSolution: Redeploy as 'Web App' and set 'Who has access' to 'Anyone'.";
                } else if (error.message) {
                    errorMessage = "Error: " + error.message;
                }

                showGlassyAlert(errorMessage);
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            });
    });
}

// ==========================================
// Hero Video Modal Playback
// ==========================================

function openVideoModal(videoUrl) {
    // Remove existing overlay if any
    const existing = document.querySelector('.custom-modal-overlay');
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';

    // Create close button outside modal for better UX on mobile or top right
    const closeBtn = document.createElement('button');
    closeBtn.className = 'video-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = closeModal;

    const modal = document.createElement('div');
    modal.className = 'custom-modal video-modal';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    modal.appendChild(iframe);
    modal.appendChild(closeBtn); // Append close button to modal relative handling
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function closeModal() {
        overlay.classList.remove('active');
        // Stop video by removing iframe
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }

    // Close on clicking outside
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    };

    // Trigger animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

const heroPlayBtn = document.querySelector('.hero__play-btn');
if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
        // Play local video in modal
        openVideoModal('./images/clipo-pomo.mp4', true);
    });
}

