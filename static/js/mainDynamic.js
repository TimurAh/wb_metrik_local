document.addEventListener('DOMContentLoaded', function () {
    const defaultLocale = flatpickr.localize(flatpickr.l10ns.ru);
    flatpickr.l10ns.default.rangeSeparator = ' - ';
    flatpickr.l10ns.default.months.shorthand = flatpickr.l10ns.default.months.shorthand.map(
            month => month.toLowerCase()
        )
    let calendarBase = flatpickr("#baseCalendar", {
        altInput: true,
        altFormat: "d M Y",
        mode: "range",
        defaultDate: ["2025-12-21", "2025-12-29"]
    });
    let calendarExtra = flatpickr("#extraCalendar", {
        altInput: true,
        altFormat: "d M Y",
        mode: "range",
        defaultDate: ["2025-12-12", "2025-12-20"]
    });

});