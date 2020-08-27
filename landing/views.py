from django.shortcuts import render, redirect
import random

NUM_EXPERIMENTS = 10

def landing_page(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect('/home/')

    experiment_id = request.session.get('experiment_id')
    if not experiment_id:
        experiment_id = ''.join(['0' if random.random() > 0.5 else '1' for _ in range(NUM_EXPERIMENTS)])
        request.session['experiment_id'] = experiment_id
    print(experiment_id)

    context = {
        'alpha_spots_remaining': 200,
        'experiment_id': experiment_id,
    }
    return render(request, 'landing/landing.html', context=context)