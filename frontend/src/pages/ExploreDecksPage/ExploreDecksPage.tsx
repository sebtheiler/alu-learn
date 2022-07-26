import DisplayProfileInline from "components/DisplayProfileInline";
import RenderRichText from "editor/RenderRichText";
import createSlateElement from "helpers/createSlateElement";
import { Fragment } from "react";
import Link from "next/link";

const exampleUser = {
  firstName: "Example",
  lastName: "User",
  username: "exampleuser",
};

const sharedDecks = [
  {
    title: "Example Shared Deck #1",
    description: createSlateElement("Example Description"),
    owners: [exampleUser],
    numCopies: 50,
    id: 1,
  },
];

/**
 * Renders the explore deck page for finding shared decks
 */
export default function ExploreDecksPage() {
  return (
    <div className="container px-48 mx-auto mt-28">
      <div>
        <h1 className="text-4xl font-bold mb-3">Explore</h1>
        <p className="text-lg">
          Find top decks created by others to help you study
        </p>
      </div>
      <hr className="my-3" />
      <div>
        {sharedDecks.map((sharedDeck) => (
          <div
            className="bg-alu-light-gray border-4 border-alu-mid-gray px-6 py-4 rounded-xl"
            key={sharedDeck.id}
          >
            <div>
              <p className="float-right -translate-y-1">
                Created by{" "}
                {sharedDeck.owners.map((owner, i) => (
                  <Fragment key={i}>
                    <DisplayProfileInline profile={owner} />
                    {i !== sharedDeck.owners.length - 1 && ", "}
                  </Fragment>
                ))}
                <br />
                {sharedDeck.numCopies}{" "}
                {sharedDeck.numCopies === 1 ? "copy" : "copies"}
              </p>
              <h1 className="text-4xl font-bold my-2 text-blue-500 hover:text-blue-600 hover:underline">
                <Link href={`/community/decks/${sharedDeck.id}/`}>
                  {sharedDeck.title}
                </Link>
              </h1>
              <hr className="my-3" />
            </div>
            <div className="body">
              <RenderRichText text={sharedDeck.description} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
