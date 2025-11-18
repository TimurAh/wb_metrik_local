const yearOutput = document.querySelector(".year-date-datepicker");
    yearOutput.innerText = new Date().getFullYear()
    const dayMonthFormatter = (date) => {
        const day = date.getDate();    // Получаем день (1-31)
        const month = date.getMonth() + 1; // Получаем месяц (0-11), прибавляем 1

        // Объединяем их через пробел
        return `${day}  ${month}`;
    };
    let picker = null;
    let picker2 = null;
    document.addEventListener('closeDatepickerEvent', (e) => {
        const elementId = '#' + e.detail.id;
        const datePicker = document.querySelector(elementId);
        const dayOutputStart = datePicker.querySelector(".datepicker-output-day-rangeStart");
        const monthOutputStart = datePicker.querySelector(".datepicker-output-month-rangeStart");
        const dayOutputEnd = datePicker.querySelector(".datepicker-output-day-rangeEnd");
        const monthOutputEnd = datePicker.querySelector(".datepicker-output-month-rangeEnd");

        dayOutputStart.textContent = e.detail.rangeStart.getDate();
        monthOutputStart.textContent = e.detail.rangeStart.getMonth() + 1;
        dayOutputEnd.textContent = e.detail.rangeEnd.getDate();
        monthOutputEnd.textContent = e.detail.rangeEnd.getMonth() + 1;
        if(yearOutput.innerText !== String( e.detail.rangeEnd.getFullYear())){
            yearOutput.innerText = String(e.detail.rangeEnd.getFullYear()-2001)+"/"+String(e.detail.rangeEnd.getFullYear()-2000)
        }

        //если это первый календарь, то создаем второй календарь, ждем прогрузки страницы и создаем 2 календарь

        if (elementId === "#baseDateInput" && picker2 !== null && picker !== null) {
            const newEndDate = new Date(picker.rangeStart - 1 * 24 * 60 * 60 * 1000);
            const diffDate =Math.round( (picker.rangeEnd - picker.rangeStart) / (1000 * 3600 * 24)) +1;
            picker2.rangeEnd = newEndDate
            picker2.rangeStart = new Date(picker.rangeStart - diffDate * 24 * 60 * 60 * 1000);
            picker2.endActiveRange = picker2.rangeStart ;
            picker2.rangeLength = diffDate
            console.log(picker2.rangeStart)
            picker2.update();
        }


    });

    const baseDatepicker = document.querySelector('#baseDateInput');
    picker = new DatePicker({
        element: baseDatepicker,
        weekStart: 1,
        mode: "range",
        formatDate: dayMonthFormatter
    });
    baseDatepicker.addEventListener('click', () => picker.render());

    const extraDatepicker = document.querySelector('#extraDateInput');
    picker2 = new DatePicker({
        element: extraDatepicker,
        weekStart: 1,
        mode: "range",
        formatDate: dayMonthFormatter,
        autoSetDay: false,
        rangeStart: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        rangeEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endActiveRange: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    });

    extraDatepicker.addEventListener('click', () => picker2.render());