import { Node } from 'slate'

export default function flattenNodes(nodes: Node[]): string {
  return nodes.map(n => Node.string(n)).join('\n');
}
