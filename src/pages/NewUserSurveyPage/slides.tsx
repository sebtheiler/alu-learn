import type { Question } from "./types";
import Button from "@/atoms/Button";
import TextInput from "@/atoms/TextInput";
import ChoiceSelect from "@/components/ChoiceSelect";
import { getElementsVals } from "@/helpers/getElementsVals";
import type { User } from "@/types";
import {
  faGraduationCap,
  faNewspaper,
  faPersonChalkboard,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";

/**
 * Generates slides for the new user survey
 * @param handleNext
 * @returns
 */
export default function useSlides(
  handleNext: (
    question: Question | null,
    numSlides: number
  ) => (response: string | number | boolean) => Promise<void>,
  userType: "STUDENT" | "TEACHER" | undefined,
  user: User
) {
  // The value of slides depends on the answers to questions in the slides
  const slides = useMemo(() => {
    /**
     * Total, predetermined number of slides
     * Must be predetermined to avoid circular depndency
     */
    const numSlides =
      (user.name ? 0 : 1) + 2 + (userType === "STUDENT" ? 3 : 1) + 1;

    let slides: React.ReactElement[] = [];

    if (!user.name)
      slides.push(
        <>
          <h4 className="text-center">What&apos;s your name?</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext(
                "name",
                numSlides
              )(getElementsVals(e.target as HTMLFormElement, ["name"]).name);
            }}
            className="max-w-sm mt-3 mx-auto"
          >
            <TextInput
              label="Your Name"
              autoComplete="name"
              className="mb-3"
              name="name"
              autoFocus
              required
            />
            <Button type="submit" block>
              Confirm
            </Button>
          </form>
        </>
      );

    slides = slides.concat([
      <>
        <h4 className="text-center">Are you a student or a teacher?</h4>
        <ChoiceSelect
          choices={[
            {
              value: "STUDENT",
              display: "Student",
              icon: faGraduationCap,
              iconColor: "dodgerblue",
            },
            {
              value: "TEACHER",
              display: "Teacher",
              icon: faPersonChalkboard,
              iconColor: "indigo",
            },
          ]}
          onClick={handleNext("userType", numSlides)}
        />
      </>,
      <>
        <h4 className="text-center">How did you hear about Alu?</h4>
        <ChoiceSelect
          choices={[
            {
              value: "FRIENDS",
              display: "Friends/Family",
              icon: faUserGroup,
              iconColor: "orange",
            },
            {
              value: "TEACHER",
              display: "Teacher",
              icon: faPersonChalkboard,
              iconColor: "indigo",
            },
            {
              value: "INSTA",
              display: "Instagram",
              icon: "/assets/logos/instagram.svg",
            },
            {
              value: "REDDIT",
              display: "Reddit",
              icon: "/assets/logos/reddit.svg",
            },
            {
              value: "TIKTOK",
              display: "TikTok",
              icon: "/assets/logos/tiktok.svg",
            },
            {
              value: "YOUTUBE",
              display: "YouTube",
              icon: "/assets/logos/youtube.svg",
            },
            {
              value: "NEWS",
              display: "News",
              icon: faNewspaper,
              iconColor: "royalblue",
            },
            {
              value: "SEARCH",
              display: "Web Search",
              icon: "/assets/logos/google.svg",
            },
          ]}
          onClick={handleNext("referrer", numSlides)}
          numCols={3}
          shuffle
          includeOther
        />
      </>,
    ]);

    if (userType === "STUDENT") {
      // Questions only shown if the user is a student
      slides = slides.concat([
        <>
          <h4 className="text-center">Why did you join Alu?</h4>
          <ChoiceSelect
            choices={[
              {
                value: "MEMORY",
                display: "I want to memorize more of what I learn",
              },
              { value: "GRADES", display: "I want to improve my grades" },
              {
                value: "CONCEPT",
                display: "I think it's an interesting concept",
              },
              { value: "TEACHER", display: "My teacher told me to" },
            ]}
            onClick={handleNext("joinReason", numSlides)}
            shuffle
            numCols={4}
          />
        </>,
        <>
          <h4 className="text-center">
            What is your goal number of flashcards per day?
          </h4>
          <ChoiceSelect
            choices={[
              { value: 10, display: "10 flashcards" },
              { value: 25, display: "25 flashcards" },
              { value: 50, display: "50 flashcards" },
              { value: 100, display: "100 flashcards" },
            ]}
            onClick={handleNext("targetNumReviews", numSlides)}
            numCols={4}
          />
        </>,
        <>
          <h4 className="text-center">
            Would you like a reminder email if you forget to study?
          </h4>
          <p className="mb-3 italic text-center">
            Studying is most effective when it&apos;s done every day. Alu can
            send reminder emails to help you build your study habits.
          </p>
          <p className="italic text-center">
            You can unsubscribe at any time. We will never spam you.
          </p>
          <ChoiceSelect
            choices={[
              { value: true, display: "Yes, send me reminder emails" },
              {
                value: false,
                display: "No, I'm not interested in reminder emails",
              },
            ]}
            onClick={handleNext("sendReminders", numSlides)}
          />
        </>,
      ]);
    } else if (userType === "TEACHER") {
      // Questions only shown if the user is a teacher
      slides.push(
        <>
          <h4 className="text-center">Why did you join Alu?</h4>
          <ChoiceSelect
            choices={[
              {
                value: "STUDENTS",
                display: "I want to use it with my students",
              },
              {
                value: "CONCEPT",
                display: "I think it's an interesting concept",
              },
            ]}
            onClick={handleNext("joinReason", numSlides)}
            shuffle
            includeOther
          />
        </>
      );
    }

    slides = slides.concat([
      <>
        <h3 className="text-center">Personalizing your Alu account...</h3>
        <h4 className="text-center">Hang on just one second</h4>
      </>,
    ]);

    return slides;
  }, [handleNext, userType, user.name]);

  return slides;
}
