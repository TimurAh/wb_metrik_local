# utils/shed_def.py
import os
import sys
import time
import requests
from datetime import datetime, timedelta
from models.base import db
from models.FinancialReports import FinancialReports
from models.CompanyStats import CompanyStats
from models.User import User
import threading
import logging
LOAD_DAYS = 93
REQUEST_DELAY = 1.0  # Задержка между запросами (сек)

logging.basicConfig(
    level=logging.DEBUG, # Выводим INFO и всё, что выше (WARNING, ERROR, CRITICAL)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout) # Вывод в консоль (stdout)
    ]
)
logger = logging.getLogger(__name__)

def clean_item(item):
    """Преобразуем 'null' → None, пустые строки → None"""
    return {
        k: (None if v in ('null', '', None) else v)
        for k, v in item.items()
    }


def load_financial_reports(app, user):
    logging.debug(f"Начало процедуры load_financial_reports для user_id = {user.get('user_id')}")
    token = user.get('wb_token')
    user_id = user.get('user_id')
    if not token:
        logger.warning(f"Нет токена для user_id={user_id}")
        return

    api_url = "https://statistics-api-sandbox.wildberries.ru/api/v5/supplier/reportDetailByPeriod"
    now = datetime.utcnow()
    date_from = (now - timedelta(days=LOAD_DAYS)).isoformat() + 'Z'
    date_to = now.date().isoformat()
    params = {'dateFrom': date_from, 'dateTo': date_to, 'limit': 100000, 'rrdid': 0}
    headers = {"Authorization": token}
    logging.debug(f"Период для user_id = {user.get('user_id')} : c {date_from} по {date_to}")
    try:
        response = requests.get(api_url, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        with app.app_context():
            with db.session.no_autoflush:  # ← ОТКЛЮЧАЕМ autoflush
                added = 0
                for item in data:
                    item = clean_item(item)
                    rrd_id = item.get('rrd_id')
                    if not rrd_id:
                        continue

                    # Проверяем существование
                    exists = db.session.get(FinancialReports, rrd_id)
                    if exists:
                        continue

                    item['user_id'] = user_id
                    record = FinancialReports(**item)
                    db.session.add(record)
                    added += 1

                db.session.commit()
                logging.info(f"Добавлено {added} новых записей для user_id={user_id} Таблица FinancialReports")

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            logging.warning(f"429 Too Many Requests — ждём {REQUEST_DELAY * 5} сек... user_id={user_id}")
            time.sleep(REQUEST_DELAY * 5)
        elif e.response.status_code == 401:
            logging.error(f"401 Unauthorized — токен недействителен для user_id={user_id}")
        else:
            logging.error(f"HTTP {e.response.status_code}: {e}")
    except Exception as e:
        logging.error(f"Ошибка: {e} user_id={user_id}")
    finally:
        time.sleep(REQUEST_DELAY)  # ← ЗАДЕРЖКА МЕЖДУ ПОЛЬЗОВАТЕЛЯМИ


def load_company_stats(app, user):
    logging.debug(f"Начало процедуры load_company_stats для user_id = {user.get('user_id')}")
    token = user.get('wb_token')
    user_id = user.get('user_id')
    if not token:
        logging.warning(f"Нет токена для user_id={user_id}")
        return

    api_url_get_company = "https://advert-api.wildberries.ru/adv/v1/promotion/count"
    api_url_get_stats = "https://advert-api.wildberries.ru/adv/v3/fullstats"
    headers = {"Authorization": token}
    now = datetime.utcnow()
    date_from = (now - timedelta(days=LOAD_DAYS)).date().isoformat()
    date_to = now.date().isoformat()
    """ ТЕСТ """
    date_from = "2023-06-01"
    date_to = "2023-06-29"
    """ ТЕСТ """
    try:
        res = requests.get(api_url_get_company, headers=headers)
        data = res.json()
        list_company_id = []
        if data.get('adverts'):
            for company_status_list in data.get('adverts'):
                for company in company_status_list.get('advert_list'):
                    list_company_id.append(company.get('advertId'))
        logging.debug(f"Ответ сервера по url:{api_url_get_company} {res.status_code} user_id={user_id}")
        list_company_id_for_post = [list_company_id[i:i + 100] for i in range(0, len(list_company_id), 100)]
        range_date = split_period(date_from, date_to)
        logging.debug(f"список компаний для вывода инфы:{list_company_id_for_post} общий период с {date_from} по {date_to}")
        data = []
        for period_index, period in enumerate(range_date):
            for company_index, company_100 in enumerate(list_company_id_for_post):
                logging.debug(f"Обработка периода {period_index + 1} из {len(range_date)}, лист компаний {company_index + 1} из {len(list_company_id_for_post)} для пользователя user_id={user_id}")
                response_status_429 = True
                params = {
                    "ids": ",".join(map(str, company_100)),
                    "beginDate": period[0],
                    "endDate": period[1]
                }
                while response_status_429:
                    res = requests.get(api_url_get_stats, params=params, headers=headers)
                    if res.ok:
                        logging.debug(f"Положительный ответ сервера по url:{api_url_get_stats} {res.status_code} user_id={user_id}")
                        response_status_429 = False
                        data.append(res.json())
                    if res.status_code == 429:
                        logging.warning(f"Ответ сервера по url:{api_url_get_stats} {res.status_code} user_id={user_id}")
                        time.sleep(20)
                    if res.status_code == 400:  # обрабатываем кривой ответ от вб, когда 400, но запрос фактический отработал, но он пустой
                        if res.json().get('detail') == 'there are no statistics for this advertising period':
                            logging.debug(f"Пустой ответа сервера по url:{api_url_get_stats} user_id={user_id}: Ответ:{res.json()} параметры запроса : {params}")
                            response_status_429 = False
                        else:
                            logging.error(f"HTTP 400 для user_id={user_id} доп инфа: {res.text}")
        """Создание плоского нужного json вида"""
        new_items_for_load = []
        for response_item in data:
            for item in response_item:
                for day_items in item.get('days'):
                    new_items = day_items
                    new_items['advert_id'] = item.get('advertId')
                    new_items_for_load.append(new_items)

        with app.app_context():
            with db.session.no_autoflush:  # ← ОТКЛЮЧАЕМ autoflush
                added = 0
                for insert_item in new_items_for_load:
                        logging.debug(f"item data: {insert_item}")
                        insert_item = clean_item(insert_item)
                        pk = [insert_item.get('date'), insert_item.get('advert_id')]

                        if not pk:
                            continue
                        exists = db.session.get(CompanyStats, pk)  # Быстрее!
                        if exists:
                            continue
                        insert_item['user_id'] = user_id
                        record = CompanyStats(**insert_item)
                        db.session.add(record)
                        added += 1
                db.session.commit()
                logging.info(f"Добавлено {added} новых записей для user_id={user_id} Таблица CompanyStats user_id={user_id}")

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            logging.warning(f"429 Too Many Requests — ждём {REQUEST_DELAY * 5} сек... user_id={user_id}")
            time.sleep(REQUEST_DELAY * 5)
        elif e.response.status_code == 401:
            logging.error(f"401 Unauthorized — токен недействителен для user_id={user_id}")
        else:
            logging.error(f"HTTP {e.response.status_code}: {e} user_id={user_id}")
    except Exception as e:
        logging.error(f"Ошибка: {e} user_id={user_id}")
    finally:
        time.sleep(REQUEST_DELAY)  # ← ЗАДЕРЖКА МЕЖДУ ПОЛЬЗОВАТЕЛЯМИ


def load_all_financial_reports(app):
    with app.app_context():
        users = User.query.filter(User.wb_token.isnot(None)).all()
        if not users:
            logging.warning("Нет пользователей с токенами")
            return

    for user in [u.to_dict() for u in users]:
        load_financial_reports(app, user)
        load_company_stats(app, user)

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
