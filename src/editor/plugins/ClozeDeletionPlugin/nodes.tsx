import { ClozeColor, colorMap } from "./colors";
import $getAncestor from "@/editor/helpers/getAncestor";
import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  EditorConfig,
  GridSelection,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedElementNode,
  Spread,
} from "lexical";
import { ElementNode } from "lexical";

export type SerializedClozeDeletionNode = Spread<
  {
    type: "clozedeletion";
    color: ClozeColor;
    hint: string;
    version: 1;
  },
  SerializedElementNode
>;

export class ClozeDeletionNode extends ElementNode {
  /** @internal */
  __color: ClozeColor;
  /** @internal */
  __hint: string;

  static getType(): string {
    return "clozedeletion";
  }

  static clone(node: ClozeDeletionNode): ClozeDeletionNode {
    return new ClozeDeletionNode(node.__color, node.__hint, node.__key);
  }

  constructor(color: ClozeColor, hint: string, key?: NodeKey) {
    super(key);
    this.__color = color;
    this.__hint = hint;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    element.dataset.isClozeDeletion = "true";
    element.dataset.color = this.__color;
    element.dataset.hint = this.__hint;
    addClassNamesToElement(
      element,
      config.theme.clozeDeletion,
      colorMap.get(this.__color)
    );
    return element;
  }

  updateDOM(prevNode: ClozeDeletionNode, span: HTMLSpanElement): boolean {
    const color = this.__color;
    if (color !== prevNode.__color) {
      span.dataset.color = color;
      removeClassNamesFromElement(span, colorMap.get(prevNode.__color));
      addClassNamesToElement(span, colorMap.get(color));
    }

    const hint = this.__hint;
    if (hint !== prevNode.__hint) {
      span.dataset.hint = hint;
    }

    return false;
  }

  static importJSON(
    serializedNode: SerializedClozeDeletionNode
  ): ClozeDeletionNode {
    const node = $createClozeDeletionNode(
      serializedNode.color,
      serializedNode.hint
    );
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedClozeDeletionNode {
    return {
      ...super.exportJSON(),
      color: this.getColor(),
      hint: this.getHint(),
      type: "clozedeletion",
      version: 1,
    };
  }

  getColor(): ClozeColor {
    return this.getLatest().__color;
  }

  setColor(color: ClozeColor): void {
    const writable = this.getWritable();
    writable.__color = color;
  }

  getHint(): string {
    return this.getLatest().__hint;
  }

  setHint(hint: string): void {
    const writable = this.getWritable();
    writable.__hint = hint;
  }

  insertNewAfter(selection: RangeSelection): ClozeDeletionNode | null {
    const element = this.getParentOrThrow().insertNewAfter(selection);
    if ($isElementNode(element)) {
      const clozeDeletionNode = $createClozeDeletionNode(
        this.__color,
        this.__hint
      );
      element.append(clozeDeletionNode);
      return clozeDeletionNode;
    }
    return null;
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

export function $createClozeDeletionNode(
  color: ClozeColor,
  hint: string
): ClozeDeletionNode {
  return new ClozeDeletionNode(color, hint);
}

export function $isClozeDeletionNode(
  node: LexicalNode | null | undefined
): node is ClozeDeletionNode {
  return node instanceof ClozeDeletionNode;
}

export function toggleClozeDeletion(
  payload: { color: ClozeColor; hint: string } | null
): void {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();

  if (payload === null) {
    // Remove ClozeDeletionNodes
    nodes.forEach((node) => {
      const parent = node.getParent();

      if ($isClozeDeletionNode(parent)) {
        const children = parent.getChildren();

        for (const child of children) {
          parent.insertBefore(child);
        }

        parent.remove();
      }
    });
  } else {
    const { color, hint } = payload;

    // Add or merge ClozeDeletionNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // If the first node is a ClozeDeletionNode or if its
      // parent is a ClozeDeletionNode we update its `color` and `hint`
      const clozeDeletionNode = $isClozeDeletionNode(firstNode)
        ? firstNode
        : $getClozeDeletionAncestor(firstNode);
      if (clozeDeletionNode !== null) {
        clozeDeletionNode.setColor(color);
        clozeDeletionNode.setHint(hint);
        return;
      }
    }

    let prevParent: ElementNode | ClozeDeletionNode | null = null;
    let clozeDeletionNode: ClozeDeletionNode | null = null;

    nodes.forEach((node) => {
      const parent = node.getParent();

      if (
        parent === clozeDeletionNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return;
      }

      if ($isClozeDeletionNode(parent)) {
        clozeDeletionNode = parent;
        parent.setColor(color);
        parent.setHint(hint);
        return;
      }

      if (!parent.is(prevParent)) {
        prevParent = parent;
        clozeDeletionNode = $createClozeDeletionNode(color, hint);

        if ($isClozeDeletionNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(clozeDeletionNode);
          } else {
            parent.insertAfter(clozeDeletionNode);
          }
        } else {
          node.insertBefore(clozeDeletionNode);
        }
      }

      if ($isClozeDeletionNode(node)) {
        if (node.is(clozeDeletionNode)) {
          return;
        }
        if (clozeDeletionNode !== null) {
          const children = node.getChildren();

          for (const child of children) {
            clozeDeletionNode.append(child);
          }
        }

        node.remove();
        return;
      }

      if (clozeDeletionNode !== null) {
        clozeDeletionNode.append(node);
      }
    });
  }
}

function $getClozeDeletionAncestor(node: LexicalNode): null | LexicalNode {
  return $getAncestor(node, (ancestor) => $isClozeDeletionNode(ancestor));
}
