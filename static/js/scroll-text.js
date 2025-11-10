document.addEventListener("DOMContentLoaded", function () {
    const text_spins = document.querySelectorAll(".text-over-spin");
    text_spins.forEach(element => {
         if (element.scrollWidth -1 > element.parentElement.clientWidth) {
            element.classList.add('scrollable');
            element.classList.add('is-scrolling');
        element.classList.add('is-scrolling');
        element.addEventListener('mouseover', () => {
            element.classList.add('is-scrolling');
        });
            element.addEventListener('animationend', (event) => {
                element.classList.remove('is-scrolling');
            });
        }

    })
});