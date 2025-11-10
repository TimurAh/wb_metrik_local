from flask import Flask, jsonify
from flask_cors import CORS # ⭐ Добавлен для разрешения кросс-доменных запросов

app = Flask(__name__)
CORS(app) # ⭐ Включаем CORS для всего приложения (нужно для локального тестирования)

# Пример данных, которые вы хотите вернуть
SALES_DATA = {
    "sales_value": 10230364,
    "sales_change": -213765
}

# Маршрут для получения данных о продажах (GET)
@app.route('/api/sales', methods=['GET'])
def get_sales_data():
    return jsonify(SALES_DATA)

if __name__ == '__main__':
    # Сервер будет запущен на http://127.0.0.1:5000/
    app.run(debug=True)