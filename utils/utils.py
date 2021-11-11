import base64
import datetime as dt
import random
from typing import List, Union

from django.core.files.base import ContentFile
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


def get_morning(utc_timezone_offset: int = 0) -> dt.datetime:
    now = timezone.now()
    if utc_timezone_offset > 0:
        now -= dt.timedelta(minutes=utc_timezone_offset)
    this_morning = now.replace(hour=0, minute=0, second=0, microsecond=0)

    return this_morning


def assert_dict_data_type(
    dict_to_check: dict,
    expected_attr_types: dict,
    enforce_all_keys_equal: bool = True,
) -> Union[str, None]:
    """
    Asserts that each specified item in `dict_to_check` is of the type sepcified by `attr_types`

    `expected_attr_types` maps string attributes to types ({'options': dict, 'obj_id': (int, str)})
    """
    if enforce_all_keys_equal and dict_to_check.keys() != expected_attr_types.keys():
        print(dict_to_check.keys(), expected_attr_types.keys())
        return 'Mismatch between supplied keys and editable keys'

    for given_attr, given_val in dict_to_check.items():
        expected_type = expected_attr_types.get(given_attr)
        if expected_type is None or not isinstance(given_val, expected_type):
            return f'`{given_attr}` must be of type {expected_type}, not {type(given_attr)}'

    return None


def base64_to_file(base64_str: str, title: str) -> ContentFile:
    image_format, img_str = base64_str.split(';base64,')
    ext = image_format.split('/')[-1]
    image = ContentFile(base64.b64decode(img_str), name=f'{title}.{ext}')

    return image
