// === Хелперы (вне класса) ===
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year, month) {
    return new Date(year, month, 1).getDay();
}

function getPreviousMonthYear(year, month) {
    return month === 0 ? {year: year - 1, month: 11} : {year, month: month - 1};
}

function getNextMonthYear(year, month) {
    return month === 11 ? {year: year + 1, month: 0} : {year, month: month + 1};
}

// === Основной класс ===
class DatePicker {
    constructor(options = {}) {
        this.rangeSeparator = options.rangeSeparator || ' - ';
        this.element = options.element || null;
        this.rangeStart = options.rangeStart;
        this.rangeEnd = options.rangeEnd;
        const today = new Date();
        this.currentYear = today.getFullYear();
        this.currentMonth = today.getMonth();
        this.autoSetDay = options.autoSetDay || true;
        this.selectedDate = null;
        this.container = null;
        this.active_range = 3;
        this.mode = options.mode || 'single'; // 'single' или 'range'
        this.endActiveRange = options.endActiveRange || new Date(); //  последняя активная дата
        this.rangeLength = options.rangeLength;
        this.initialScroll = options.initialScroll;
        this.options = {
            weekStart: 1,
            formatDate: (date) => date.toLocaleDateString('ru-RU'),
            initialScroll: 'bottom',
            autoSetDay: true,
            rangeStart: null,
            rangeEnd: null,
            rangeLength: 0,
            ...options
        };

        // Стрелочные функции — this всегда правильный
        this.open = () => this._open();
        this.close = () => this._close();
        this.render = () => this._render();
        this.setDate = (date) => this._setDate(date);
        this.update = () => this._update()


        if (this.element) {
            this.element.addEventListener('click', this.open);
            this.element.readOnly = true;
        }
        if (this.options.autoSetDay) {
            if (this.mode === "range") {
                this.rangeEnd = new Date();
                this.rangeStart = new Date();
                this.rangeStart.setDate(this.rangeStart.getDate() - 6);
            } else {
                this.selectedDate = new Date();
            }
            this.element.value = this._formatOutput();
            this._render();
            this._close();
        } else {
            this.element.value = this._formatOutput();
            this._render();
            this._close();
        }
    }

    // === Приватные методы ===
    _open() {
        if (this.container) return;
        this._render();
        setTimeout(() => {
            if (!this.container) return;

            const scrollWrapper = this.container.querySelector('.flatpickr-clone-wrapper');
            if (scrollWrapper) {
                // Прокручиваем в самый низ
                const initialScroll = this.options.initialScroll;

                if (initialScroll === 'bottom') {
                    // Прокручиваем в самый низ
                    scrollWrapper.scrollTop = scrollWrapper.scrollHeight;

                } else if (initialScroll === 'top') {
                    // Оставляем наверху (по умолчанию)
                    scrollWrapper.scrollTop = 0;

                } else if (typeof initialScroll === 'number') {
                    // Устанавливаем кастомное значение в пикселях
                    scrollWrapper.scrollTop = initialScroll;
                }
            }
        }, 0);
    }

    _close() {
        if (!this.container) return;

        this.container.removeEventListener('mouseenter', this._handleMouseEnter);
        this.container.removeEventListener('mousemove', this._handleMouseMove);
        this.container.removeEventListener('mouseleave', this._handleMouseLeave);

        this.container.remove();
        this.container = null;
        const closeDatepickerEvent = new CustomEvent('closeDatepickerEvent', {
            detail: {          // ← сюда пихаем ВСЁ, что нужно передать
                id: this.element.id,
                mode: this.mode,
                selectedDate: this.selectedDate,
                rangeStart: this.rangeStart,
                rangeEnd: this.rangeEnd
            },
            bubbles: true,     // ← ОБЯЗАТЕЛЬНО true, если хочешь, чтобы событие всплывало (99% случаев)
            cancelable: true,  // ← если хочешь иметь возможность event.preventDefault()
            composed: true     // ← для Shadow DOM, если используешь веб-компоненты
        });
        this.element.dispatchEvent(closeDatepickerEvent);
        document.removeEventListener('click', this._handleOutsideClick);
    }

    _setDate(date) {
        this.selectedDate = date;
        if (this.element) {
            this.element.value = this.options.formatDate(date);
        }
        this._render();
        this.close();
    }

    _handleMouseEnter = (e) => {
        if (this.mode !== 'range' || !this.rangeStart || this.rangeEnd) return;
        this._updateHover(e);
    };

    _handleMouseMove = (e) => {
        if (this.mode !== 'range' || !this.rangeStart || this.rangeEnd) return;
        this._updateHover(e);
    };

