class FinRepApi:
    """Схема возвращаемого словаря с данными из отчета Financial Reports ."""
    sales: float       # Ожидаем, что это будет число с плавающей точкой
    returns: float
    commission: float