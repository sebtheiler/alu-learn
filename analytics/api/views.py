from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import ExperimentController


@api_view(['POST'])
def create_blank_experiment_api_view(request, *args, **kwargs):
    """
    Create an experiment datapoint with parameters, but no success value

    Required values:
        `controller_short_name`: Short name of the controller to add to
        `experiment_params`: Experiment parameters
    """

    # Get experiment controller
    try:
        controller = ExperimentController.objects.get(short_name=request.data.get('controller_short_name'))
    except ExperimentController.DoesNotExist:
        return Response({'message': 'Experiment not found'}, status=404)

    # Add experiment
    controller.add_data_piece(
        parameters=request.data.get('experiment_params'),
        successful=None,
    )

    return Response({'message': 'Experiment object created successfully'}, status=201)