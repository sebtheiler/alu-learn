from rest_framework.pagination import PageNumberPagination


# Helper function for pagination
def get_paginated_queryset_response(qs, request, Serializer, page_size=50):
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    paginated_qs = paginator.paginate_queryset(qs, request)
    serializer = Serializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)