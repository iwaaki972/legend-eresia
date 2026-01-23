// Scroll Animation Observer
document.addEventListener('DOMContentLoaded', function() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                // Don't unobserve so animations can repeat if element leaves and re-enters
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-up');
    animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });

    // Mouse move parallax effect on hero
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image');
    const particles = document.querySelectorAll('.particle');
    const orbs = document.querySelectorAll('.orb');

    hero.addEventListener('mousemove', function(e) {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Move hero image with mouse
        if (heroImage) {
            heroImage.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        }

        // Move particles
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 10;
            particle.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });

        // Move orbs
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 15;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // Reset transforms when mouse leaves
    hero.addEventListener('mouseleave', function() {
        if (heroImage) {
            heroImage.style.transform = '';
        }
        particles.forEach(particle => {
            particle.style.transform = '';
        });
        orbs.forEach(orb => {
            orb.style.transform = '';
        });
    });

    // Add magical trail effect on mouse move
    let lastTrailTime = 0;
    const trailDelay = 50; // milliseconds

    document.addEventListener('mousemove', function(e) {
        const now = Date.now();
        if (now - lastTrailTime < trailDelay) return;
        lastTrailTime = now;

        // Create magical trail
        const trail = document.createElement('div');
        trail.className = 'magic-trail';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        document.body.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, 1000);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add button click effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .magic-trail {
        position: fixed;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, rgba(147, 51, 234, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        animation: trail-fade 1s ease-out forwards;
    }

    @keyframes trail-fade {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
        }
    }
`;
document.head.appendChild(style);