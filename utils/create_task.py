# tasks/__init__.py

from functools import partial
from typing import Callable


def create_task(func: Callable, app, **scheduler_kwargs):
    """
    Создаёт задачу с app_context и добавляет в планировщик
    """
    task_func = partial(func, app)
    scheduler_kwargs.setdefault('max_instances', 1)
    scheduler_kwargs.setdefault('replace_existing', True)

    return {
        'func': task_func,
        **scheduler_kwargs
    }