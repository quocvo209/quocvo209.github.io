// Video categories folders
const videoFolders = {
    social: 'videos/social',
    tvc: 'videos/tvc',
    reel: 'videos/reel',
    ads: 'videos/ads'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});

// Load videos from folder (simulated - will scan folder structure)
async function loadVideos() {
    // For GitHub Pages, we'll create a manual list
    // You can also use GitHub API to fetch folder contents
    
    const socialVideos = await getVideosFromFolder('social');
    const tvcVideos = await getVideosFromFolder('tvc');
    const reelVideos = await getVideosFromFolder('reel');
    const adsVideos = await getVideosFromFolder('ads');
    
    displayVideos('social', socialVideos);
    displayVideos('tvc', tvcVideos);
    displayVideos('reel', reelVideos);
    displayVideos('ads', adsVideos);
}

// Get videos from folder using GitHub API
async function getVideosFromFolder(category) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/quocvo209/quocvo209.github.io/contents/videos/${category}`
        );
        
        if (!response.ok) {
            console.log(`Folder videos/${category} not found`);
            return [];
        }
        
        const files = await response.json();
        
        // Filter only video files
        return files
            .filter(file => /\.(mp4|webm|mov)$/i.test(file.name))
            .map(file => ({
                name: file.name,
                url: `videos/${category}/${file.name}`,
                size: formatFileSize(file.size)
            }));
    } catch (error) {
        console.log(`Error loading ${category} videos:`, error);
        return [];
    }
}

// Display videos in grid
function displayVideos(category, videos) {
    const gridId = `${category}Grid`;
    const grid = document.getElementById(gridId);
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (videos.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>Chưa có videos trong danh mục này</p></div>';
        return;
    }
    
    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `
            <div class="video-thumbnail">
                <video>
                    <source src="${video.url}" type="video/mp4">
                </video>
                <div class="video-play-btn">▶</div>
            </div>
            <div class="video-info">
                <div class="video-filename">${video.name}</div>
                <div class="video-size">${video.size}</div>
            </div>
        `;
        
        item.addEventListener('click', () => openVideoModal(video.url));
        grid.appendChild(item);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Modal functions
function openVideoModal(videoSrc) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    video.src = videoSrc;
    modal.style.display = 'block';
}

// Close modal
const closeBtn = document.querySelector('.close');
closeBtn.addEventListener('click', () => {
    document.getElementById('videoModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('videoModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Remove active class
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            
            // Update active nav link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
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
