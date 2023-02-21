/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import TRANSFORMERS from "./transformers";
import { MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import * as React from "react";

export default function MarkdownShortcutPlugin(): JSX.Element {
  return <LexicalMarkdownShortcutPlugin transformers={TRANSFORMERS} />;
}
