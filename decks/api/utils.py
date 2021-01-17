import random
from typing import List
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# Helper function for pagination
def get_paginated_queryset_response(qs, request, Serializer, page_size=50, other_information={}) -> Response:
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    if isinstance(Serializer, dict):
        serialized = [Serializer[type(instance)](instance).data for instance in paginated_qs]
    else:
        serialized = Serializer(paginated_qs, many=True).data

    paginated_resp = paginator.get_paginated_response(serialized)
    return Response({**paginated_resp.data, **other_information}, status=200)

# Like random.choices, but without replacement
# Taken from https://stackoverflow.com/a/61605842/13042142
def weighted_sample(population, weights, k=1) -> List[int]:
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
