// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Modal functionality
const modal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const closeBtn = document.querySelector('.close');

// Open modal
function openVideoModal(videoSrc) {
    modalVideo.src = videoSrc;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    modalVideo.src = '';
    document.body.style.overflow = 'auto';
}

closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Video categories and loading (optional - for future video loading)
const videoFolders = {
    social: 'videos/social',
    tvc: 'videos/tvc',
    reel: 'videos/reel',
    ads: 'videos/ads'
};

// Load videos from GitHub if structure exists
async function loadVideos() {
    try {
        const categories = ['social', 'tvc', 'reel', 'ads'];
        
        for (const category of categories) {
            const videos = await getVideosFromFolder(category);
            // Optionally display them
        }
    } catch (error) {
        console.log('Videos loading optional feature:', error);
    }
}

async function getVideosFromFolder(category) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/quocvo209/quocvo209.github.io/contents/videos/${category}`
        );
        
        if (!response.ok) {
            return [];
        }
        
        const files = await response.json();
        return files
            .filter(file => /\.(mp4|webm|mov)$/i.test(file.name))
            .map(file => ({
                name: file.name,
                url: `videos/${category}/${file.name}`,
                size: formatFileSize(file.size)
            }));
    } catch (error) {
        return [];
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to work cards
    const workCards = document.querySelectorAll('.work-card, .category-card');
    
    workCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Placeholder for future video modal functionality
            // openVideoModal('video-url-here');
        });
    });
    
    // Add smooth hover effects
    const hoverElements = document.querySelectorAll('.media-placeholder, .media-placeholder-large, .media-placeholder-small');
    hoverElements.forEach(element => {
        element.addEventListener('click', function() {
            // Future: open video modal
        });
    });
    
    // Optional: load videos
    // loadVideos();
});