    _handleMouseLeave = () => {
        if (this.mode !== 'range' || !this.rangeStart || this.rangeEnd) return;
        this.container.querySelectorAll('.hover-range, .hover-range-end').forEach(el => {
            el.classList.remove('hover-range', 'hover-range-end');
        });
    };

    _updateHover = (e) => {


        const dayEl = e.target.closest('.flatpickr-day');

        if (!dayEl) return;

        const hoverDate = new Date(dayEl.dataset.date);

        // Убираем старый hover
        this.container.querySelectorAll('.hover-range, .hover-range-end').forEach(el => {
            el.classList.remove('hover-range', 'hover-range-end');
        });

        // Подсвечиваем диапазон
        const [start, end] = this.rangeStart < hoverDate
            ? [this.rangeStart, hoverDate]
            : [hoverDate, this.rangeStart];

        this.container.querySelectorAll('.flatpickr-day').forEach(day => {
            const d = new Date(day.dataset.date);
            if (d >= start && d <= end) {
                day.classList.add('hover-range');
                if (d.toDateString() === hoverDate.toDateString()) {
                    day.classList.add('hover-range-end');
                }
            }
        });
    };
    // _navigateMonth(direction) {
    //     let newMonth = this.currentMonth + direction;
    //     let newYear = this.currentYear;
    //
    //     if (newMonth > 11) {
    //         newMonth = 0;
    //         newYear++;
    //     } else if (newMonth < 0) {
    //         newMonth = 11;
    //         newYear--;
    //     }
    //
    //     this.currentMonth = newMonth;
    //     this.currentYear = newYear;
    //     this._render();
    // }

    _handleOutsideClick = (e) => {
        if (this.container && !this.container.contains(e.target) && e.target !== this.element) {
            if (this.rangeEnd === null) {
                this.rangeStart = null;
            }
            this.close();
        }
    };

    _formatOutput() {
        if (this.mode === 'range' && this.rangeStart && this.rangeEnd) {
            this.element.dataset.dateStart = this.rangeStart;
            this.element.dataset.dateEnd = this.rangeEnd;
            return `${this.options.formatDate(this.rangeStart)} ${this.rangeSeparator} ${this.options.formatDate(this.rangeEnd)}`;
        }
        this.element.dataset.date = this.selectedDate;
        return this.selectedDate ? this.options.formatDate(this.selectedDate) : '';
    }

