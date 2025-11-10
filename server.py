import logging

from flask import Flask, render_template, jsonify,request, redirect, url_for
from dotenv import load_dotenv
from models.NewTable import NewTable
from models.base import db
import os
from utils import getFromAPi
from apscheduler.schedulers.background import BackgroundScheduler
from utils.shed_def import load_all_financial_reports
from utils.create_task import create_task
from models.User import User  # <<< ДОБАВИТЬ

from flask_login import current_user, login_required,LoginManager,login_user,logout_user
# выгрузка токена из .env
load_dotenv(dotenv_path='utils/.env')
wb_token = os.getenv('wb_token')
wb_token_test = os.getenv('wb_token_test')
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('db_url')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-dev-secret-key')
db.init_app(app)  # ← Инициализируем db

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login' # Укажите имя функции для входа
# 127.0.0.1:5000

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Если пользователь уже аутентифицирован, перенаправляем его на главную
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        # 1. Получаем данные из формы (или JSON-тела)
        username = request.form.get('username')
        password = request.form.get('password')

        # 2. Ищем пользователя в БД
        # Убедитесь, что поиск по username вернёт только одного пользователя
        user = db.session.execute(
            db.select(User).filter_by(username=username)
        ).scalar_one_or_none()

        # 3. Проверяем пользователя и пароль
        # !!! ВНИМАНИЕ: В РЕАЛЬНОСТИ ИСПОЛЬЗУЙТЕ ХЕШИРОВАНИЕ ПАРОЛЯ (например, bcrypt) !!!
        if user is None or user.password != password:
            # Можно добавить всплывающее сообщение о неверных данных
            return render_template('login.html', error='Неверное имя пользователя или пароль')

            # 4. Вход успешен: создаем сессию для пользователя
        login_user(user)  # Flask-Login сохраняет user_id в сессию/куки

        # Перенаправляем на страницу, которую хотел посетить пользователь (или на главную)
        next_page = request.args.get('next')
        return redirect(next_page or url_for('index'))

    # Для метода GET просто показываем страницу входа
    return render_template('login.html')

@app.route('/logout')
@login_required # Только аутентифицированные могут выйти
def logout():
    logout_user() # Удаляет пользователя из сессии
    return redirect(url_for('login')) # Перенаправляем на страницу входа
@app.route("/")
@login_required
def index():
    if current_user.is_authenticated:
        logging.info(f"Пользователь с user_id = {current_user.user_id} открыл главную страничку")
        return render_template('new_index.html')
    return jsonify({"error": "Unauthorized"}), 401

@login_manager.user_loader
def load_user(user_id):
    """Загружает объект User из базы данных по его ID."""
    # user_id передается как строка, нужно преобразовать в int
    # Используйте db.session.get (современный способ)
    return db.session.get(User, int(user_id))

# Endpoint для данных (GET-запрос)
@app.route('/api/data/finRep', methods=['GET'])
@login_required
def get_data_from_fin_rep():
    """ Возвращает массив вида {"sales":"","returns":"","commission":""} """
    if current_user.is_authenticated:
        print()
        data = getFromAPi.get_fin_rep(app,current_user.get_id(),"2025-08-29","2025-08-29")
        print(f"ответ по ИП:{data}")
        return jsonify(data)
    return jsonify({"error": "Unauthorized"}), 401

TASKS = [
    create_task(load_all_financial_reports, app, trigger="interval", minutes=10, id="wb_report")
]
# === Регистрация всех задач ===
scheduler = BackgroundScheduler()
scheduler.start()

for task in TASKS:
    print("Начало заданий")
    scheduler.add_job(**task)
# Scheduler setup


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
