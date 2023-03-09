import { TWO_SIDED_FLASHCARDS } from "@/globals";
import FlashcardCreator from "@/pages/CreateFlashcardsPage/FlashcardCreator";
import { useMutation } from "@apollo/client";
import useProStore from "@/stores/proStore";
import type {
  FlashcardType,
  Mutation,
  MutationCreateFlashcardArgs,
} from "@/types";
import type { EditorState } from "lexical";
import flattenLexical from "lexical-editor/src/helpers/flattenLexical";
import type { GetServerSideProps } from "next";
import { useState } from "react";
import type { NextPage } from "types";
import CreateFlashcard from "graphql-operations/operations/CreateFlashcard";

declare global {
  interface Window {
    electron: {
      getCurrentExtractId(): Promise<string>;
    };
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

const AluReadCreateFlashcards: NextPage = () => {
  const isPro = useProStore((store) => store.isPro);
  const [error, setError] = useState("");
  const [createFlashcard] = useMutation<
    { createFlashcard: Mutation["createFlashcard"] },
    MutationCreateFlashcardArgs
  >(CreateFlashcard);

  const createFlashcardHandler = async ({
    frontEditorState,
    backEditorState,
    flashcardType,
    tags,
  }: {
    frontEditorState: EditorState;
    backEditorState: EditorState | undefined;
    flashcardType: FlashcardType;
    tags: string;
  }) => {
    if (
      flattenLexical(JSON.stringify(frontEditorState))?.length === 0 ||
      (TWO_SIDED_FLASHCARDS.includes(flashcardType) &&
        flattenLexical(JSON.stringify(backEditorState))?.length === 0)
    ) {
      setError("BLANK_SIDE");
      return;
    }
    setError("");

    let fields: string;
    if (TWO_SIDED_FLASHCARDS.includes(flashcardType)) {
      fields = JSON.stringify([frontEditorState, backEditorState]);
    } else {
      fields = JSON.stringify([frontEditorState]);
    }

    const extractId = await window.electron?.getCurrentExtractId();
    if (!extractId)
      throw new Error(
        "Couldn't get current extract ID. Is the window running through Alu Read?"
      );

    await createFlashcard({
      variables: {
        fields,
        tags,
        flashcardType,
        isForAluRead: true,
        extractId,
      },
    });
  };

  return (
    <FlashcardCreator
      createFlashcardCallback={createFlashcardHandler}
      isPro={isPro}
      error={error}
    />
  );
};
AluReadCreateFlashcards.authRequired = true;

export default AluReadCreateFlashcards;
