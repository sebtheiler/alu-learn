import { addClassNamesToElement, removeClassNamesFromElement } from "@lexical/utils";
import { $getSelection, $isElementNode, $isRangeSelection, EditorConfig, ElementNode, GridSelection, LexicalNode, NodeKey, NodeSelection, RangeSelection, SerializedElementNode, SerializedLexicalNode, Spread } from "lexical";
import $getAncestor from "../../helpers/getAncestor";
import type { ClozeColor } from "../ClozeDeletionPlugin/colors";

export type ExtractColor = Exclude<ClozeColor, "BLANK">;
const extractColorMap = new Map([
  ["BLUE", "bg-blue-200"],
  ["CYAN", "bg-cyan-200"],
  ["FUCHSIA", "bg-fuchsia-200"],
  ["GREEN", "bg-green-200"],
  ["LIME", "bg-lime-200"],
  ["ORANGE", "bg-orange-200"],
  ["PINK", "bg-pink-200"],
  ["PURPLE", "bg-purple-200"],
  ["RED", "bg-red-200"],
  ["SKY", "bg-sky-200"],
  ["YELLOW", "bg-yellow-200"],
]);

export type SerializedExtractNode = Spread<
  {
    type: "extract"
    color: ExtractColor;
    version: 1;
  },
  SerializedElementNode
>;

export class ExtractNode extends ElementNode {
  /** @internal */
  __color: ExtractColor;

  static getType(): string {
    return "extract";
  }

  static clone(node: ExtractNode): ExtractNode {
    return new ExtractNode(node.__color, node.__key);
  }

  constructor(color: ExtractColor, key?: NodeKey) {
    super(key);
    this.__color = color;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    element.dataset.isExtract = "true";
    element.dataset.color = this.__color;
    addClassNamesToElement(
      element,
      config.theme.extract,
      extractColorMap.get(this.__color)
    );
    return element;
  }

  updateDOM(prevNode: ExtractNode, span: HTMLSpanElement): boolean {
    const color = this.__color;
    if (color !== prevNode.__color) {
      span.dataset.color = color;
      removeClassNamesFromElement(span, extractColorMap.get(prevNode.__color));
      addClassNamesToElement(span, extractColorMap.get(color));
    }

    return false;
  }

  static importJSON(serializedNode: SerializedExtractNode): ExtractNode {
    const node = $createExtractNode(serializedNode.color);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedExtractNode {
    return {
      ...super.exportJSON(),
      color: this.getColor(),
      type: "extract",
      version: 1,
    }
  }

  getColor(): ExtractColor {
    return this.getLatest().__color;
  }

  setColor(color: ExtractColor): void {
    const writable = this.getWritable();
    writable.__color = color;
  }

  insertNewAfter(selection :RangeSelection): ExtractNode | null {
    const element = this.getParentOrThrow().insertNewAfter(selection);
    if ($isElementNode(element)) {
      const extractNode = $createExtractNode(this.__color);
      element.append(extractNode)
      return extractNode
    }
    return null
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection | null
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    );
  }
}

export function $createExtractNode(color: ExtractColor): ExtractNode {
  return new ExtractNode(color)
}

export function $isExtractNode(node: LexicalNode | null | undefined): node is ExtractNode {
  return node instanceof ExtractNode;
}

export function toggleExtract(payload: { color: ExtractColor }): void {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) return;
  const nodes = selection.extract();

  if (payload === null) {
    // Remove ExtractNodes
    nodes.forEach((node) => {
      const parent = node.getParent();
      
      if ($isExtractNode(parent)) {
        const children = parent.getChildren();

        for (const child of children) {
          parent.insertBefore(child)
        }

        parent.remove();
      }
    });
  } else {
    const { color } = payload;

    // Add or merge ExtractNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // If the first node is an ExtractNode or if its
      // parent is an ExtractNode we update its `color`
      const extractNode = $isExtractNode(firstNode)
        ? firstNode
        : $getExtractAncestor(firstNode);
      if (extractNode !== null) {
        extractNode.setColor(color);
        return;
      }
    }

    let prevParent: ElementNode | ExtractNode | null = null;
    let extractNode: ExtractNode | null = null;

    nodes.forEach((node) => {
      const parent = node.getParent();

      if (
        parent === extractNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return;
      }

      if ($isExtractNode(parent)) {
        extractNode = parent;
        parent.setColor(color)
        return;
      }

      if (!parent.is(prevParent)) {
        prevParent = parent;
        extractNode = $createExtractNode(color);

        if ($isExtractNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(extractNode);
          } else {
            parent.insertAfter(extractNode)
          }
        } else {
          node.insertBefore(extractNode);
        }
      }

      if ($isExtractNode(node)) {
        if (node.is(extractNode)) return;
        if (extractNode !== null) {
          const children = node.getChildren();

          for (const child of children) {
            extractNode.append(child)
          }
        }

        node.remove()
        return
      }

      if (extractNode !== null) {
        extractNode.append(node)
      }
    })
  }
}

function $getExtractAncestor(node: LexicalNode): null | LexicalNode {
  return $getAncestor(node, (ancestor) => $isExtractNode(ancestor));
}