document.addEventListener('DOMContentLoaded', function () {
    Chart.defaults.font.size = 18;
    Chart.defaults.font.family = 'Geologica';
    const labelsSource = [
        ['25', 'дек'], ['26', 'дек'], ['27', 'дек'], ['28', 'дек'],
        ['29', 'дек'], ['30', 'дек'], ['31', 'дек'],
        ['01', 'янв'], ['02', 'янв'], ['03', 'янв']
    ];

    // Используем только дни для базового массива labels
    const labels = labelsSource.map(item => item[0]);
    console.log(labels)
    // --- ДАННЫЕ ДВУХ ЛИНИЙ ---
    const dataSet1 = [2000000, 2700000, 3200000, 2200000, 2500000, 2200000,
        4300000, 2200000, 2100000, 3200000]; // Сплошная линия

    const dataSet2 = [3200000, 2300000, 4400000, 2000000, 2800000, 2600000,
        3200000, 2800000, 2600000, 2000000]; // Пунктирная линия

    // --- КОНФИГУРАЦИЯ CHART.JS ---

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Набор данных 1',
                data: dataSet1,
                borderColor: '#127EFA',
                tension: 0,
                borderWidth: 2,
                pointRadius: 5,
                pointBorderWidth:3,
                pointBackgroundColor: '#fff',
                fill: false
            },
            {
                label: 'Набор данных 2',
                data: dataSet2,
                borderColor: '#7AB6FB',
                borderDash: [5, 3], // Пунктирная линия
                tension: 0,
                borderWidth: 1,
                pointRadius:5,
                pointBorderWidth:3,
                pointBackgroundColor: '#fff',

                fill: false

            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            layout: {
                padding: 0
            },
            scales: {

                y: {
                    beginAtZero: true,
                    min: 1500000,
                    max: 5500000,
                    ticks: {
                        color: '#000000',
                        callback: function (value) {
                            return value.toLocaleString('ru-RU');
                        }
                    }
                },
                x: {

                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#000000',
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 30,
                        callback: function (value, index) {

                            const [day, month] = labelsSource[index];
                            if (index === 0) {
                                return [day, month];
                            }
                            const [, prevMonth] = labelsSource[index - 1];

                            if (month !== prevMonth) {
                                return [day, month];
                            } else {
                                return day;
                            }
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false

                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x', // Обычно зум по X более полезен для временных рядов
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    // !!! КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Вызов update() после зума !!!
                    onZoomComplete: function({chart}) {
                        chart.update('none');
                        chart.resize();
                    },
                    onPanComplete: function({chart}) {
                        chart.update('none');
                        chart.resize();
                    }
                }
            }
        }
    };

    // Инициализация графика
    new Chart(
        document.getElementById('myLineChart'),
        config
    );
});

