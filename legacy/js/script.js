document.addEventListener('DOMContentLoaded', function() {
    // Function to enable smooth scrolling
    function enableSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const offset = targetSection.offsetTop - document.getElementById('banner').offsetHeight;
                    window.scrollTo({
                        top: offset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Function to highlight the current section in the navigation bar
    function highlightCurrentSection() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', function() {
            let current = 'home'; // Default to 'home'

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - sectionHeight / 3) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Enable smooth scrolling for all links with href starting with #
    enableSmoothScrolling();

    // Highlight the current section in the navigation bar
    highlightCurrentSection();
});

//function to link out in a new tab
document.addEventListener('DOMContentLoaded', function() {
    // Select all anchor elements with href starting with "https://"
    const externalLinks = document.querySelectorAll('a[href^="https://"]');

    // Add target="_blank" to each external link
    externalLinks.forEach(link => {
        link.setAttribute('target', '_blank');
    });
});

// Function to show the image in a modal
function showImage(img) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    modal.style.display = 'block';
    modalImg.src = img.src;

    // Add event listener to close the modal when clicking outside the image
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';

    // Remove the event listener to prevent multiple bindings
    modal.removeEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// document.addEventListener('DOMContentLoaded', function() {
//     // Function to query the screen display resolution
//     function getScreenResolution() {
//         const screenWidth = window.screen.width;
//         const screenHeight = window.screen.height;
//         console.log(`Screen Resolution: ${screenWidth}x${screenHeight}`);
//         return { width: screenWidth, height: screenHeight };
//     }

//     // Function to scale the page if the resolution is below 4K
//     function scalePageIfNeeded() {
//         const resolution = getScreenResolution();
//         if (resolution.width < 3840 || resolution.height < 2160) {
//             document.body.style.transform = 'scale(0.8)';
//             document.body.style.transformOrigin = 'top center';
//         }
//     }

//     // Call the function to scale the page if needed
//     scalePageIfNeeded();
// });