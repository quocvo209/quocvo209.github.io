const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = mobileMenuBtn.querySelector('i');
    if (mobileMenu.classList.contains('hidden')) {
        icon.className = 'fa-solid fa-bars-staggered text-2xl';
    } else {
        icon.className = 'fa-solid fa-xmark text-2xl';
    }
});

// Tự động đóng menu khi chọn một mục điều hướng
const mobileLinks = document.querySelectorAll('.mobile-link');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars-staggered text-2xl';
    });
});


// 2. LẬP TRÌNH ĐÓNG / MỞ TRÌNH XEM VIDEO (VIDEO LIGHTBOX MODAL)
const videoModal = document.getElementById('video-modal');
const videoModalContainer = document.getElementById('video-modal-container');
const videoIframe = document.getElementById('modal-video-iframe');

function openVideoModal(videoUrl) {
    // Tự động thêm autoplay khi người dùng click vào xem
    const autoplayUrl = videoUrl.includes('?') ? `${videoUrl}&autoplay=1` : `${videoUrl}?autoplay=1`;
    videoIframe.src = autoplayUrl;
    videoModal.classList.remove('hidden');
    
    // Tạo hiệu ứng mờ nền mượt mà
    setTimeout(() => {
        videoModal.classList.remove('opacity-0');
        videoModalContainer.classList.remove('scale-95');
        videoModalContainer.classList.add('scale-100');
    }, 50);
}

function closeVideoModal() {
    videoModal.classList.add('opacity-0');
    videoModalContainer.classList.remove('scale-100');
    videoModalContainer.classList.add('scale-95');
    
    // Đợi hoạt ảnh tắt hoàn thành rồi mới tắt iframe để ngắt tiếng video hoàn toàn
    setTimeout(() => {
        videoModal.classList.add('hidden');
        videoIframe.src = ""; 
    }, 300);
}

// Cho phép bấm nút ESCAPE trên bàn phím để thoát nhanh video đang xem
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
        closeVideoModal();
    }
});


// 3. HIỆU ỨNG TĂNG SỐ SỐ LIỆU TỰ ĐỘNG (STATS COUNT UP ON SCROLL)
const counters = document.querySelectorAll('[data-val]');
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
};

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const targetVal = parseInt(counter.getAttribute('data-val'), 10);
            let currentVal = 0;
            
            const increment = Math.ceil(targetVal / 50);
            const speed = 20; // tốc độ tăng số (ms)

            const updateCount = () => {
                currentVal += increment;
                if (currentVal >= targetVal) {
                    counter.innerText = targetVal === 100 ? targetVal + '%' : targetVal + '+';
                    observer.unobserve(counter);
                } else {
                    counter.innerText = currentVal;
                    setTimeout(updateCount, speed);
                }
            };
            
            updateCount();
        }
    });
}, observerOptions);

counters.forEach(counter => {
    counterObserver.observe(counter);
});


// 4. MÔ PHỎNG PHẢN HỒI GỬI FORM THÀNH CÔNG
function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const successBox = document.getElementById('contact-success');
    
    successBox.classList.remove('hidden');
    form.reset();
    
    setTimeout(() => {
        successBox.classList.add('hidden');
    }, 6000);
}
