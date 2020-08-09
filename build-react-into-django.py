import os
from shutil import copytree, copyfile, rmtree
import re

base_dir = os.getcwd()
REACT_DIRECTORY = os.path.join(base_dir, 'alu-web/')
PYTHON_PATH = '~/anaconda3/envs/webdev/bin/python'

# Compile react
print('Compiling React...')
os.chdir(REACT_DIRECTORY)
os.system('npm run build')
os.chdir(base_dir)

# Copy static files
print('Copying static files...')
if os.path.isdir(os.path.join(base_dir, 'static')):
    rmtree(os.path.join(base_dir, 'static'))
copytree(os.path.join(REACT_DIRECTORY, 'build/static/'), os.path.join(base_dir, 'static/'))
if os.path.isdir(os.path.join(base_dir, 'static-root')):
    rmtree(os.path.join(base_dir, 'static-root'))
os.mkdir(os.path.join(base_dir, 'static-root/'))

os.system(f'{PYTHON_PATH} manage.py collectstatic')

# Copy HTML files
print('Copying HTML files...')
copyfile(os.path.join(base_dir, 'alu-web/build/index.html'), os.path.join(base_dir, 'decks/templates/react.html'))
if not os.path.isdir(os.path.join(base_dir, 'decks/templates/react/')):
    os.mkdir(os.path.join(base_dir, 'decks/templates/react/'))

with open(os.path.join(base_dir, 'decks/templates/react.html'), 'r') as f:
    contents = f.read()

    # <script>var path=window.location.pathname ...... ;var p=f;t()}([])</script>
    base_embed_html = '<script>v' + re.findall(r"(?<=<script>v).*?(?=\)</script>)", contents)[0] + ')</script>'

    # <script src="/static/js/?.????????.chunk.js"></script><script src="/static/js/main.????????.chunk.js">
    js_html = re.findall(r"<script src=\"/static/js/.{10,13}.chunk.js\"></script>", contents)
    js_html = js_html[0] + js_html[1]

    # <link href="/static/css/main.????????.chunk.css" rel="stylesheet">
    css_html = re.findall(r"<link href=\".*\" rel=\"stylesheet\">", contents)[0]


def write_file(filename, contents):
    with open(os.path.join(base_dir, filename), 'w+') as f:
        f.write(contents)

write_file('decks/templates/react/base_embed.html', base_embed_html)
write_file('decks/templates/react/js.html', js_html)
write_file('decks/templates/react/css.html', css_html)

print('Finished')