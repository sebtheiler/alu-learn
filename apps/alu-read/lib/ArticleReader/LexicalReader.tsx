import { useCallback, useState, useEffect, useContext } from "react";
import type { EditorState } from "lexical";
import { useDebounce } from "helpers-lib/src/hooks/useDebounce";
import LexicalEditor from "lexical-editor/src/LexicalEditor";
import { trpc, trpcNonReact } from "../../src/app/util";
import { MergedObject } from "../../types";
import { GlobalContext } from "../../src/app/globalContext";
import createExtractFromHtml from "../../helpers/createExtractFromHtml";
import Button from "alu-ui/src/Button";

const LexicalReader: React.FC<{ object: MergedObject }> = ({ object }) => {
  const { selectedObject } = useContext(GlobalContext);
  const [initEditorState, setInitEditorState] = useState<any>(null);
  const utils = trpc.useContext();

  // Change the editor state whenever the object changes
  useEffect(() => {
    (async () => {
      if (object.objectType === "ARTICLE") {
        const initState = await trpcNonReact.file.read.query(object.dataPath);
        setInitEditorState(JSON.parse(initState));
      } else if (object.objectType === "EXTRACT") {
        setInitEditorState(JSON.parse(object.data));
      }
    })();
  }, [object]);

  // Save changes to the article
  const [updatedState, setUpdatedState] = useState<{
    objectId: string;
    state: EditorState;
  } | null>(null);
  const debouncedUpdatedState = useDebounce(updatedState, 1000);
  useEffect(() => {
    if (
      object &&
      selectedObject &&
      updatedState &&
      selectedObject.id === updatedState.objectId &&
      debouncedUpdatedState &&
      JSON.stringify(updatedState.state) ===
        JSON.stringify(debouncedUpdatedState.state)
    ) {
      const data = JSON.stringify(updatedState.state);
      switch (object.objectType) {
        case "ARTICLE":
          trpcNonReact.file.write.mutate({
            filePath: object.dataPath,
            data,
          });
          break;
        case "EXTRACT":
          trpcNonReact.extract.update.mutate({
            id: object.id,
            data,
          });
          break;
      }
    }
  }, [debouncedUpdatedState, updatedState, object, selectedObject]);

  // Create an extract from some HTML that comes from the Lexical editor
  const createExtractCallback = useCallback(createExtractFromHtml, []);

  const [aluLearnWindowId, setAluLearnWindowId] = useState<string | null>(null);
  const [showCreateFlashcardsView, setShowCreateFlashcardsView] =
    useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const aluLearnWindow = document.getElementById("aluLearnWindow");
      if (!aluLearnWindow) return;
      const boundingRect = aluLearnWindow.getBoundingClientRect();
      const OFFSET = 50;
      const x = boundingRect.x - OFFSET;
      const width = boundingRect.width + OFFSET * 2;
      const { y, height } = boundingRect;
      if (aluLearnWindowId) {
        trpcNonReact.electron.resizeBrowserView.mutate({
          id: aluLearnWindowId,
          x,
          y,
          width,
          height,
        });
      } else {
        trpcNonReact.electron.newBrowserView
          .mutate({
            url:
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000/alu-read/create-flashcards"
                : "https://alulearn.com/alu-read/create-flashcards",
            x,
            y,
            width,
            height,
          })
          .then((id) => setAluLearnWindowId(id));

        window.appApi.setCurrentExtractId(object.id);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [aluLearnWindowId, showCreateFlashcardsView, object]);

  useEffect(() => {
    return () => {
      if (aluLearnWindowId) {
        trpcNonReact.electron.destroyBrowserView.mutate(aluLearnWindowId);
      }
    };
  }, [aluLearnWindowId]);

  return (
    <div>
      {initEditorState ? (
        <LexicalEditor
          namespace="articleReader"
          editorState={JSON.stringify(initEditorState)}
          onChange={(state) =>
            setUpdatedState({
              objectId: object.id,
              state,
            })
          }
          createExtractCallback={(html) =>
            createExtractCallback(html, object, utils)
          }
          maxLength={0}
          editable
          isPro
        />
      ) : (
        <p>Loading...</p>
      )}
      {object.objectType === "EXTRACT" && (
        <>
          <Button
            onClick={() => {
              if (showCreateFlashcardsView && aluLearnWindowId) {
                trpcNonReact.electron.destroyBrowserView.mutate(
                  aluLearnWindowId
                );
                setAluLearnWindowId(null);
              }
              setShowCreateFlashcardsView(!showCreateFlashcardsView);
            }}
            className="mt-5"
          >
            {showCreateFlashcardsView ? "Hide" : "Show"} Flashcard Creator
          </Button>
          {showCreateFlashcardsView && (
            <div className="my-12 h-[500px]" id="aluLearnWindow" />
          )}
        </>
      )}
    </div>
  );
};

export default LexicalReader;
