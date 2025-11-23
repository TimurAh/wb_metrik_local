document.addEventListener("DOMContentLoaded", function () {

    const cardCanvas = document.querySelector(".card-canvas");
    const cards = cardCanvas.querySelectorAll(".card");

    let draggedCard = null;

    cards.forEach(element => {
        const extra_v_card = element.querySelector('.card-extra-visibility')
        const info_icon = element.querySelector('.info-item')
        const question_icon = element.querySelector('.question-item')

        element.setAttribute("draggable", true);
        element.addEventListener("dragstart", handleDragStart);
        element.addEventListener("dragover", handleDragOver);
        element.addEventListener("drop", handleDrop);
        element.addEventListener("dragend", handleDragEnd); // Опционально, для cleanup

        element.addEventListener('mouseover', () => {
            element.classList.add('hover-card');
            extra_v_card.classList.add('hover-active');
        });
        element.addEventListener('mouseout', () => {
            element.classList.remove('hover-card');
            extra_v_card.classList.remove('hover-active');
        });
        element.addEventListener('click', () => {
            element.classList.toggle('active-card');
            extra_v_card.classList.toggle('active');
        });


        function handleDragStart(event) {
            draggedCard = this; // Запоминаем dragged карточку
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", ""); // Нужно для Firefox
            this.classList.add("dragging"); // Добавь CSS класс для стиля (e.g., opacity: 0.5)
        }

        function handleDragOver(event) {
            event.preventDefault(); // Разрешаем drop
            event.dataTransfer.dropEffect = "move";
        }

        function handleDrop(event) {
            event.preventDefault();
            if (draggedCard !== this) {
                // Меняем местами в DOM
                const allCards = Array.from(cardCanvas.children);
                const draggedIndex = allCards.indexOf(draggedCard);
                const targetIndex = allCards.indexOf(this);

                if (draggedIndex < targetIndex) {
                    this.after(draggedCard); // Вставляем dragged после target
                } else {
                    this.before(draggedCard); // Вставляем dragged перед target
                }
            }
        }

        function handleDragEnd(event) {
            this.classList.remove("dragging");
            draggedCard = null;
        }

        //код для активирования карточки



    })
});

