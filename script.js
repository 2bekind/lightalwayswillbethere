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
    
    // Rating system
    const rateButton = document.getElementById('rate-button');
    const ratingModal = document.getElementById('rating-modal');
    const modalClose = document.getElementById('modal-close');
    const starsInput = document.getElementById('stars-input');
    const stars = starsInput.querySelectorAll('.star');
    const ratingValue = document.getElementById('rating-value');
    const commentName = document.getElementById('comment-name');
    const commentText = document.getElementById('comment-text');
    const submitButton = document.getElementById('submit-rating');
    const starsDisplay = document.getElementById('stars-display');
    const commentsList = document.getElementById('comments-list');
    
    let selectedRating = 0;
    
    // Load comments and rating from localStorage
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('profileComments') || '[]');
        return comments;
    }
    
    function saveComment(rating, comment, author) {
        const comments = loadComments();
        comments.push({
            rating: rating,
            comment: comment,
            author: author || 'Anonim',
            date: new Date().toISOString()
        });
        localStorage.setItem('profileComments', JSON.stringify(comments));
    }
    
    function calculateAverageRating() {
        const comments = loadComments();
        if (comments.length === 0) return 0;
        const sum = comments.reduce((acc, c) => acc + c.rating, 0);
        return (sum / comments.length).toFixed(1);
    }
    
    function displayRating() {
        const avgRating = parseFloat(calculateAverageRating());
        if (avgRating > 0) {
            // Round to nearest 0.5 for display
            const roundedRating = Math.round(avgRating * 2) / 2;
            const fullStars = Math.floor(roundedRating);
            const hasHalfStar = roundedRating % 1 >= 0.5;
            let starsHTML = '';
            for (let i = 0; i < fullStars; i++) {
                starsHTML += '⭐';
            }
            if (hasHalfStar && fullStars < 5) {
                starsHTML += '⭐';
            }
            starsDisplay.textContent = starsHTML || '—';
        } else {
            starsDisplay.textContent = '—';
        }
    }
    
    function displayComments() {
        const comments = loadComments();
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No comments yet</div>';
            return;
        }
        
        // Show newest first
        comments.reverse().forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            
            const starsHTML = '⭐'.repeat(comment.rating);
            
            commentItem.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-rating">${starsHTML}</span>
                </div>
                <div class="comment-text">${comment.comment || 'No comment'}</div>
            `;
            
            commentsList.appendChild(commentItem);
        });
    }
    
    // Star selection
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            ratingValue.textContent = selectedRating;
            
            stars.forEach((s, i) => {
                if (i < selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.dataset.rating);
            stars.forEach((s, i) => {
                if (i < hoverRating) {
                    s.style.filter = 'grayscale(0%) brightness(1)';
                } else {
                    s.style.filter = 'grayscale(100%) brightness(0.5)';
                }
            });
        });
    });
    
    starsInput.addEventListener('mouseleave', function() {
        stars.forEach((s, i) => {
            if (i < selectedRating) {
                s.style.filter = 'grayscale(0%) brightness(1)';
            } else {
                s.style.filter = 'grayscale(100%) brightness(0.5)';
            }
        });
    });
    
    // Open modal
    if (rateButton) {
        rateButton.addEventListener('click', function() {
            ratingModal.classList.add('show');
            selectedRating = 0;
            ratingValue.textContent = '0';
            commentName.value = '';
            commentText.value = '';
            stars.forEach(s => s.classList.remove('active'));
        });
    }
    
    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            ratingModal.classList.remove('show');
        });
    }
    
    // Close modal on overlay click
    if (ratingModal) {
        ratingModal.addEventListener('click', function(e) {
            if (e.target === ratingModal) {
                ratingModal.classList.remove('show');
            }
        });
    }
    
    // Submit rating
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            if (selectedRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            const comment = commentText.value.trim();
            const author = commentName.value.trim();
            saveComment(selectedRating, comment, author);
            displayRating();
            displayComments();
            
            ratingModal.classList.remove('show');
            notification.textContent = 'Review added!';
            showNotification();
            
            // Reset form
            selectedRating = 0;
            ratingValue.textContent = '0';
            commentName.value = '';
            commentText.value = '';
            stars.forEach(s => s.classList.remove('active'));
        });
    }
    
    // Initial load
    displayRating();
    displayComments();
});

