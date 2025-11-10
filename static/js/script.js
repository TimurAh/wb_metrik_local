document.addEventListener('DOMContentLoaded', function() {
    const sales_basic_div = document.getElementById('sells_basic_id');
    const return_basic_div = document.getElementById('return_basic_id');
    const commission_basic_div = document.getElementById('commission_basic_id');
    const sales_compare_div = document.getElementById('sells_compare_id');
    const return_compare_div = document.getElementById('return_compare_id');
    const commission_compare_div = document.getElementById('commission_compare_id');
    if (sales_div) {
        fetch('/api/data/finRep')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка сети: ' + response.status);
                }
                return response.json();  // Парсим JSON
            })
            .then(data => {
                // Обновляем содержимое div на основе данных
                sales_basic_div.textContent = data.sales + " ₽";
                console.log('Данные получены и обновлены:', data);
            })
            .catch(error => {
                console.error('Ошибка при запросе:', error);
                sales_basic_div.textContent = 'Ошибка загрузки данных';
            });
    } else {
        console.log('Элемент не найден');
    }
});