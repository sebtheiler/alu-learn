from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser


@api_view(['POST'])
def txt_file_upload(request, *args, **kwargs):
    uploaded_file = request.data.get('uploaded_file')
    print(uploaded_file)

    return Response({}, status=201)