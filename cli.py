#!/usr/bin/env python
import argparse
import os


def create_component():
    comp_name = input('Component name: ')
    comp_base_dir = input('Component dir: ')
    cwd = os.getcwd()
    if not cwd.endswith('frontend'):
        comp_dir = os.path.join(cwd, 'frontend', 'src', comp_base_dir, comp_name)
    else:
        comp_dir = os.path.join(cwd, 'src', comp_base_dir, comp_name)

    os.mkdir(comp_dir)

    index_ts = f"""
import {comp_name} from './{comp_name}';
export default {comp_name};
    """.strip()
    with open(os.path.join(comp_dir, 'index.ts'), 'w+') as f:
        f.write(index_ts)

    component_tsx = f"""
interface {comp_name}Props {{
}}

/**
 * 
 */
export default function {comp_name}({{
}}: {comp_name}Props) {{
  return (
  );
}}
    """.strip()
    with open(os.path.join(comp_dir, f'{comp_name}.tsx'), 'w+') as f:
        f.write(component_tsx)

    component_stories_tsx = f"""
import {{ ComponentStory }} from '@storybook/react';

import {comp_name} from '.';

export default {{
  title: '{'/'.join([p.capitalize() for p in comp_base_dir.split('/')])}/{comp_name}',
  component: {comp_name},
}}

const Template: ComponentStory<typeof {comp_name}> = (args) => <{comp_name} {{...args}} />;

export const {comp_name}Example = Template.bind({{}});
{comp_name}Example.args = {{
}};
    """.strip()
    with open(os.path.join(comp_dir, f'{comp_name}.stories.tsx'), 'w+') as f:
        f.write(component_stories_tsx)

    print('Created component.')


FUNCTION_MAP = {
    'create-component': create_component,
    'cc': create_component,
}

parser = argparse.ArgumentParser(description='Quickly run various commands in Alu')
parser.add_argument('command', choices=FUNCTION_MAP.keys())

args = parser.parse_args()

func = FUNCTION_MAP[args.command]
func()
