interface Options {
  verticalGap?: number;
  horizontalOffset?: number;
  verticalOffset?: number;
}

const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;
const VERTICAL_OFFSET = 0;

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  options: Options = {}
): void {
  const {
    verticalGap = VERTICAL_GAP,
    horizontalOffset = HORIZONTAL_OFFSET,
    verticalOffset = VERTICAL_OFFSET,
  } = options;
  const scrollerElem = anchorElem.parentElement;

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0";
    floatingElem.style.top = "-10000px";
    floatingElem.style.left = "-10000px";

    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = scrollerElem.getBoundingClientRect();

  console.log({
    targetRect,
    floatingElemRect,
    anchorElementRect,
    editorScrollerRect,
  });

  let top =
    targetRect.y - floatingElemRect.height - verticalGap + verticalOffset;
  let left = targetRect.left - horizontalOffset;

  if (top < editorScrollerRect.y) {
    top += floatingElemRect.height + targetRect.height + verticalGap * 2;
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
  }

  top -= anchorElementRect.y;
  left -= anchorElementRect.left;
  console.log({ top, left });

  floatingElem.style.opacity = "1";
  floatingElem.style.top = `${top}px`;
  floatingElem.style.left = `${left}px`;
}
