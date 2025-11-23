document.addEventListener("DOMContentLoaded", function () {

    // Находим все области для перетаскивания
    const allCanvases = document.querySelectorAll(".card-canvas");

    let draggedCard = null;

    // Инициализация: навешиваем события на все карточки во всех канвасах
    allCanvases.forEach(canvas => {
        const cards = canvas.querySelectorAll(".card");

        cards.forEach(element => {
            const extra_v_card = element.querySelector('.card-extra-visibility');

            element.setAttribute("draggable", true);

            element.addEventListener("dragstart", handleDragStart);
            element.addEventListener("dragover", handleDragOver);
            element.addEventListener("drop", handleDrop);
            element.addEventListener("dragend", handleDragEnd);

            // Ваши ховер-эффекты (оставил без изменений)
            element.addEventListener('mouseover', () => {
                element.classList.add('hover-card');
                if (extra_v_card) extra_v_card.classList.add('hover-active');
            });
            element.addEventListener('mouseout', () => {
                element.classList.remove('hover-card');
                if (extra_v_card) extra_v_card.classList.remove('hover-active');
            });
            element.addEventListener('click', () => {
                element.classList.toggle('active-card');
                if (extra_v_card) extra_v_card.classList.toggle('active');
            });
        });
    });

    // --- Обработчики Drag & Drop ---

    function handleDragStart(event) {
        draggedCard = this;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", "");
        this.classList.add("dragging");
    }

    function handleDragOver(event) {
        // 1. ПРОВЕРКА: Запрещаем перетаскивание, если родители разные
        // Если родитель карточки, которую тащим != родитель карточки, над которой висим
        if (draggedCard.parentNode !== this.parentNode) {
            return; // Выходим, не вызывая preventDefault. Браузер покажет курсор "запрещено".
        }

        // Если родители совпадают — разрешаем
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    function handleDrop(event) {
        event.preventDefault();

        // 2. ПРОВЕРКА: На всякий случай проверяем и здесь (защита от багов)
        if (draggedCard.parentNode !== this.parentNode) {
            return; // Ничего не делаем
        }

        if (draggedCard !== this) {
            const currentContainer = this.parentNode;
            // Превращаем в массив только детей этого контейнера
            const allCards = Array.from(currentContainer.children).filter(child => child.classList.contains('card'));

            const draggedIndex = allCards.indexOf(draggedCard);
            const targetIndex = allCards.indexOf(this);

            // Логика сортировки (работает только внутри своего списка)
            if (draggedIndex < targetIndex) {
                this.after(draggedCard);
            } else {
                this.before(draggedCard);
            }
        }
    }

    function handleDragEnd(event) {
        this.classList.remove("dragging");
        draggedCard = null;
    }
});