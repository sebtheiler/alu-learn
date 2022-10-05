/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import TextInput from "@/atoms/TextInput";
import classNames from "@/helpers/classNames";
import ImageResizer from "@/lexicalEditor/ImageResizer";
import {
  faArrowUpRightFromSquare,
  faEye,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  GridSelection,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import Image from "next/image";
import * as React from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

export interface ImagePayload {
  caption?: string;
  sourceUrl?: string;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  src: string;
  width?: number;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src } = domNode;
    const node = $createImageNode({ caption: altText, src, sourceUrl: src });
    return { node };
  }
  return null;
}

function ImageComponent({
  src,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  caption,
  sourceUrl,
}: {
  caption: string;
  sourceUrl: string;
  height: number;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  src: string;
  width: number;
}): JSX.Element {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageParentRef = useRef<HTMLDivElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<
    RangeSelection | NodeSelection | GridSelection | null
  >(null);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [captionValue, setCaptionValue] = useState(caption);
  const [sourceUrlValue, setSourceUrlValue] = useState(sourceUrl);
  const [editingCaption, setEditingCaption] = useState(false);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
        setSelected(false);
      }
      return false;
    },
    [isSelected, nodeKey, setSelected]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (isResizing) {
            return true;
          }
          if (event.target === imageRef.current) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    onDelete,
    setSelected,
  ]);

  const onResizeEnd = (nextWidth: number, nextHeight: number) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const draggable = isSelected && $isNodeSelection(selection);
  const isFocused = isSelected || isResizing;

  const toggleEditingCaption = () => {
    if (editingCaption) {
      setEditingCaption(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setCaption(captionValue);
          node.setSourceUrl(sourceUrlValue);
        }
      });
    } else {
      setEditingCaption(true);
    }
  };

  return (
    <Suspense fallback={null}>
      <>
        <div className="inline-block relative select-none">
          <div className="inline-block relative select-none">
            <div draggable={draggable}>
              <div
                className={classNames(
                  "relative",
                  isFocused && "outline outline-2 outline-blue-400"
                )}
                style={{
                  width,
                  height,
                  maxWidth,
                  maxHeight:
                    width > maxWidth ? (maxWidth / width) * height : undefined,
                }}
                ref={imageParentRef}
              >
                <Image
                  className={classNames(
                    isFocused && "outline outline-2 outline-blue-400",
                    isFocused &&
                      $isNodeSelection(selection) &&
                      "cursor-grab active:cursor-grabbing"
                  )}
                  onLoad={(e) =>
                    (imageRef.current = e.target as HTMLImageElement)
                  }
                  src={src}
                  alt={caption}
                  layout="fill"
                  draggable="false"
                />
              </div>
            </div>
            {resizable && $isNodeSelection(selection) && isFocused && (
              <ImageResizer
                editor={editor}
                imageRef={imageRef}
                imageParentRef={imageParentRef}
                maxWidth={maxWidth}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
              />
            )}
          </div>
          <div className="block text-center -translate-y-2 w-full">
            <div>
              {!editingCaption &&
                (sourceUrlValue.length > 0 ? (
                  <a
                    href={sourceUrlValue}
                    target="_blank"
                    rel="nofollow noreferrer ugc"
                    className="text-blue-500"
                  >
                    {captionValue}{" "}
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      title="View Source URL"
                      size="sm"
                    />
                  </a>
                ) : (
                  captionValue
                ))}
            </div>
            <div>
              {editingCaption && (
                <>
                  <TextInput
                    label="Caption"
                    className="w-full mb-2"
                    value={captionValue}
                    onChange={(e) => setCaptionValue(e.target.value)}
                    autoFocus
                  />
                  <TextInput
                    label="Source URL (optional)"
                    className="w-full"
                    value={sourceUrlValue}
                    onChange={(e) => setSourceUrlValue(e.target.value)}
                  />
                </>
              )}
              {(isSelected || editingCaption) && (
                <FontAwesomeIcon
                  icon={editingCaption ? faEye : faPencil}
                  title={editingCaption ? "Save and View" : "Edit Caption"}
                  className="absolute right-0 -top-1 hover:cursor-pointer bg-gray-50 p-2 rounded-full"
                  onClick={toggleEditingCaption}
                />
              )}
            </div>
          </div>
        </div>
      </>
    </Suspense>
  );
}

export type SerializedImageNode = Spread<
  {
    caption: string;
    sourceUrl: string;
    height?: number;
    maxWidth: number;
    src: string;
    width?: number;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __width: number;
  __height: number;
  __maxWidth: number;
  __caption: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__caption,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { height, width, maxWidth, caption, sourceUrl, src } = serializedNode;
    const node = $createImageNode({
      height,
      maxWidth,
      src,
      width,
      caption,
      sourceUrl,
    });

    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__caption);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    maxWidth: number,
    width: number,
    height: number,
    caption?: string,
    sourceUrl?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__maxWidth = maxWidth;
    this.__width = width;
    this.__height = height;
    this.__caption = caption ?? "";
    this.__sourceUrl = sourceUrl ?? "";
  }

  exportJSON(): SerializedImageNode {
    return {
      caption: this.getCaption(),
      sourceUrl: this.getSourceUrl(),
      height: this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: "image",
      version: 1,
      width: this.__width,
    };
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  setSourceUrl(sourceUrl: string): void {
    const writable = this.getWritable();
    writable.__sourceUrl = sourceUrl;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getCaption(): string {
    return this.__caption;
  }

  getSourceUrl(): string {
    return this.__sourceUrl;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        caption={this.__caption}
        sourceUrl={this.__sourceUrl}
        resizable={true}
      />
    );
  }
}

export function $createImageNode({
  height,
  maxWidth = 500,
  src,
  width,
  caption,
  sourceUrl,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(
    src,
    maxWidth,
    width ?? 128,
    height ?? 128,
    caption,
    sourceUrl,
    key
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
