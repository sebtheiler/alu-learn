import ChoiceSelect from "./ChoiceSelect";
import ProgressBar from "components/ProgressBar";
import googleLogoUrl from "assets/logos/google.svg";
import instagramLogoUrl from "assets/logos/instagram.svg";
import redditLogoUrl from "assets/logos/reddit.svg";
import tiktokLogoUrl from "assets/logos/tiktok.svg";
import youtubeLogoUrl from "assets/logos/youtube.svg";
import {
  faGraduationCap,
  faNewspaper,
  faPersonChalkboard,
  faPlus,
  faUserGroup,
  faWindowRestore,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";

/**
 * Renders a survey that is displayed to the user after they sign up
 */
export default function WelcomeSurveyPage() {
  const [slideNum, setSlideNum] = useState(0);
  const [answers, setAnswers] = useState({
    timezone: new Date().getTimezoneOffset(),
    userType: undefined,
  });

  /**
   * Generates a function to save the answer from the user's choice in `answers`
   * @param question Unique ID of the question. Saves as a key in `answers`
   * @returns A function to save the user's choice and move to the next question
   */
  const handleNext = (question: string | null) => {
    return async (response: string | number | boolean) => {
      const newAnswers = answers;
      if (question) newAnswers[question] = response;
      setAnswers(newAnswers);

      if (slideNum === slides.length - 1) {
        console.log(answers);
        setSlideNum(0);
      } else {
        setSlideNum(slideNum + 1);
      }
    };
  };

  // The value of slides depends on the answers to questions in the slides
  const slides = useMemo(() => {
    let slides = [
      <>
        <h4>Are you a student or a teacher?</h4>
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
          onClick={handleNext("userType")}
        />
      </>,
      <>
        <h4>How did you hear about Alu?</h4>
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
            { value: "INSTA", display: "Instagram", icon: instagramLogoUrl },
            { value: "REDDIT", display: "Reddit", icon: redditLogoUrl },
            { value: "TIKTOK", display: "TikTok", icon: tiktokLogoUrl },
            { value: "YOUTUBE", display: "YouTube", icon: youtubeLogoUrl },
            {
              value: "NEWS",
              display: "News",
              icon: faNewspaper,
              iconColor: "royalblue",
            },
            { value: "SEARCH", display: "Web Search", icon: googleLogoUrl },
          ]}
          onClick={handleNext("referrer")}
          numCols={3}
          shuffle
          includeOther
        />
      </>,
    ];

    if (answers.userType === "STUDENT") {
      // Questions only shown if the user is a student
      slides = slides.concat([
        <>
          <h4>Why did you join Alu?</h4>
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
            onClick={handleNext("joinReason")}
            shuffle
            numCols={4}
          />
        </>,
        <>
          <h4>What is your goal number of flashcards per day?</h4>
          <ChoiceSelect
            choices={[
              { value: 10, display: "10 flashcards" },
              { value: 25, display: "25 flashcards" },
              { value: 50, display: "50 flashcards" },
              { value: 100, display: "100 flashcards" },
            ]}
            onClick={handleNext("targetFlashcards")}
            numCols={4}
          />
        </>,
        <>
          <h4>Would you like a reminder email if you forget to study?</h4>
          <p className="mb-3 italic">
            Studying is most effective when it's done every day. Alu can send
            reminder emails to help you build your study habits.
          </p>
          <p className="italic">
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
            onClick={handleNext("sendReminders")}
          />
        </>,
      ]);
    } else if (answers.userType === "TEACHER") {
      // Questions only shown if the user is a teacher
      slides.push(
        <>
          <h4>Why did you join Alu?</h4>
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
            onClick={handleNext("joinReason")}
            shuffle
            includeOther
          />
        </>
      );
    }

    slides.push(
      <>
        <h4>
          Would you like to create your own deck or copy an existing deck?
        </h4>
        <ChoiceSelect
          choices={[
            {
              value: "CREATE_OWN",
              display: "Create My Own",
              icon: faPlus,
              iconColor: "navy",
            },
            {
              value: "COPY_EXISTING",
              display: "Copy Existing Deck",
              icon: faWindowRestore,
              iconColor: "peru",
            },
          ]}
          onClick={handleNext("deckChoice")}
        />
      </>
    );

    return slides;
  }, [answers, slideNum]);

  return (
    <div className="container md:px-14 lg:px-28 mt-28 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-3">Welcome to Alu!</h1>
      <ProgressBar stepNum={slideNum} totalNumSteps={slides.length - 1} />
      <div className="text-lg mt-5">{slides[slideNum]}</div>
    </div>
  );
}
