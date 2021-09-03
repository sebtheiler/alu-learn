import os
import re
from shutil import copyfile, copytree, rmtree

import alu.settings as settings

base_dir = os.getcwd()
REACT_DIRECTORY = os.path.join(base_dir, 'alu-web/')

if settings.PRODUCTION:
    PYTHON_PATH = '/home/aluadmin/aludir/aluenv/bin/python3'
else:
    PYTHON_PATH = settings.env_vars['PYTHON_PATH']
COMPILE_REACT = True  # not PRODUCTION


def build_react_into_django():
    # Compile react
    if COMPILE_REACT:
        print('Compiling React...')
        os.chdir(REACT_DIRECTORY)
        if settings.PRODUCTION:
            os.system('npm run build --nomaps')  # don't send raw React code to client
        else:
            os.system('npm run build')
        os.chdir(base_dir)

    # Copy static files
    print('Copying static files...')
    sub_directories = [  # NOT IMAGES!!!
        'css',
        'js',
        'media',
    ]
    django_static_dir = os.path.join(base_dir, 'static')
    react_static_dir = os.path.join(REACT_DIRECTORY, 'build/static/')
    for sub_dir in sub_directories:
        # For each directory...
        if os.path.isdir(os.path.join(django_static_dir, sub_dir)):
            # If it exists, remove it
            rmtree(os.path.join(django_static_dir, sub_dir))
        # Then copy it from React
        copytree(os.path.join(react_static_dir, sub_dir), os.path.join(django_static_dir, sub_dir))

    if os.path.isdir(os.path.join(base_dir, 'static-root')):
        # Remove the 'static-root' folder
        rmtree(os.path.join(base_dir, 'static-root'))
    os.mkdir(os.path.join(base_dir, 'static-root/'))

    os.system(f'{PYTHON_PATH} manage.py collectstatic')

    # Copy HTML files
    print('Copying HTML files...')
    copyfile(
        os.path.join(base_dir, 'alu-web/build/index.html'),
        os.path.join(base_dir, 'decks/templates/react.html'),
    )
    if not os.path.isdir(os.path.join(base_dir, 'decks/templates/react/')):
        os.mkdir(os.path.join(base_dir, 'decks/templates/react/'))

    with open(os.path.join(base_dir, 'decks/templates/react.html'), 'r') as f:
        contents = f.read()

        # <script>!function(e){function r(r) .......... r(a[i]);var p=f;t()}([])</script>
        base_embed_regex = r"(?<=<script>!).*?(?=</script>)"
        base_embed_html = '<script>!' + re.findall(base_embed_regex, contents)[0] + '</script>'

        # <script src="/static/js/?.????????.chunk.js"></script>
        # <script src="/static/js/main.????????.chunk.js">
        js_html_regex = r"<script src=\"/static/js/.{10,13}.chunk.js\"></script>"
        js_html = re.findall(js_html_regex, contents)
        js_html = js_html[0] + js_html[1]

        # <link href="/static/css/main.????????.chunk.css" rel="stylesheet">
        css_html = re.findall(r"<link href=\".*\" rel=\"stylesheet\">", contents)[0]

        # Makes CSS asynchronous
        css_html = css_html.replace(
            'rel="stylesheet"',
            'rel="stylesheet" media="print" onload="this.media=\'all\'"',
        )

    def write_file(filename, contents):
        with open(os.path.join(base_dir, filename), 'w+') as f:
            f.write(contents)

    write_file('decks/templates/react/base_embed.html', base_embed_html)
    write_file('decks/templates/react/js.html', js_html)
    write_file('decks/templates/react/css.html', css_html)

    print('Clearing cache...')
    clear_cache = 'from django.core.cache import cache; cache.clear()'
    os.system(f'{PYTHON_PATH} manage.py shell -c "{clear_cache}"')
    print('Finished')


if __name__ == '__main__':
    build_react_into_django()
