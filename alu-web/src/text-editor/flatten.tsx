import { Node } from 'slate'

export default function flattenNodes(nodes: Node[]): string {
  console.log(nodes)
  return nodes.map(n => Node.string(n)).join('\n');
}
