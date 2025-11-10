import requests
from datetime import datetime, timedelta
from models.base import db
from typing import List
from models.CompanyStats import CompanyStats  # <<< ДОБАВИТЬ
from models.FinancialReports import FinancialReports  # <<< ДОБАВИТЬ
from utils.dataType import FinRepApi
from typing import List, cast # <-- ДОБАВИТЬ cast


def split_period(start_str, end_str, format_str='%Y-%m-%d', max_days=31):
    start = datetime.strptime(start_str, format_str).date()
    end = datetime.strptime(end_str, format_str).date()
    if start > end:
        raise ValueError("Начальная дата должна быть раньше или равна конечной")
    intervals = []
    current = start
    while current <= end:
        next_date = min(current + timedelta(days=max_days - 1), end)
        intervals.append((current, next_date))
        current = next_date + timedelta(days=1)
    return intervals


# Пока основной вариант
# Financial Reports / Финансовые отчеты "продажи" , "возвраты" , "коммисия"
def get_fin_rep(app, user_id, date_from, date_to) -> FinRepApi:
    start_date = datetime.strptime(date_from, '%Y-%m-%d')
    end_date = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1) - timedelta(microseconds=1)

    with app.app_context():
        results: List[FinancialReports] = db.session.execute(
            db.select(FinancialReports).filter(
                FinancialReports.user_id == user_id,
                FinancialReports.create_dt.between(start_date, end_date)
            )
        ).scalars().all()

    return_output_sum = 0
    sell_all_sum = 0
    commission_output = 0
    for report in results:
        return_output_sum += abs(report.return_amount) * abs(report.retail_price_withdisc_rub)
        sell_all_sum += abs(report.retail_amount) * abs(report.retail_price_withdisc_rub)
        commission_output += report.ppvz_sales_commission
    sell_output_sum = sell_all_sum - return_output_sum

    data = cast(
        FinRepApi,  # <-- Приведение к конечному типу
        cast(object, {  # <-- Промежуточное приведение к 'object' для подавления ошибки PyCharm
            "sales": float(sell_output_sum),
            "returns": float(return_output_sum),
            "commission": float(commission_output)
        })
    )

    return data
