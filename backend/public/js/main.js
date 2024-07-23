// 회원가입 전화번호 입력칸
function oninputPhone(target) {
    target.value = target.value
        .replace(/[^0-9]/g, '')
        .replace(/(^02.{0}|^01.{1}|[0-9]{3,4})([0-9]{3,4})([0-9]{4})/g, "$1-$2-$3");
}

// 이미지 배너
const navbar = document.querySelector("#navbar");

let lastScrollTop = 0;

window.addEventListener(
    "scroll",
    () => {
        var {pageYOffset} = window;
        if(pageYOffset > lastScrollTop) {
            navbar.classList.remove("visible");
        }
        lastScrollTop =
        pageYOffset <= 0 ? 0 : pageYOffset
    },
    {passive : true }
);

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Loaded');
});

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.banner-image');
    let currentIndex = 0;

    function showNextImage() {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }

    setInterval(showNextImage, 3000);
});