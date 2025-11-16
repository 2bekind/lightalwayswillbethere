// Unique visitor counter (1 person = 1 view)
function getUniqueVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        // Generate unique ID based on timestamp and random number
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
}

function countUniqueVisitor() {
    const visitorId = getUniqueVisitorId();
    const countedVisitors = JSON.parse(localStorage.getItem('countedVisitors') || '[]');
    
    // Check if this visitor was already counted
    if (!countedVisitors.includes(visitorId)) {
        countedVisitors.push(visitorId);
        localStorage.setItem('countedVisitors', JSON.stringify(countedVisitors));
    }
    
    // Get total unique views
    const totalViews = countedVisitors.length;
    
    // Update counter in activity card
    const activityViewsElement = document.getElementById('activity-views');
    
    if (activityViewsElement) {
        activityViewsElement.textContent = totalViews;
    }
}

// Count visitor when page loads (after DOM is ready)
document.addEventListener('DOMContentLoaded', function() {
    countUniqueVisitor();
});

// Check if profile image exists, if not show placeholder
const profileImg = document.getElementById('profile-img');
const activityImg = document.querySelector('.activity-img');

function checkImage(img, fallback) {
    img.onerror = function() {
        this.style.display = 'none';
    };
    img.onload = function() {
        this.style.display = 'block';
    };
}

if (profileImg) {
    checkImage(profileImg);
}

if (activityImg) {
    checkImage(activityImg);
}

// Add some subtle animations
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.profile-picture, .username, .location, .description');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate activity card separately
    const activityCard = document.querySelector('.activity-card');
    if (activityCard) {
        activityCard.style.opacity = '0';
        activityCard.style.transform = 'translateY(20px)';
        setTimeout(() => {
            activityCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            activityCard.style.opacity = '1';
            activityCard.style.transform = 'translateY(0)';
            
            // Initialize parallax after animation completes
            setTimeout(() => {
                initActivityCardParallax(activityCard);
            }, 600);
        }, 400);
    }
    
    // Initialize parallax for profile picture
    const profilePicture = document.getElementById('profile-picture');
    if (profilePicture) {
        profilePicture.style.opacity = '0';
        profilePicture.style.transform = 'translateY(20px)';
        setTimeout(() => {
            profilePicture.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            profilePicture.style.opacity = '1';
            profilePicture.style.transform = 'translateY(0)';
            
            // Initialize parallax after animation completes
            setTimeout(() => {
                initParallaxEffect(profilePicture, false);
            }, 600);
        }, 0);
    }
});

// Parallax tilt effect with dynamic lighting and jelly effect
function initParallaxEffect(element, isCard = false) {
    const maxTilt = isCard ? 15 : 10; // Different tilt for card and avatar
    const perspective = 1000;
    const lightOverlay = element.querySelector('.light-overlay');
    let isPressed = false;
    let grabPoint = { x: 0, y: 0 }; // Point where mouse was pressed
    let initialRect = null;
    
    // Function to reset element with jelly bounce effect
    function resetElement() {
        if (!isPressed) return;
        isPressed = false;
        element.classList.remove('jelly-active');
        
        // Bounce back with jelly effect
        element.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        element.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0) scale3d(1, 1, 1) translate3d(0, 0, 0)`;
    }
    
    // Function to handle mouse move while dragging
    function handleDrag(e) {
        if (!isPressed) return;
        
        // Calculate distance from grab point to current mouse position
        const deltaX = e.clientX - grabPoint.x;
        const deltaY = e.clientY - grabPoint.y;
        
        // Simple translation - just follow the mouse
        const translateX = deltaX;
        const translateY = deltaY;
        
        // Apply transform - only translation, no stretch
        element.style.transition = 'transform 0.05s ease-out';
        element.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0) scale3d(1, 1, 1) translate3d(${translateX}px, ${translateY}px, 0)`;
    }
    
    // Drag effect - grab and drag (only for cards, not for avatars)
    if (isCard) {
        element.addEventListener('mousedown', function(e) {
            e.preventDefault();
            isPressed = true;
            element.classList.add('jelly-active');
            
            const rect = element.getBoundingClientRect();
            initialRect = rect;
            
            // Store grab point (where mouse was pressed relative to element)
            grabPoint.x = e.clientX;
            grabPoint.y = e.clientY;
            
            // Add global mousemove and mouseup listeners
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', function releaseHandler() {
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', releaseHandler);
                resetElement();
            }, { once: true });
        });
    }
    
    // Jelly effect - bounce back on mouseup (local, only for cards)
    if (isCard) {
        element.addEventListener('mouseup', resetElement);
    }
    
    // Handle mouse leave while pressed
    element.addEventListener('mouseleave', function() {
        if (!isPressed) {
            element.style.transition = 'transform 0.3s ease-out';
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            
            if (lightOverlay) {
                lightOverlay.style.setProperty('--light-x', '50%');
                lightOverlay.style.setProperty('--light-y', '50%');
            }
        }
    });
    
    element.addEventListener('mousemove', function(e) {
        if (isPressed) return; // Don't update parallax while pressed
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // Calculate tilt
        const rotateX = (mouseY / rect.height) * maxTilt;
        const rotateY = -(mouseX / rect.width) * maxTilt;
        
        // Calculate light position (0-100% for CSS)
        const lightX = ((e.clientX - rect.left) / rect.width) * 100;
        const lightY = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Apply transform
        element.style.transition = 'transform 0.1s ease-out';
        element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Update light position
        if (lightOverlay) {
            lightOverlay.style.setProperty('--light-x', lightX + '%');
            lightOverlay.style.setProperty('--light-y', lightY + '%');
        }
    });
}

// Parallax tilt effect for activity card
function initActivityCardParallax(activityCard) {
    initParallaxEffect(activityCard, true);
}

// Discord button copy functionality
document.addEventListener('DOMContentLoaded', function() {
    const discordButton = document.getElementById('discord-button');
    const notification = document.getElementById('notification');
    const discordNickname = '2bekind.';
    
    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification();
            }).catch(err => {
                console.error('Failed to copy:', err);
                // Fallback method
                fallbackCopyToClipboard(text);
            });
        } else {
            // Fallback for older browsers
            fallbackCopyToClipboard(text);
        }
    }
    
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification();
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    if (discordButton) {
        discordButton.addEventListener('click', function() {
            copyToClipboard(discordNickname);
        });
    }
});

