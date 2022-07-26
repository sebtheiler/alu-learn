import type { ExtendedSlateElement } from "editor/types";

export default function createSlateElement(
  text: string
): ExtendedSlateElement[] {
  return [
    {
      type: "paragraph",
      children: [
        {
          text: text,
        },
      ],
    },
  ];
}
