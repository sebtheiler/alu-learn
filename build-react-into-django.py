import os
from shutil import copytree, copyfile, rmtree

base_dir = os.getcwd()
REACT_DIRECTORY = os.path.join(base_dir, 'alu-web/')
PYTHON_PATH = '~/anaconda3/envs/webdev/bin/python'

# Compile react
os.chdir(REACT_DIRECTORY)
os.system('npm run build')
os.chdir(base_dir)

# Copy static files
if os.path.isdir(os.path.join(base_dir, 'static')):
    rmtree(os.path.join(base_dir, 'static'))
copytree(os.path.join(REACT_DIRECTORY, 'build/static/'), os.path.join(base_dir, 'static/'))
if os.path.isdir(os.path.join(base_dir, 'static-root')):
    rmtree(os.path.join(base_dir, 'static-root'))
os.mkdir(os.path.join(base_dir, 'static-root'))

os.system(f'{PYTHON_PATH} manage.py collectstatic')

# Copy HTML files
copyfile(os.path.join(base_dir, 'alu-web/build/index.html'), os.path.join(base_dir, 'decks/templates/react.html'))

with open(os.path.join(base_dir, 'decks/templates/react.html'), 'r') as f:
    contents = f.read()
    split = contents.split('</script>')
    base_embed_html = split[0][split[0].find('<script>'):] + '</script>'
    js_html = split[1] + '</script>' + split[2] + '</script>'

    split = contents.split('<link')
    for line in split:
        if '/static/css/main.' in line and '.chunk.css' in line:
            css_html = '<link' + line[:line.find('stylesheet') + 12]

def write_file(filename, contents):
    with open(os.path.join(base_dir, filename), 'w+') as f:
        f.write(contents)

write_file('decks/templates/react/base_embed.html', base_embed_html)
write_file('decks/templates/react/js.html', js_html)
write_file('decks/templates/react/css.html', css_html)