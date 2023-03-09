import Button from "alu-ui/src/Button";
import TextInput from "alu-ui/src/TextInput";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { formatStartDurationTime } from "../../helpers/formatSeconds";
import { MergedObject } from "../../types";
import { trpc, trpcNonReact } from "../../src/app/util";
import matchesShortcut from "../../keyboardShortcuts";
import LexicalEditor from "lexical-editor/src/LexicalEditor";

type ExtractClip = {
  dataPath: string; // URL
  start: number;
  duration: number;
};

const DEFAULT_EXTRACT_LENGTH = 15;

const VideoPlayer: React.FC<{ object: MergedObject }> = ({ object }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [extractLengthSeconds, setExtractLengthSeconds] = useState(
    DEFAULT_EXTRACT_LENGTH
  );
  const utils = trpc.useContext();

  const dataPath = useMemo(
    () =>
      object.objectType === "ARTICLE"
        ? object.dataPath
        : JSON.parse(object.data).dataPath,
    [object]
  );
  const extractClipData = useMemo<ExtractClip | undefined>(
    () =>
      object.objectType === "EXTRACT" && object.type === "VIDEO_TIMESTAMP"
        ? JSON.parse(object.data)
        : undefined,
    [object]
  );

  const createVideoExtract = useCallback(() => {
    if (!playerRef.current) return;
    const time = playerRef.current.getCurrentTime();

    trpcNonReact.extract.create
      .mutate({
        type: "VIDEO_TIMESTAMP",
        data: JSON.stringify({
          dataPath,
          start: Math.floor(time),
          duration: Math.round(extractLengthSeconds),
        } as ExtractClip),
        parentArticleId:
          object.objectType === "ARTICLE" ? object.id : undefined,
        parentExtractId:
          object.objectType === "EXTRACT" ? object.id : undefined,
      })
      .finally(() => {
        utils.extract.all.invalidate();
        utils.article.all.invalidate();
        setExtractLengthSeconds(DEFAULT_EXTRACT_LENGTH);
      });
  }, [utils, object, dataPath, extractLengthSeconds]);

  const [writtenState, setWrittenState] = useState<any>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const createWrittenExtract = useCallback(async () => {
    await trpcNonReact.extract.create.mutate({
      type: "LEXICAL",
      data: JSON.stringify(writtenState),
      parentArticleId: object.objectType === "ARTICLE" ? object.id : undefined,
      parentExtractId: object.objectType === "EXTRACT" ? object.id : undefined,
    });
    utils.extract.all.invalidate();
    utils.article.all.invalidate();
    clearRef.current?.click();
  }, [object, utils, writtenState]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (matchesShortcut("createExtract", event)) {
        createVideoExtract();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [createVideoExtract]);

  return (
    <div>
      {extractClipData && (
        <h2 className="text-2xl italic text-center text-gray-600">
          {formatStartDurationTime(extractClipData)}
        </h2>
      )}
      <div className="relative pt-[56.25%]">
        <ReactPlayer
          url={dataPath}
          ref={playerRef}
          onStart={() => {
            const startTime =
              extractClipData?.start ??
              (object.objectType === "ARTICLE" && object.readingPoint
                ? parseInt(object.readingPoint)
                : undefined);
            if (startTime && playerRef.current)
              playerRef.current.seekTo(startTime);
          }}
          onProgress={({ playedSeconds }) => {
            if (
              object.objectType === "ARTICLE" &&
              Math.floor(playedSeconds) % 15 === 0 &&
              playedSeconds > 1
            )
              trpcNonReact.article.update.mutate({
                id: object.id,
                readingPoint: Math.floor(playedSeconds).toString(),
              });
          }}
          controls
          className="absolute top-0 left-0"
          width="100%"
          height="100%"
        />
      </div>
      <hr className="my-3" />
      <Button onClick={createVideoExtract} className="mb-1" block>
        Create Video Extract
      </Button>
      <TextInput
        onChange={(e) => setExtractLengthSeconds(parseInt(e.target.value))}
        value={extractLengthSeconds}
        type="number"
        label="Extract Length (seconds)"
      />
      <hr className="my-10" />
      <h3 className="font-bold text-xl">Create Written Extract</h3>
      <LexicalEditor
        namespace="videoExtract"
        // editorState={JSON.stringify(initEditorState)}
        onChange={(state) => setWrittenState(state)}
        clearEditorRef={clearRef}
        maxLength={0}
        editable
        isPro
      />
      <Button onClick={createWrittenExtract} className="mt-1" block>
        Create Written Extract
      </Button>
    </div>
  );
};

export default VideoPlayer;