    _render() {
        document.removeEventListener('click', this._handleOutsideClick);
        if (this.container) {
            this.container.removeEventListener('mouseover', this._handleMouseOver);
            this.container.removeEventListener('mouseout', this._handleMouseOut);
        }
        if (this.container) {
            this.container.remove();
            this.container = null;
        }

        const year = this.currentYear;
        const month = this.currentMonth;

        const daysInMonth = getDaysInMonth(year, month);
        let firstWeekday = getFirstWeekday(year, month);

        if (this.options.weekStart === 1) {
            firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;
        }

        // === Дни предыдущего месяца ===
        const {year: prevYear, month: prevMonth} = getPreviousMonthYear(year, month);
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
        const prevMonthDays = Array.from({length: firstWeekday}, (_, i) => ({
            day: daysInPrevMonth - firstWeekday + i + 1,
            year: prevYear,
            month: prevMonth,
            isCurrentMonth: false
        }));


        let month_for_out = Array.from({length: this.active_range}, () => new Map()); // 0 - год, 1 - месяц
        month_for_out[this.active_range - 1].set("month", month);
        month_for_out[this.active_range - 1].set("year", year)
        month_for_out[this.active_range - 1].set("countDay", getDaysInMonth(month_for_out[this.active_range - 1].get("year"), month_for_out[this.active_range - 1].get("month")))
        month_for_out[this.active_range - 1].set("firstWeekday", firstWeekday)

        const currentMonthDays_for_out = Array.from({length: month_for_out[this.active_range - 1].get("countDay")}, (_, i) => {
            const date = new Date(year, month, i + 1);
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = date.getDay() === 6 || date.getDay() === 0;
            let isSelected = false;
            let isActive = true;
            if (this.endActiveRange < date) {
                isActive = false;
            }
            if (this.mode === "range") {
                isSelected = (date >= this.rangeStart - 1 * 24 * 60 * 60 * 1000) && (date < this.rangeEnd)

            } else {
                isSelected = this.selectedDate && date === this.selectedDate;
            }

            return {
                day_in_week: date.getDay(),
                day: i + 1,
                month,
                year,
                isCurrentMonth: true,
                isWeekend,
                isToday,
                isActive,
                isSelected
            };
        });

        month_for_out[this.active_range - 1].set("dayForOut", currentMonthDays_for_out);
        for (let out_month = 0; out_month < this.active_range - 1; out_month++) {
            let index = month_for_out.length - 2 - out_month;
            const {
                year: prevYear_for_out,
                month: prevMonth_for_out
            } = getPreviousMonthYear(month_for_out[index + 1].get("year"), month_for_out[index + 1].get("month"));
            month_for_out[index].set("month", prevMonth_for_out);
            month_for_out[index].set("year", prevYear_for_out);
            month_for_out[index].set("countDay", getDaysInMonth(prevYear_for_out, prevMonth_for_out));
            month_for_out[index].set("firstWeekday", getFirstWeekday(prevYear_for_out, prevMonth_for_out))

            //заполняем дни для вывода
            const currentMonthDays_for_out = Array.from({length: month_for_out[index].get("countDay")}, (_, i) => {
                const date = new Date(prevYear_for_out, prevMonth_for_out, i + 1);
                const isToday = date.toDateString() === new Date().toDateString();
                let isSelected = false;
                let isActive = true;
                if (this.endActiveRange < date) {
                    isActive = false;
                }
                if (this.mode === "range") {
                    isSelected = (date >= this.rangeStart - 1 * 24 * 60 * 60 * 1000) && (date < this.rangeEnd)

                } else {
                    isSelected = this.selectedDate && date === this.selectedDate;
                }
                const isWeekend = date.getDay() === 6 || date.getDay() === 0

                return {
                    day_in_week: date.getDay(),
                    day: i + 1,
                    year: prevYear_for_out,
                    month: prevMonth_for_out,
                    isCurrentMonth: true,
                    isWeekend,
                    isToday,
                    isActive,
                    isSelected
                };
            });
            month_for_out[index].set("dayForOut", currentMonthDays_for_out);

        }


        // === Дни текущего месяца ===

        // const currentMonthDays = Array.from({length: daysInMonth}, (_, i) => {
        //     const date = new Date(year, month, i + 1);
        //     const isToday = date.toDateString() === new Date().toDateString();
        //     const isSelected = this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
        //
        //     return {
        //         day_in_week: date.getDay(),
        //         day: i + 1,
        //         year,
        //         month,
        //         isCurrentMonth: true,
        //         isToday,
        //         isSelected
        //     };
        // });
        //
        // // === Дни следующего месяца ===
        // const totalSoFar = prevMonthDays.length + currentMonthDays.length;
        // const remaining = 42 - totalSoFar;
        // const {year: nextYear, month: nextMonth} = getNextMonthYear(year, month);
        // const nextMonthDays = Array.from({length: remaining}, (_, i) => ({
        //     day: i + 1,
        //     year: nextYear,
        //     month: nextMonth,
        //     isCurrentMonth: false
        // }));
        //
        // const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
        // // === HTML2 === test
        let html = `
            <div class="flatpickr-clone">
            <div class="flatpickr-clone-wrapper">

                <div class="flatpickr-canvas">
        `;

        let c_year = 0;
        for (let m_out = 0; m_out < month_for_out.length; m_out++) {
            const month = month_for_out[m_out];
            if (c_year !== month.get("year")) {
                c_year = month.get("year");
                html += `<div class="flatpickr-year">
                   ${c_year}
                </div>`;

            }
            html += `<div class="flatpickr-month-canvas">
                        <div class="flatpickr-month">
                            ${new Date(month.get("year"), month.get("month")).toLocaleString('ru-RU', {month: 'long'})}
                        </div>
                        <div class="flatpickr-week first-week">
            `;

            const allDaysTest = month_for_out[m_out].get("dayForOut");
            for (let day_in_month = 0; day_in_month < allDaysTest.length; day_in_month++) {
                const classes = ['flatpickr-day'];
                const day = allDaysTest[day_in_month];
                const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
                if (day.isWeekend) {//если выходной, то проставляем выходной
                    classes.push('weekend-day')
                    if (day.day_in_week === 6) {
                        classes.push('sunday')
                    }
                }
                if (day.isToday) {
                    classes.push('today')
                }
                if (day.isSelected) {
                    classes.push('selected-day')
                }
                if (!day.isActive) {
                    classes.push('inactive-day')
                }
                const classList = classes.join(' ');
                html += `<span class="${classList}" data-date="${dateStr}">${day.day}</span>
                `;
                if (day.day_in_week === 0 && day_in_month + 1 < allDaysTest.length) {
                    html += `</div> 
                <div class="flatpickr-week">
                `;
                }

                if (day_in_month + 1 > allDaysTest.length) {
                    html += `</div>
                `
                }
            }
            html += `</div>
            `
        }
        html += `</div></div></div> </div></div>`;


        // // === HTML ===
        // let html = `
        //     <div class="flatpickr-clone">
        //         <div class="flatpickr-header">
        //             <button type="button" class="flatpickr-prev">&lt;</button>
        //             <span class="flatpickr-title">
        //                 ${new Date(year, month).toLocaleString('ru-RU', {month: 'long', year: 'numeric'})}
        //             </span>
        //             <button type="button" class="flatpickr-next">&gt;</button>
        //         </div>
        //         <div class="flatpickr-days">
        // `;
        //
        // for (let w = 0; w < 6; w++) {
        //     html += '<div class="flatpickr-week">';
        //     for (let d = 0; d < 7; d++) {
        //         const day = allDays[w * 7 + d];
        //         const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
        //         const classes = [
        //             day.isCurrentMonth ? 'current' : 'other',
        //             day.isToday ? 'today' : '',
        //             day.isSelected ? 'selected' : ''
        //         ].filter(Boolean).join(' ');
        //
        //         html += `<span class="flatpickr-day ${classes}" data-date="${dateStr}">${day.day}</span>`;
        //     }
        //     html += '</div>';
        // }
        //
        // html += `</div></div>`;


        // === Вставка в DOM ===
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'flatpickr-wrapper';
            this.element.insertAdjacentElement('afterend', this.container);
        }
        this.container.innerHTML = html;
        //сохроняем позицию скрола
        //  if (this.container) {
        //     // Находим контейнер ДО того, как он будет перерисован
        //     const oldScrollWrapper = this.container.querySelector('.flatpickr-clone-wrapper');
        //     if (oldScrollWrapper) {
        //         this.currentScrollTop = oldScrollWrapper.scrollTop; // Запоминаем текущую позицию
        //     }
        // }

