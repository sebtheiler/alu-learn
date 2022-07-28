import DisplayProfileInline from "components/DisplayProfileInline";
import Image from "next/image";

const sebProfile = {
  firstName: "Sebastian",
  lastName: "Theiler",
  username: "sebtheiler",
};

export default function AboutPage() {
  return (
    <article className="container prose mx-auto mt-28 max-w-4xl prose-a:text-blue-500 prose-a:no-underline">
      <h1 className="mx-auto mb-2 text-center text-4xl font-bold">
        Make Memory a Choice.
      </h1>
      <div className="text-center">
        <h3 className="mx-auto mb-1 text-xl font-semibold">
          Alu allows you to learn anything and remember everything
        </h3>
        <p className="mx-auto">
          By using spaced repetition, Alu enables you to turn your memory into a
          steel trap and to choose what you want to remember
        </p>
      </div>
      <hr className="my-4" />

      <div>
        <h2>Why memory? Why Alu?</h2>
        <p>
          Memory isn&apos;t just about cramming. It&apos;s about storing
          information in your mind so that you can make insightful connections
          and have novel ideas. Although it can get a bad rap, memory is vital
          to the creative process. On top of this, by using Alu to reduce the
          amount of time you spend memorizing, you are able to spend more time
          critically engaging with content and working creatively.
        </p>
        <p>
          To help you memorize efficiently, Alu uses spaced repetition, a
          technique that optimizes your memory retention by putting intervals
          between when you study material. Alu&apos;s sharing system also allows
          you to collaborate with others on a deck, so that you don&apos;t need
          to make flashcards all by yourself. Some{" "}
          <a href="/explore" target="_blank">
            community decks
          </a>{" "}
          even allow for contributions from everyone (with approval), so that
          learning is a team effort.
        </p>
        <p>
          In the future, Alu will be more than just flashcards, providing
          lessons that help you learn content. But rather than following the
          traditional way of having a central company dictate what and how
          everyone learns, Alu will enable learners like you to contribute to
          lessons. Think of it like a Wikipedia designed to teach you in the way
          you learn best, that also includes studying features like spaced
          repetition flashcards. This is what I call an{" "}
          <em>open-source education</em>: the learners decide how they learn.
        </p>
      </div>
      <hr />

      <h1 className="text-center">Alu&apos;s Key Features</h1>
      <h2 className="text-center">Spaced Repetition</h2>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2">
        <div>
          <p>
            Memorizing information is boring, but important. Alu seeks to make
            it easier so you can spend more time critically engaging with
            content.
          </p>
          <p>
            Alu does this through <em>spaced repetition</em>. Spaced repetition
            is the process of studying material over spread-out intervals,
            rather than all at once. This is both more efficient and more
            effective than cramming. Alu uses spaced repetition by showing you
            the flashcards you remember better less often, and the flashcards
            you struggle with more often.
          </p>
          <p>
            If you don&apos;t review content, you will forget it. Alu stops
            that.
          </p>
        </div>
        <div>
          <Image
            src="/assets/spaced-repetition.png"
            alt="Graph depicting how memory decays over time, and how spaced repetition can be used to combat that"
            className="w-100"
            loading="lazy"
            width={973}
            height={731}
          />
          <div className="text-center">
            <small className="text-secondary">
              Spaced repetition stops you from forgetting information as fast
            </small>
          </div>
        </div>
      </div>
      <h2 className="text-center">Global Sharing System</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2">
        <div>
          <Image
            src="/assets/global-sharing-system.png"
            alt="Illustration of Alu's sharing system, and how people from around the world can contribute to a deck"
            className="w-100"
            loading="lazy"
            width={960}
            height={720}
          />
        </div>
        <div>
          <p>
            With Alu, you can share flashcards with (or use flashcards from!)
            anyone around the world. Alu&apos;s sharing system also allows you
            to collaborate with friends to build a deck, or even to let anyone
            submit an edit.
          </p>
          <p>
            One of my dreams for Alu is to build engaged and eager communities
            around different subjects, where anyone and everyone can help
            improve decks for subjects that interest them. Alu&apos;s sharing
            system is a step in that direction.
          </p>
        </div>
      </div>
      <h2 className="text-center">Skill Tree</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2">
        <div>
          <p>
            In psychology, one of the major models for how memories are
            organized are hierarchies. Hierarchies start at general subjects,
            and end in specific details.
          </p>
          <p>
            Alu builds off of this structure with <em>skill trees.</em> Skill
            trees are organized into main sections and sub sections, giving you
            a greater level of control over how your flashcards are organized.
            You can review each section individually, or study the deck as a
            whole, all powered by spaced repetition.
          </p>
        </div>
        <div>
          <Image
            src="/assets/skill-tree.png"
            alt="Illustration of an example skill tree"
            className="w-100"
            loading="lazy"
            width={960}
            height={720}
          />
        </div>
      </div>
      <hr />

      <h1 className="mx-auto text-center">The Story of Alu</h1>
      <div className="mt-2 mb-5 grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-3">
          <p>
            Hi! I&apos;m
            <span className="ml-1" />
            <DisplayProfileInline profile={sebProfile} />, a New York high
            school junior, and I created Alu. I&apos;ve been a life-long learner
            and, in the summer of 2020, I sought out to create a tool to help me
            learn more effectively. Inspired by{" "}
            <a
              href="https://supermemo.guru/wiki/SuperMemo_Guru"
              target="_blank"
              rel="noreferrer"
            >
              Dr. Piotr Wozniak
            </a>
            &apos;s philosophy of free schooling and self-guided learning, I
            designed Alu with the core principles of enabling people to learn
            whatever they want and to remember all of it.
          </p>
          <p>
            In the fall of 2020, when I returned to school, I realized how much
            potential Alu had in helping my classmates and I do well in our
            classes&#8212;especially on AP&reg; exams. I worked to make
            flashcard decks for the AP&reg; classes I was taking as quickly as
            possible and share them with my classmates. It caught on! By May
            2021, students at my school and I had studied nearly 80,000 total
            flashcards, and many who used Alu consistently (including myself)
            were able to achieve high scores.
          </p>
          <p>
            In 2022, I hope to work with others to expand Alu to other schools
            and enable more students to take advantage of its spaced repetition
            and free flashcards to do well on their exams and to memorize more
            of what they learn. To help Alu live up to its vision of an
            open-source education, I will also build an even simpler and more
            powerful sharing system that makes collaborating on decks and
            sharing knowledge easier, and allows for creating lessons alongside
            flashcards.
          </p>
        </div>
        <div className="md:col-span-2">
          <Image
            src="/assets/sebastian.jpg"
            alt="Sebastian, the creator of Alu"
            className="mx-auto mb-2 rounded-xl sm:max-w-sm"
            width={1875}
            height={1974}
          />
          <div className="w-full">
            <p className="my-0 text-center">
              <strong>Follow Sebastian</strong>
            </p>
            <div
              className="mx-2 grid grid-cols-3 rounded-full border-4
                            border-gray-200 bg-gray-100 px-4 py-3 text-center"
            >
              <div className="flex items-center">
                <a
                  href="https://twitter.com/seb_theiler"
                  target="_blank"
                  rel="noreferrer"
                  className="mx-auto transition hover:scale-125"
                >
                  {/* https://github.com/johan/svg-cleanups/blob/master/logos/twitter.svg */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 335 276"
                    fill="#3ba9ee"
                    className="w-10"
                  >
                    <path d="m302 70a195 195 0 0 1 -299 175 142 142 0 0 0 97 -30 70 70 0 0 1 -58 -47 70 70 0 0 0 31 -2 70 70 0 0 1 -57 -66 70 70 0 0 0 28 5 70 70 0 0 1 -18 -90 195 195 0 0 0 141 72 67 67 0 0 1 116 -62 117 117 0 0 0 43 -17 65 65 0 0 1 -31 38 117 117 0 0 0 39 -11 65 65 0 0 1 -32 35" />
                  </svg>
                </a>
              </div>
              <div className="flex items-center">
                <a
                  href="https://github.com/sebtheiler"
                  target="_blank"
                  rel="noreferrer"
                  className="mx-auto transition hover:scale-125"
                >
                  {/* https://iconmonstr.com/github-1-svg/ */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#21252B"
                    className="w-10"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
              <div className="flex items-center">
                <a
                  href="https://medium.com/@sebastiankt9"
                  target="_blank"
                  rel="noreferrer"
                  className="mx-auto transition hover:scale-125"
                >
                  {/* https://markentier.tech/posts/2020/10/medium-icon-svg/ */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1770 1000"
                    className="w-14"
                  >
                    <circle cx="500" cy="500" r="500" />{" "}
                    <ellipse ry="475" rx="250" cy="501" cx="1296" />{" "}
                    <ellipse cx="1682" cy="502" rx="88" ry="424" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
