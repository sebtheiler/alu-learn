import $getAncestor from "@/lexicalEditor/helpers/getAncestor";
import { addClassNamesToElement } from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  EditorConfig,
  ElementNode,
  GridSelection,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
} from "lexical";
import type { SerializedElementNode, Spread } from "lexical";

export type SerializedFlashcardLinkNode = Spread<
  {
    type: "flashcardlink";
    flashcardId: string;
    version: 1;
  },
  SerializedElementNode
>;

export class FlashcardLinkNode extends ElementNode {
  /** @internal */
  __flashcardId: string;

  static getType(): string {
    return "flashcardlink";
  }

  static clone(node: FlashcardLinkNode): FlashcardLinkNode {
    return new FlashcardLinkNode(node.__flashcardId, node.__key);
  }

  constructor(flashcardId: string, key?: NodeKey) {
    super(key);
    this.__flashcardId = flashcardId;
  }

  createDOM(config: EditorConfig): HTMLSpanElement {
    const element = document.createElement("span");
    element.dataset.isFlashcardLink = "true";
    element.dataset.flashcardId = this.__flashcardId;
    addClassNamesToElement(element, config.theme.flashcardLink);
    return element;
  }

  updateDOM(prevNode: FlashcardLinkNode, span: HTMLSpanElement): boolean {
    const flashcardId = this.__flashcardId;
    if (flashcardId !== prevNode.__flashcardId) {
      span.dataset.flashcardId = flashcardId;
    }

    return false;
  }

  static importJSON(
    serializedNode: SerializedFlashcardLinkNode
  ): FlashcardLinkNode {
    const node = $createFlashcardLinkNode(serializedNode.flashcardId);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedFlashcardLinkNode {
    return {
      ...super.exportJSON(),
      flashcardId: this.getFlashcardId(),
      type: "flashcardlink",
      version: 1,
    };
  }

  getFlashcardId(): string {
    return this.getLatest().__flashcardId;
  }

  setFlashcardId(flashcardId: string): void {
    const writable = this.getWritable();
    writable.__flashcardId = flashcardId;
  }

  insertNewAfter(selection: RangeSelection): FlashcardLinkNode | null {
    const element = this.getParentOrThrow().insertNewAfter(selection);
    if ($isElementNode(element)) {
      const flashcardLinkNode = $createFlashcardLinkNode(this.__flashcardId);
      element.append(flashcardLinkNode);
      return flashcardLinkNode;
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

export function $createFlashcardLinkNode(
  flashcardId: string
): FlashcardLinkNode {
  return new FlashcardLinkNode(flashcardId);
}

export function $isFlashcardLinkNode(
  node: LexicalNode | null | undefined
): node is FlashcardLinkNode {
  return node instanceof FlashcardLinkNode;
}

export function toggleFlashcardLink(flashcardId: string): void {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();

  if (flashcardId === null) {
    // Remove FlashcardLinkNodes
    nodes.forEach((node) => {
      const parent = node.getParent();

      if ($isFlashcardLinkNode(parent)) {
        const children = parent.getChildren();

        for (const child of children) {
          parent.insertBefore(child);
        }

        parent.remove();
      }
    });
  } else {
    // Add or merge FlashcardLinkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // If the first node is a FlashcardLinkNode or if its
      // parent is a FlashcardLinkNode we update its `flashcardId`
      const flashcardLinkNode = $isFlashcardLinkNode(firstNode)
        ? firstNode
        : $getFlashcardLinkAncestor(firstNode);
      if (flashcardLinkNode !== null) {
        flashcardLinkNode.setFlashcardId(flashcardId);
        return;
      }
    }

    let prevParent: ElementNode | FlashcardLinkNode | null = null;
    let flashcardLinkNode: FlashcardLinkNode | null = null;

    nodes.forEach((node) => {
      const parent = node.getParent();

      if (
        parent === flashcardLinkNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return;
      }

      if ($isFlashcardLinkNode(parent)) {
        flashcardLinkNode = parent;
        parent.setFlashcardId(flashcardId);
        return;
      }

      if (!parent.is(prevParent)) {
        prevParent = parent;
        flashcardLinkNode = $createFlashcardLinkNode(flashcardId);

        if ($isFlashcardLinkNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(flashcardLinkNode);
          } else {
            parent.insertAfter(flashcardLinkNode);
          }
        } else {
          node.insertBefore(flashcardLinkNode);
        }
      }

      if ($isFlashcardLinkNode(node)) {
        if (node.is(flashcardLinkNode)) {
          return;
        }
        if (flashcardLinkNode !== null) {
          const children = node.getChildren();

          for (const child of children) {
            flashcardLinkNode.append(child);
          }
        }

        node.remove();
        return;
      }

      if (flashcardLinkNode !== null) {
        flashcardLinkNode.append(node);
      }
    });
  }
}

function $getFlashcardLinkAncestor(node: LexicalNode): null | LexicalNode {
  return $getAncestor(node, (ancestor) => $isFlashcardLinkNode(ancestor));
}
