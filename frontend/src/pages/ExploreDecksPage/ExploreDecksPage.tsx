import DisplayUserInline from "@/components/DisplayUserInline";
import RenderRichText from "@/editor/RenderRichText";
import SEO from "@/helpers/SEO";
import createSlateElement from "@/helpers/createSlateElement";
import Link from "next/link";
import { Fragment } from "react";

const exampleUser = {
  name: "Example User",
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

export default function ExploreDecksPage() {
  return (
    <>
      <SEO
        title="Explore Decks"
        path="/explore/decks"
        // description=""  TODO: (SEO) set description
      />
      <div className="container mx-auto mt-28 px-48">
        <div>
          <h1 className="mb-3 text-4xl font-bold">Explore</h1>
          <p className="text-lg">
            Find top decks created by others to help you study
          </p>
        </div>
        <hr className="my-3" />
        <div>
          {sharedDecks.map((sharedDeck) => (
            <div
              className="rounded-xl border-4 border-alu-mid-gray bg-alu-light-gray px-6 py-4"
              key={sharedDeck.id}
            >
              <div>
                <p className="float-right -translate-y-1">
                  Created by{" "}
                  {sharedDeck.owners.map((owner, i) => (
                    <Fragment key={i}>
                      <DisplayUserInline user={owner} />
                      {i !== sharedDeck.owners.length - 1 && ", "}
                    </Fragment>
                  ))}
                  <br />
                  {sharedDeck.numCopies}{" "}
                  {sharedDeck.numCopies === 1 ? "copy" : "copies"}
                </p>
                <h1 className="my-2 text-4xl font-bold text-blue-500 hover:text-blue-600 hover:underline">
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
    </>
  );
}
