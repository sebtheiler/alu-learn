// import RenderRichText from "../../RenderRichText";
import Popover from "@/atoms/Popover";
import type { ExtendedSlateElement } from "@/editor/types";

// import GetFlashcard from "@/graphql/GetFlashcard";
// import type { GetFlashcardType } from "@/graphql/GetFlashcard";
// import { useQuery } from "@apollo/client";
// import { useState, Fragment } from "react";

interface FlashcardLinkComponentProps {
  /**
   * Attributes passed to the `<span>` element
   */
  attributes: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >;
  /**
   * Children of the `<span>` element
   */
  children: React.ReactNode;
  /**
   * SlateJS Element to render
   */
  element: ExtendedSlateElement;
}

/**
 * Render a link component in the SlateJS editor
 */
export default function FlashcardLinkComponent({
  attributes,
  children,
}: // element,
FlashcardLinkComponentProps) {
  // const [hasOpened, setHasOpened] = useState(false);
  // const { data, loading } = useQuery<GetFlashcardType>(GetFlashcard, {
  //   variables: {
  //     flashcardId: element.flashcardId,
  //   },
  //   skip: !hasOpened, // only run the query after the user has opened the popup
  // });
  // const { getFlashcard: flashcard } = data ?? {};

  return (
    <Popover
      popover={
        <div>
          <h3 className="text-md mb-3 text-center font-bold">
            Flashcard Preview
          </h3>
          {/* {!loading &&
            flashcard &&
            flashcard.fields.value.map((field, i: number) => (
              <Fragment key={i}>
                {i !== 0 && <hr className="my-2" />}
                <div key={i} className="flex justify-center items-center">
                  <RenderRichText text={field} />
                </div>
              </Fragment>
            ))} */}
          {/* {loading && <p>Loading flashcard...</p>} */}
        </div>
      }
      // onOpenCallback={() => setHasOpened(true)}
      className="w-80"
      arrow
    >
      <span {...attributes} className="text-alu-light-purple font-bold">
        {children}
      </span>
    </Popover>
  );
}
