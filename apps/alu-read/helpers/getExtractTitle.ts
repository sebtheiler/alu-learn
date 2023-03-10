import type { Extract } from "../src/generated/client";
import flattenLexical from "lexical-editor/src/helpers/flattenLexical";
import { formatStartDurationTime } from "./formatSeconds";

const getExtractTitle = (extract: Extract) =>
  extract.type === "LEXICAL"
    ? flattenLexical(extract.data).slice(0, 32)
    : extract.type === "VIDEO_TIMESTAMP"
    ? `Timestamp: ${formatStartDurationTime(JSON.parse(extract.data))}`
    : "Extract";

export default getExtractTitle;
