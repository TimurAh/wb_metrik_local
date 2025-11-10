# models/CompanyStats.py
from .base import db
from sqlalchemy.dialects.postgresql import JSONB


# ... другие импорты

class CompanyStats(db.Model):
    __tablename__ = 'company_stat_days'

    __table_args__ = (
        # 1. Ваш запрошенный композитный первичный ключ
        db.PrimaryKeyConstraint('date', 'advert_id', name='pk_company_stats'),

        # 2. Внешний ключ к пользователю (взят из вашего файла)
        # Убедитесь, что 'public.user.user_id' - правильный путь к ПК User
        db.ForeignKeyConstraint(
            ['user_id'],
            ['public.user.user_id'],
            name='fk_company_stats_user'
        ),
        {'schema': 'public'}
    )
    # --- КЛЮЧЕВЫЕ ПОЛЯ ---
    advert_id = db.Column(db.BigInteger, nullable=False, comment='ID кампании (Первичный ключ)')

    # ИСПОЛЬЗУЙТЕ db.ForeignKey('имя_таблицы.имя_pk_колонки') ЗДЕСЬ:
    user_id = db.Column(
        db.Integer,
        nullable=False,
        comment='ID пользователя (Внешний ключ)'
    )
    # --- СКАЛЯРНЫЕ ПОЛЯ (верхний уровень JSON) ---
    # atbs = db.Column(db.Integer, comment='Добавлений в корзину')
    # canceled = db.Column(db.Integer, comment='Отмены, шт.')
    # clicks = db.Column(db.Integer)
    # ... остальные колонки (cpc, cr, ctr, orders, shks, sum, sum_price, views)
    # cpc = db.Column(db.Numeric(10, 4), comment='Средняя стоимость клика')
    # cr = db.Column(db.Numeric(10, 4), comment='CR')
    # ctr = db.Column(db.Numeric(10, 4), comment='CTR')
    # orders = db.Column(db.Integer, comment='Заказов')
    # shks = db.Column(db.Integer, comment='Товаров в заказе')
    # sum = db.Column(db.Numeric(10, 4), comment='Затраты, ₽')
    # sum_price = db.Column(db.Numeric(10, 4), comment='Сумма заказов, ₽')
    # views = db.Column(db.Integer, comment='Показы')
    # --- ВЛОЖЕННЫЕ ПОЛЯ (JSONB) ---
    booster_stats = db.Column(JSONB, nullable=True, comment='Статистика по средней позиции (JSONB)')
    # days = db.Column(JSONB, nullable=True, comment='Статистика по дням, приложениям и артикулам (JSONB)')

    apps = db.Column(JSONB, nullable=True)
    atbs = db.Column(db.Integer, nullable=True)
    canceled = db.Column(db.Integer, nullable=True)
    clicks = db.Column(db.Integer, nullable=True)
    cpc = db.Column(db.Numeric(10, 4), nullable=True)
    cr = db.Column(db.Numeric(10, 4), nullable=True)
    ctr = db.Column(db.Numeric(10, 4), nullable=True)
    date = db.Column(db.Date, nullable=False)
    orders = db.Column(db.Integer, nullable=True)
    shks = db.Column(db.Integer, nullable=True)
    sum = db.Column(db.Numeric(10, 4), comment='Затраты, ₽')
    sum_price = db.Column(db.Numeric(10, 4), comment='Затраты, ₽')
    views = db.Column(db.Integer, nullable=True)

    # Связь с моделью User (для удобства ORM-запросов)
    # Здесь используется имя КЛАССА 'User'
    user = db.relationship('User', backref='company_stats_collection')
