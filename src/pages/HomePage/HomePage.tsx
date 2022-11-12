import CreateAddCourseModal from "./CreateAddCourseModal";
import FriendsList from "./FriendsList";
import Heatmap from "./Heatmap";
import SocialMediaLinks from "./SocialMediaLinks";
import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import LinkButton from "@/atoms/LinkButton";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import Ad from "@/components/Ad";
import ReviewsDoneSVG from "@/components/ReviewsDoneSVG";
import JoinClassroom from "@/graphql/JoinClassroom";
import SEO from "@/helpers/SEO";
import englishList from "@/helpers/englishList";
import { getElementsVals } from "@/helpers/getElementsVals";
import type {
  Classroom,
  Course,
  Mutation,
  MutationJoinClassroomArgs,
  User,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { HistorySegment, UserType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

type ClassroomWithTeachers = Classroom & {
  teachers: User[];
};

type CourseAndClass =
  | {
      type: "COURSE";
      course: Course;
      classroom: undefined;
    }
  | {
      type: "CLASS";
      classroom: ClassroomWithTeachers;
      course: undefined;
    };

export interface HomePageProps {
  /**
   * The courses the user is currently in.
   * Displays as a list on the homepage
   */
  courses: Course[];
  /**
   * Classes the user is a student in. Displayed alongside courses
   */
  classes: ClassroomWithTeachers[];
  /**
   * How many reviews has the user studied today?
   */
  reviewsDone: number;
  /**
   * How many reviews does the user want to study today?
   */
  targetReviewsDone: number;
  /**
   * User's history of reviews for the past year
   */
  history: HistorySegment[];
  /**
   * Whether the user is a teacher, student, etc.
   */
  userType: UserType;
  /**
   * A list of the user's friends
   */
  friends: User[];
}

export default function HomePage({
  courses,
  classes,
  reviewsDone,
  targetReviewsDone,
  history,
  userType,
  friends,
}: HomePageProps) {
  const router = useRouter();
  const [addCourseModalOpen, setAddCourseModalOpen] = useState(false);
  const [joinClassModalOpen, setJoinClassModalOpen] = useState(false);
  const [joinClassroom] = useMutation<
    { joinClassroom: Mutation["joinClassroom"] },
    MutationJoinClassroomArgs
  >(JoinClassroom);

  const coursesAndClasses = useMemo(
    () =>
      courses
        .map<CourseAndClass>((course) => ({
          type: "COURSE",
          course,
          classroom: undefined,
        }))
        .concat(
          classes.map<CourseAndClass>((classroom) => ({
            type: "CLASS",
            classroom,
            course: undefined,
          }))
        ),
    [courses, classes]
  );

  const joinClassroomHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const { joinCode } = getElementsVals(e.target as HTMLFormElement, [
      "joinCode",
    ]);

    const result = await joinClassroom({
      variables: {
        joinCode,
      },
    }).catch((e) => {
      if (e.message === "Classroom not found") {
        const classroomJoinErrorEl =
          document.getElementById("classroomJoinError");
        if (classroomJoinErrorEl)
          classroomJoinErrorEl.innerHTML =
            "Classroom not found. Please check the code you entered.";
      }
    });

    if (result?.data?.joinClassroom)
      router.push(`/classroom/${result.data.joinClassroom.id}`);
  };

  return (
    <>
      <SEO
        title="Home"
        path="/home"
        description="Alu is the world's best flashcard maker and studying app for AP Exams. Study AP World, AP Psych, AP Gov, and more with Alu's free online flashcards"
      />
      <div className="mt-28">
        <div className="relative">
          {userType === "TEACHER" || userType === "MIXED" ? (
            <LinkButton outerClassname="absolute left-5 top-0" href="/classes">
              Manage Classes
            </LinkButton>
          ) : (
            <div className="absolute left-5 top-0">
              <Button
                faIcon={faPlus}
                onClick={() => setJoinClassModalOpen(true)}
              >
                Join Class
              </Button>
              <Modal
                open={joinClassModalOpen}
                close={() => setJoinClassModalOpen(false)}
                title="Join Class"
              >
                <AsyncForm
                  onSubmit={joinClassroomHandler}
                  buttonProps={{ block: true, children: "Join Class" }}
                >
                  <TextInput
                    label="Classroom Code"
                    name="joinCode"
                    className="mb-3"
                    required
                  />
                </AsyncForm>
                <p
                  className="text-red-600 text-center mt-2"
                  id="classroomJoinError"
                />
              </Modal>
            </div>
          )}
        </div>
        <h1 className="text-center text-4xl font-bold mb-5">Welcome!</h1>
        <div className="grid md:grid-cols-12 sm:grid-cols-6 h-40">
          <div className="md:col-start-4 col-span-6 mx-10 md:mx-5">
            <div className="flex flex-wrap">
              {coursesAndClasses.map((courseOrClass, i) => (
                <div
                  className="w-full lg:w-1/3 md:w-1/2 px-2 mb-4 mx-auto"
                  key={i}
                >
                  <Link
                    href={
                      courseOrClass.type === "COURSE"
                        ? `/course/${courseOrClass.course.id}/`
                        : `/classroom/${courseOrClass.classroom.id}`
                    }
                  >
                    <a>
                      <div
                        className="border-gray-200 border-4 bg-gray-50 rounded-xl h-60 min-h-full relative
                                     overflow-hidden hover:shadow-lg hover:scale-105 transition flex flex-wrap"
                      >
                        {courseOrClass.course?.bannerImage && (
                          <div className="w-full h-24 relative">
                            <Image
                              src={courseOrClass.course.bannerImage}
                              alt="Course banner"
                              layout="fill"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="absolute w-full text-center p-3 h-full flex flex-wrap items-center justify-center">
                          <div>
                            <h3 className="text-xl font-bold mt-4 w-full">
                              {courseOrClass.course?.title ||
                                courseOrClass.classroom?.title}
                            </h3>
                            {courseOrClass.type === "CLASS" && (
                              <p>
                                {englishList(
                                  courseOrClass.classroom.teachers.map(
                                    (teacher) => teacher.name ?? ""
                                  )
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </div>
              ))}
              <div className="w-full lg:w-1/3 md:w-1/2 px-2 mb-4 mx-auto">
                <div
                  className="border-gray-200 border-4 bg-gray-50 rounded-xl h-60 min-h-full
                             overflow-hidden hover:shadow-lg hover:cursor-pointer text-center
                             p-5 hover:scale-105 transition"
                  onClick={() => setAddCourseModalOpen(true)}
                >
                  <h3 className="text-xl font-bold">Create or Add Course</h3>
                  <FontAwesomeIcon icon={faPlus} size="8x" />
                </div>
              </div>
              <CreateAddCourseModal
                open={addCourseModalOpen}
                close={() => setAddCourseModalOpen(false)}
              />
            </div>
            <div className="my-20">
              <h1 className="font-bold text-center text-xl mb-2">History</h1>
              <Heatmap history={history} />
            </div>
          </div>
          <aside className="col-span-6 md:col-span-3 mx-4">
            <ReviewsDoneSVG
              reviewsDone={reviewsDone}
              targetReviewsDone={targetReviewsDone}
            />
            <SocialMediaLinks />
            <Ad adType="META_SIDEBAR" className="max-w-xs mx-auto" />
            <FriendsList friends={friends} />
          </aside>
        </div>
      </div>
    </>
  );
}
