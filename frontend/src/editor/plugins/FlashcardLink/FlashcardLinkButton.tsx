import { insertFlashCardLink } from "./helpers";
import { faAnchor } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Popover from "atoms/Popover";
import TextInput from "atoms/TextInput";
import Tooltip from "atoms/Tooltip";
import flattenNodes from "helpers/flattenNodes";
import { useDebounce } from "hooks/useDebounce";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactEditor } from "slate-react";
import type { FlashCard } from "types";

interface FlashcardLinkButtonProps {
  /**
   * Editor into which to insert the flashcard link
   */
  editor: ReactEditor;
  /**
   * Is the button selectable with tab?
   */
  tabbable: boolean;
  /**
   * Is the user a pro user? If not, they cannot insert flashcard links
   */
  isPro: boolean;
}

/**
 * Displays a button to insert a flashcard link into an editor
 */
export default function FlashcardLinkButton({
  editor,
  tabbable,
  isPro,
}: FlashcardLinkButtonProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedFlashcards, setSearchedFlashcards] = useState<FlashCard[]>([]);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 750);

  useEffect(() => {
    if (debouncedSearchTerm === searchTerm && searchTerm.length > 0) {
      setIsSearching(true);
      // backendFetch<PaginatedResponse<FlashCard>>('POST', 'decks/flashcard/search/', {
      //   contains_text: searchTerm,
      // }).then(resp => {
      //   setSearchedFlashcards(resp.results);
      //   setIsSearching(false);
      // });
    } else {
      setSearchedFlashcards([]);
    }
  }, [debouncedSearchTerm, searchTerm]);

  return (
    <Popover
      popover={
        <div>
          <div className="text-center">
            <h3 className="text-md font-bold">Insert Flashcard Link</h3>
            {!isPro && (
              <small className="text-blue-500 hover:underline">
                <Link href="/pro">(pro-only)</Link>
                <br />
              </small>
            )}
            <p className="mt-2 text-sm text-gray-700">
              This will allow you to see a preview of a flashcard when studying
              by hovering the flashcard link
            </p>
            <hr className="my-3" />
          </div>
          <div>
            <div className="text-center">
              <p className="mb-1">Search for Flashcard</p>
              <TextInput
                onChange={(e) => setSearchTerm(e.target.value)}
                label="Search"
                className="bg-white"
                disabled={!isPro}
              />
              {!isPro && (
                <p className="mt-3">
                  Upgrade to{" "}
                  <Link href="/pro" className="text-blue-500">
                    pro
                  </Link>{" "}
                  to use flashcard links
                </p>
              )}
              {isSearching && <p className="mt-3">Loading…</p>}
            </div>
            {searchedFlashcards.length > 0 && <hr />}
            <div>
              {searchedFlashcards.map((flashcard) => (
                <p
                  className="searched-item"
                  onClick={() => insertFlashCardLink(editor, flashcard)}
                  key={flashcard.id}
                >
                  {flattenNodes(flashcard.data.fields[0])}
                </p>
              ))}
            </div>
          </div>
        </div>
      }
      trigger="click"
      className="w-96"
      placement="bottom"
    >
      <Tooltip tooltip="Insert Flashcard Link" className="w-36">
        <button
          style={{
            background: "rgba(0, 0, 0, 0)",
            border: "none",
          }}
          tabIndex={tabbable ? undefined : -1}
          className="text-dark"
        >
          <FontAwesomeIcon icon={faAnchor} />
        </button>
      </Tooltip>
    </Popover>
  );
}
