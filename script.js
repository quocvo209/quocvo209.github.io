// Sample portfolio data - UPDATE WITH YOUR OWN CONTENT
const portfolioData = {
    videos: [
        { id: 1, title: 'TỦ LẠNH LG', description: 'Mô tả video của bạn', file: 'videos/TỦ LẠNH LG.mp4' },
        { id: 2, title: 'Video 2', description: 'Mô tả video của bạn', file: 'videos/video2.mp4' },
        { id: 3, title: 'Video 3', description: 'Mô tả video của bạn', file: 'videos/video3.mp4' },
        { id: 4, title: 'Video 4', description: 'Mô tả video của bạn', file: 'videos/video4.mp4' },
        { id: 5, title: 'Video 5', description: 'Mô tả video của bạn', file: 'videos/video5.mp4' },
        { id: 6, title: 'Video 6', description: 'Mô tả video của bạn', file: 'videos/video6.mp4' },
        { id: 7, title: 'Video 7', description: 'Mô tả video của bạn', file: 'videos/video7.mp4' },
        { id: 8, title: 'Video 8', description: 'Mô tả video của bạn', file: 'videos/video8.mp4' },
        { id: 9, title: 'Video 9', description: 'Mô tả video của bạn', file: 'videos/video9.mp4' },
        { id: 10, title: 'Video 10', description: 'Mô tả video của bạn', file: 'videos/video10.mp4' },
        { id: 11, title: 'Video 11', description: 'Mô tả video của bạn', file: 'videos/video11.mp4' },
        { id: 12, title: 'Video 12', description: 'Mô tả video của bạn', file: 'videos/video12.mp4' },
        { id: 13, title: 'Video 13', description: 'Mô tả video của bạn', file: 'videos/video13.mp4' },
        { id: 14, title: 'Video 14', description: 'Mô tả video của bạn', file: 'videos/video14.mp4' },
        { id: 15, title: 'Video 15', description: 'Mô tả video của bạn', file: 'videos/video15.mp4' },
        { id: 16, title: 'Video 16', description: 'Mô tả video của bạn', file: 'videos/video16.mp4' },
        { id: 17, title: 'Video 17', description: 'Mô tả video của bạn', file: 'videos/video17.mp4' },
        { id: 18, title: 'Video 18', description: 'Mô tả video của bạn', file: 'videos/video18.mp4' },
        { id: 19, title: 'Video 19', description: 'Mô tả video của bạn', file: 'videos/video19.mp4' },
        { id: 20, title: 'Video 20', description: 'Mô tả video của bạn', file: 'videos/video20.mp4' },
        { id: 21, title: 'Video 21', description: 'Mô tả video của bạn', file: 'videos/video21.mp4' },
        { id: 22, title: 'Video 22', description: 'Mô tả video của bạn', file: 'videos/video22.mp4' },
        { id: 23, title: 'Video 23', description: 'Mô tả video của bạn', file: 'videos/video23.mp4' },
        { id: 24, title: 'Video 24', description: 'Mô tả video của bạn', file: 'videos/video24.mp4' },
        { id: 25, title: 'Video 25', description: 'Mô tả video của bạn', file: 'videos/video25.mp4' },
        { id: 26, title: 'Video 26', description: 'Mô tả video của bạn', file: 'videos/video26.mp4' },
        { id: 27, title: 'Video 27', description: 'Mô tả video của bạn', file: 'videos/video27.mp4' },
        { id: 28, title: 'Video 28', description: 'Mô tả video của bạn', file: 'videos/video28.mp4' },
        { id: 29, title: 'Video 29', description: 'Mô tả video của bạn', file: 'videos/video29.mp4' },
        { id: 30, title: 'Video 30', description: 'Mô tả video của bạn', file: 'videos/video30.mp4' },
    ],
    designs: [
        { id: 1, title: 'Design 1', description: 'Mô tả thiết kế của bạn', image: 'designs/design1.jpg' },
        { id: 2, title: 'Design 2', description: 'Mô tả thiết kế của bạn', image: 'designs/design2.jpg' },
        { id: 3, title: 'Design 3', description: 'Mô tả thiết kế của bạn', image: 'designs/design3.jpg' },
        { id: 4, title: 'Design 4', description: 'Mô tả thiết kế của bạn', image: 'designs/design4.jpg' },
        { id: 5, title: 'Design 5', description: 'Mô tả thiết kế của bạn', image: 'designs/design5.jpg' },
        { id: 6, title: 'Design 6', description: 'Mô tả thiết kế của bạn', image: 'designs/design6.jpg' },
    ]
};

// Load portfolio items
function loadPortfolio() {
    loadVideos();
    loadDesigns();
}

function loadVideos() {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';
    
    portfolioData.videos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <div class="portfolio-thumbnail" style="position: relative;">
                <video style="width: 100%; height: 100%; object-fit: cover;">
                    <source src="${video.file}" type="video/mp4">
                </video>
                <div class="portfolio-play-btn">▶</div>
            </div>
            <div class="portfolio-info">
                <h3 class="portfolio-title">${video.title}</h3>
                <p class="portfolio-description">${video.description}</p>
            </div>
        `;
        
        item.addEventListener('click', () => openVideoModal(video.file));
        videoGrid.appendChild(item);
    });
}

function loadDesigns() {
    const designGrid = document.getElementById('designGrid');
    designGrid.innerHTML = '';
    
    portfolioData.designs.forEach(design => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <div class="portfolio-thumbnail">
                <img src="${design.image}" alt="${design.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="portfolio-info">
                <h3 class="portfolio-title">${design.title}</h3>
                <p class="portfolio-description">${design.description}</p>
            </div>
        `;
        
        item.addEventListener('click', () => openImageModal(design.image));
        designGrid.appendChild(item);
    });
}

// Modal functions
function openVideoModal(videoSrc) {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    video.src = videoSrc;
    modal.style.display = 'block';
}

function openImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const image = document.getElementById('modalImage');
    image.src = imageSrc;
    modal.style.display = 'block';
}

// Close modal
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    const videoModal = document.getElementById('videoModal');
    const imageModal = document.getElementById('imageModal');
    
    if (e.target === videoModal) {
        videoModal.style.display = 'none';
    }
    if (e.target === imageModal) {
        imageModal.style.display = 'none';
    }
});

// Tab switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
});
