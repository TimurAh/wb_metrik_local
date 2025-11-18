document.addEventListener('DOMContentLoaded', () => {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Без високосного для простоты (можно добавить логику)
    // Текущая дата
    const currentDate = new Date();
    if(currentDate.getFullYear()%4 == 0){
        daysInMonth[1] = 29;
    }

    // Текущая дата (November 10, 2025)


    let startDay = currentDate.getDate();
    let startMonth = currentDate.getMonth() + 1;
    let endDay = startDay + 1;
    let endMonth = startMonth;
    let year = currentDate.getFullYear();

    const startDayCol = document.getElementById('start-day');
    const startMonthCol = document.getElementById('start-month');
    const yearCol = document.getElementById('year');
    const endDayCol = document.getElementById('end-day');
    const endMonthCol = document.getElementById('end-month');
    const output = document.getElementById('selected-range');

    // Функция для генерации элементов picker (5 видимых: prev2, prev, current, next, next2)
    function generatePickerItems(column, values, selected, isYear = false) {
        const itemsContainer = column.querySelector('.picker-items');
        itemsContainer.innerHTML = '';
        const itemHeight = 30; // Из CSS
        const visibleCount = 5; // Visible items

        // Находим индекс selected
        const selectedIndex = values.indexOf(selected);
        const startIndex = Math.max(0, selectedIndex - 2); // Начало для visible

        for (let i = startIndex; i < startIndex + visibleCount; i++) {
            const value = values[i % values.length]; // Циклический для месяцев/дней
            const item = document.createElement('div');
            item.classList.add('picker-item');
            item.textContent = value < 10 ? '0' + value : value; // 01, 02...
            if (i !== selectedIndex) item.classList.add('inactive');
            itemsContainer.appendChild(item);
        }

        // Позиционируем current в центре
        itemsContainer.style.transform = `translateY(${-(selectedIndex - startIndex) * itemHeight}px)`;
    }

    // Обновление дней в зависимости от месяца
    function getDaysForMonth(month, y) {
        let days = daysInMonth[month - 1];
        if (month === 2 && (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0))) days = 29;
        return Array.from({length: days}, (_, i) => i + 1);
    }

    // Обновление года (общий или range)
    function updateYear() {
        const yearValues = [year - 2, year - 1, year, year + 1, year + 2]; // Visible years
        generatePickerItems(yearCol, yearValues, year, true);
    }

    // Обновление всего
    function updateAll() {
        generatePickerItems(startDayCol, getDaysForMonth(startMonth, year), startDay);
        generatePickerItems(startMonthCol, months, startMonth);
        updateYear();
        generatePickerItems(endDayCol, getDaysForMonth(endMonth, year), endDay);
        generatePickerItems(endMonthCol, months, endMonth);

        // Формат вывода
        const yearDisplay = (startMonth <= endMonth) ? year : `${year}-${year + 1}`;
        output.textContent = `${startDay} ${startMonth} ${yearDisplay} ${endDay} ${endMonth}`;
    }

    // Логика скролла/выбора (для простоты используем wheel event)
    function addPickerListeners(column, valuesGetter, setter) {
        let startY = 0;
        const itemHeight = 30;

        column.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1 : -1;
            let newVal = setter() + delta;
            const values = valuesGetter();
            if (newVal < values[0]) newVal = values[values.length - 1];
            if (newVal > values[values.length - 1]) newVal = values[0];
            setter(newVal);
            validateRange();
            updateAll();
        });

        // Для тач (touchstart, touchmove)
        column.addEventListener('touchstart', (e) => startY = e.touches[0].clientY);
        column.addEventListener('touchmove', (e) => {
            const deltaY = startY - e.touches[0].clientY;
            if (Math.abs(deltaY) > itemHeight) {
                const delta = deltaY > 0 ? 1 : -1;
                let newVal = setter() + delta;
                const values = valuesGetter();
                if (newVal < values[0]) newVal = values[values.length - 1];
                if (newVal > values[values.length - 1]) newVal = values[0];
                setter(newVal);
                startY = e.touches[0].clientY;
                validateRange();
                updateAll();
            }
        });
    }

    // Валидация: end >= start
    function validateRange() {
        if (startMonth > endMonth || (startMonth === endMonth && startDay > endDay)) {
            endDay = startDay;
            endMonth = startMonth;
        }
        // Если end в следующем году, но для простоты предполагаем один год
    }

    // Инициализация слушателей
    addPickerListeners(startDayCol, () => getDaysForMonth(startMonth, year), (v) => startDay = v);
    addPickerListeners(startMonthCol, () => months, (v) => startMonth = v);
    addPickerListeners(yearCol, () => Array.from({length: 21}, (_, i) => year - 10 + i), (v) => year = v); // Исправлено: генерируем массив от year-10 до year+10
    addPickerListeners(endDayCol, () => getDaysForMonth(endMonth, year), (v) => endDay = v);
    addPickerListeners(endMonthCol, () => months, (v) => endMonth = v);

    updateAll();
});