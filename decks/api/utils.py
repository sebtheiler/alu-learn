from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# Helper function for pagination
def get_paginated_queryset_response(qs, request, Serializer, page_size=50, other_information={}):
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    if isinstance(Serializer, dict):
        serialized = [Serializer[type(instance)](instance).data for instance in paginated_qs]
    else:
        serialized = Serializer(paginated_qs, many=True).data

    paginated_resp = paginator.get_paginated_response(serialized)
    return Response({**paginated_resp.data, **other_information}, status=200)