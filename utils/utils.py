import datetime as dt
import random
from typing import List, Union

from django.utils import timezone


# Like random.choices, but without replacement
# Taken from https://stackoverflow.com/a/61605842/13042142
def weighted_sample(population, weights, k=1) -> List[int]:
    k = min(k, len(population))
    weights = list(weights)
    positions = range(len(population))
    indices = []
    while True:
        needed = k - len(indices)
        if not needed:
            break
        for i in random.choices(positions, weights, k=needed):
            if weights[i]:
                weights[i] = 0.0
                indices.append(i)
    return [population[i] for i in indices]


# Creates a basic SlateJS Element
def create_slate_element(inner_text: str):
    return [
        {
            "type": "paragraph",
            "children": [
                {
                    "text": inner_text
                },
            ],
        },
    ]


BLANK_SLATE_ELEMENT = create_slate_element('')


def get_morning() -> dt.datetime:
    now = timezone.now()
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

    return this_morning


def assert_dict_data_type(dict_to_check: dict, attr_types: dict) -> Union[str, None]:
    """
    Asserts that each specified item in `dict_to_check` is of the type sepcified by `attr_types`

    `attr_types` maps string attributes to types ({'options': dict, 'obj_id': (int, str)})
    """
    if dict_to_check.keys() != attr_types.keys():
        return 'Mismatch between supplied keys and editable keys'

    for attr, expected_type in attr_types.items():
        request_value = dict_to_check.get(attr)
        if not isinstance(request_value, expected_type):
            return f'`{attr}` must be of type {expected_type}, not {type(request_value)}'

    return None
