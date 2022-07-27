import {
  faBrain,
  faDna,
  faLandmarkDome,
  faMonument,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "components/Button";
import GlobalContext from "global";
import useWindowDimensions from "hooks/useWindowDimensions";
import type { NextPage } from "next";
import Image from "next/image";
import { useContext, useMemo } from "react";

const testimonials = [
  "Alu has been a tool that has made studying much less of a burden for me since it is so engaging and straightforward. When studying with Alu, it always truly feels like I am able to take in and understand the material and not just memorize content.", // I completely owe the success I have had on the AP exams I have taken to Alu.',
  "With Alu, I'm able to remember the content [better than with cramming], and it really sticks in your brain after",
  "This is an amazing website. Truly helped me more than I would have been able to do by myself on regular flashcards.",
  "Really useful. Learned a lot of stuff that we didn't cover in class.",
].sort(() => 0.5 - Math.random());

const Index: NextPage = () => {
  const { height } = useWindowDimensions();
  // const { setSignUpModalOpen, setLogInModalOpen } = useContext(GlobalContext);

  const exampleDecks = useMemo(
    () => [
      { title: "AP World History", link: "/l/world", icon: faMonument },
      { title: "AP Psychology", link: "/l/psych", icon: faBrain },
      { title: "AP US Government", link: "/l/usgov", icon: faLandmarkDome },
      { title: "AP Biology", link: "/l/bio", icon: faDna },
      {
        title: "Create Your Own!",
        onClick: () => setSignUpModalOpen(true),
        icon: faPlus,
      },
    ],
    // [setSignUpModalOpen]
    []
  );

  return (
    <div>
      <div
        style={{ height: `${height - 100}px` }}
        className="w-100 bg-alu-dark-purple"
      >
        <div className="grid h-full items-center text-center md:grid-cols-1 lg:grid-cols-2 lg:text-left">
          <div className="mx-6 rounded-2xl bg-white py-10 text-alu-dark-purple shadow-lg shadow-violet-400/40 md:mx-16">
            <div className="sm:px-5 md:px-6 xl:px-9">
              <h1 className="mb-3 text-2xl font-bold md:mb-8 md:text-4xl xl:text-5xl">
                Learn Anything.
                <br />
                Remember Everything.
              </h1>
            </div>
            <div className="px-10">
              <p className="text-md mb-10 xl:text-xl 2xl:text-2xl">
                Flashcards that automatically optimize when you should review
                them.
                <br />
                Spend less time studying and get more out of it.
              </p>
              <div className="text-center">
                <Button
                  block
                  onClick={() => setSignUpModalOpen(true)}
                  className="max-w-2xl text-lg"
                >
                  Get Started
                </Button>
                <p className="mt-4 text-sm md:text-base">
                  Already have an account?{" "}
                  <span
                    className="cursor-pointer text-blue-400 underline hover:text-blue-500"
                    onClick={() => setLogInModalOpen(true)}
                  >
                    Log-in
                  </span>{" "}
                  instead
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="w-100 flex bg-alu-dark-purple"
        style={{ height: "100px" }}
      >
        <div className="hidden w-full bg-white/10 lg:block">
          <div className="relative top-1/2 -translate-y-1/2 text-center text-lg">
            <ul>
              {exampleDecks.map((exampleDeck, i) => (
                <li
                  key={i}
                  className="mx-2 inline-block cursor-pointer rounded-full
                         bg-white bg-opacity-20 p-0 text-white
                         text-opacity-60 hover:bg-opacity-30 hover:text-opacity-100"
                >
                  <a
                    href={exampleDeck.link}
                    onClick={exampleDeck.onClick}
                    className="block px-4 py-2"
                  >
                    <FontAwesomeIcon icon={exampleDeck.icon} className="mr-2" />
                    {exampleDeck.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-10 px-2">
        <div className="mb-5 text-center">
          <h1 className="mb-5 text-2xl font-semibold">
            What People Are Saying
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="mx-4 mb-4 flex items-center rounded-xl border-4 border-alu-primary-purple p-4"
              >
                <p className="italic">"{testimonial}"</p>
              </div>
            ))}
          </div>
        </div>
        <hr />
        <div className="mt-5">
          <h1 className="text-center text-2xl font-bold">
            How Alu Can Help You
          </h1>
          <div className="help-section">
            <div className="help-section-text">
              <div>
                <h2>Spaced Repetition</h2>
                <p>
                  Spaced repetition enables you to memorize more effectively by
                  automatically putting intervals between when you review
                  material
                </p>
              </div>
            </div>
            <div className="help-section-image">
              <Image
                src="/assets/spaced-repetition.png"
                alt="Graph depicting how memory decays over time, and how spaced repetition can be used to combat that"
                loading="lazy"
                width={973}
                height={731}
              />
            </div>
          </div>
          <div className="help-section">
            <div className="help-section-image">
              <Image
                src="/assets/global-sharing-system.png"
                alt="Illustration of Alu's sharing system, and how people from around the world can contribute to a deck"
                className="ml-auto"
                loading="lazy"
                width={960}
                height={720}
              />
            </div>
            <div className="help-section-text">
              <div>
                <h2>Global Sharing System</h2>
                <p>Easily share and collaborate on flashcard decks</p>
              </div>
            </div>
          </div>
          <div className="help-section">
            <div className="help-section-text">
              <div>
                <h2>Skill Tree</h2>
                <p>
                  Organize decks into units and subunits that make it easy to
                  review specific content, or an entire course
                </p>
              </div>
            </div>
            <div className="help-section-image">
              <Image
                src="/assets/skill-tree.png"
                alt="Illustration of an example skill tree"
                loading="lazy"
                width={960}
                height={720}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mb-10 max-w-xl px-3 text-center">
        <p className="text-xl font-bold">
          Ready to memorize more of what you learn?
        </p>
        <Button
          className="mx-auto mt-1 text-center"
          onClick={() => setSignUpModalOpen(true)}
          block
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
