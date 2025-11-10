from .base import db

class NewTable(db.Model):
    __tablename__ = 'newtable'
    __table_args__ = {'schema': 'public'}  # если нужно явно указать схему
    test1 = db.Column(db.String, nullable=True)
    column1 = db.Column(
        db.String,
        primary_key=True,
        server_default=db.text("default")  # PostgreSQL сам заполнит
    )
    def __repr__(self):
        return f'<NewTable column1={self.column1}, test1="{self.test1}">'