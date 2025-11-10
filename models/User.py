# models/User.py


from .base import db
from flask_login import UserMixin # <<< ДОБАВИТЬ ЭТОТ ИМПОРТ

class User(db.Model,UserMixin):
    __tablename__ = 'user'
    __table_args__ = {'schema': 'public', 'quote': False}  # Явно указываем схему и кавычки

    username = db.Column(db.String, nullable=True)
    user_id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.String, nullable=True)
    wb_token = db.Column(db.String, nullable=True)
    subscription = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<User {self.username} (ID: {self.user_id})>"

    def to_dict(self):
        return {
            'username': self.username,
            'user_id': self.user_id,
            'wb_token': self.wb_token,
            'subscription': self.subscription
        }

    def get_id(self):
        """Возвращает уникальный ID пользователя в строковом формате."""
        # Обязательно преобразуйте в str, как того требует Flask-Login
        return str(self.user_id)

    def get_token(self):
        """Возвращает уникальный ID пользователя в строковом формате."""
        # Обязательно преобразуйте в str, как того требует Flask-Login
        return str(self.wb_token)
        # ... (остальные методы)