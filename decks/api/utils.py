from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# Helper function for pagination
def get_paginated_queryset_response(qs, request, Serializer, page_size=50, other_information={}):
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    serializer = Serializer(paginated_qs, many=True)

    response = paginator.get_paginated_response(serializer.data)
    return Response({**response.data, **other_information}, status=200)#response#