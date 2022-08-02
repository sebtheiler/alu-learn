#!/usr/bin/env python
import argparse
import os
import re


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
import {comp_name} from "./{comp_name}";
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
import {{ ComponentStory }} from "@storybook/react";

import {comp_name} from ".";

export default {{
  title: "{'/'.join([p.capitalize() for p in comp_base_dir.split('/')])}/{comp_name}",
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


def create_page():
    page_name = input('Page name: ')
    page_url = input('Page url: ')
    rendering_method = input('SSR/SSG/None? ')
    base_page_url_dir = '/'.join(page_url.split('/')[:-1])
    page_url_file = page_url.split('/')[-1]

    if not page_name.endswith('Page'):
        page_name += 'Page'

    page_raw_name = page_name.replace('Page', '')

    cwd = os.getcwd()
    if not cwd.endswith('frontend'):
        page_dir = os.path.join(cwd, 'frontend', 'src', 'pages', page_name)
        page_url_dir = os.path.join(cwd, 'frontend', 'pages', base_page_url_dir)
    else:
        page_dir = os.path.join(cwd, 'src', 'pages', page_name)
        page_url_dir = os.path.join(cwd, 'pages', base_page_url_dir)

    os.mkdir(page_dir)
    if not os.path.isdir(page_url_dir):
        os.mkdir(page_url_dir)

    index_ts = f"""
import {page_name}, {{ {page_name}Props }} from "./{page_name}";

export default {page_name};
export type {{ {page_name}Props }};
    """.strip()
    with open(os.path.join(page_dir, 'index.ts'), 'w+') as f:
        f.write(index_ts)

    page_title = re.sub(r"\B([A-Z])", r" \1", page_raw_name)
    page_tsx = f"""
import Head from "next/head";

export interface {page_name}Props {{
}}

/**
 * 
 */
export default function {page_name}({{
}}: {page_name}Props) {{
  return (
    <div>
      <Head>
        <title>{page_title}</title>
      </Head>
    </div>
  );
}}
    """.strip()
    with open(os.path.join(page_dir, f'{page_name}.tsx'), 'w+') as f:
        f.write(page_tsx)

    page_stories_tsx = f"""
import {{ ComponentStory }} from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

import {page_name} from ".";

export default {{
  title: "pages/{page_name}",
  component: {page_name},
  decorators: [withNavbar, withFullContext],
}}

const Template: ComponentStory<typeof {page_name}> = (args) => <{page_name} {{...args}} />;

export const {page_name}Example = Template.bind({{}});
{page_name}Example.parameters = {{
  layout: "fullscreen",
}};
    """.strip()
    with open(os.path.join(page_dir, f'{page_name}.stories.tsx'), 'w+') as f:
        f.write(page_stories_tsx)

    if rendering_method.lower() == 'ssr':
        rendering_page_url_tsx = f"""

export const getServerSideProps: GetServerSideProps = async (context) => {{
  return {{
    props: {{}} as {page_name}Props,
  }}
}}

"""
        imports = 'GetServerSideProps'
    elif rendering_method.lower() == 'ssg':
        rendering_page_url_tsx = f"""

export const getStaticProps: GetStaticProps = async (context) => {{
  return {{
    props: {{}} as {page_name}Props,
  }}
}}
"""
        imports = 'GetStaticProps'
    else:
        rendering_page_url_tsx = ''
        imports = ''

    if imports:
        imports = f"""import type {{ {imports} }} from "next";"""

    page_url_tsx = f"""
{imports}
import type {{ NextPage }} from "../lib/types";
import {page_name} from "pages/{page_name}";

const {page_raw_name}: NextPage = (props: {page_name}Props) => <{page_name} />;

export default {page_raw_name};

{rendering_page_url_tsx}
""".strip()

    with open(os.path.join(page_url_dir, f'{page_url_file}.tsx'), 'w+') as f:
        f.write(page_url_tsx)

    print('Created page.')


FUNCTION_MAP = {
    'create-component': create_component,
    'cc': create_component,
    'create-page': create_page,
    'cp': create_page,
}

parser = argparse.ArgumentParser(description='Quickly run various commands in Alu')
parser.add_argument('command', choices=FUNCTION_MAP.keys())

args = parser.parse_args()

func = FUNCTION_MAP[args.command]
func()