        if (this.container) {
            // if (this.currentScrollTop > 0) {
            //     if (newScrollWrapper) {
            //         newScrollWrapper.scrollTop = this.currentScrollTop;
            //     }
            // }
            const scrollWrapper = this.container.querySelector('.flatpickr-clone-wrapper');
            if (scrollWrapper) {
                // Прокручиваем в самый низ
                const initialScroll = this.options.initialScroll;

                if (this.currentScrollTop > 0) {
                    // Прокручиваем в самый низ
                    scrollWrapper.scrollTop = this.currentScrollTop;

                }
            }
        }

        // === Hover-подсветка (один раз на открытие) ===
        this.container.addEventListener('mouseenter', this._handleMouseEnter);
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('mouseleave', this._handleMouseLeave);
        // === Обработчики ===
        //this.container.querySelector('.flatpickr-prev').addEventListener('click', () => this.navigateMonth(-1));
        // this.container.querySelector('.flatpickr-next').addEventListener('click', () => this.navigateMonth(1));

        this.container.querySelector('.flatpickr-canvas').addEventListener('click', (e) => {
    e.stopPropagation();
    const dayEl = e.target.closest('.flatpickr-day');
    if (!dayEl) return;

    // === СОХРАНЯЕМ ТЕКУЩИЙ СКРОЛЛ ===
    const wrapper = this.container.querySelector('.flatpickr-clone-wrapper');
    const savedScroll = wrapper ? wrapper.scrollTop : 0;

    const date = new Date(dayEl.dataset.date);

    if (this.mode === 'range') {
        if (!this.rangeStart || this.rangeEnd) {
            if(this.rangeLength>0){
                 this.rangeStart = date;
                 this.rangeEnd = new Date(date.getTime() + (this.rangeLength-1) * 24 * 60 * 60 * 1000);
            }else {
                this.rangeStart = date;
                this.rangeEnd = null;
            }
        } else {
            this.rangeEnd = date;
            if (this.rangeEnd < this.rangeStart) {
                [this.rangeStart, this.rangeEnd] = [this.rangeEnd, this.rangeStart];
            }
        }
    } else {
        this.selectedDate = date;
    }

    this.element.value = this._formatOutput();

    this._render();

    // === ВОССТАНАВЛИВАЕМ СКРОЛЛ ===
    requestAnimationFrame(() => {
        const newWrapper = this.container.querySelector('.flatpickr-clone-wrapper');
        if (newWrapper) newWrapper.scrollTop = savedScroll;
    });

    const selectionComplete = this.mode === 'single' || (this.mode === 'range' && this.rangeEnd);

    if (selectionComplete) {
        setTimeout(() => this._close(), 0);
    }
});


        setTimeout(() => {
                document.addEventListener('click', this._handleOutsideClick);
            },
            0);

    }

    _update() {
        this._render()
        this._close()
    }
}