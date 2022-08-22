import LinkButton from "atoms/LinkButton";
import Popover from "atoms/Popover";
import SEO from "helpers/SEO";
import { cleanTitle } from "helpers/cleanTitle";
import { Course } from "types";

const currentlyStudiedColor = "#5ed149";
const previouslyStudiedColor = "#FDCE29";

const repeat = (arr, n) => [].concat(...Array(n).fill(arr));

export interface CoursePageProps {
  course: Course;
}

const mainSections = [
  {
    title: "main section",
    id: 1,
    subSections: repeat(
      [
        {
          title: "sub section",
          id: 1,
          totalPercentComplete: 0.2,
          percentComplete: 0.1,
        },
        {
          title: "sub section #2",
          id: 2,
          totalPercentComplete: 0.8,
          percentComplete: 0.1,
        },
      ],
      4
    ),
  },
];

/**
 *
 */
export default function CoursePage({ course }: CoursePageProps) {
  return (
    <>
      <SEO
        title={course.title ?? "Course"}
        path={`course/${course.id}`}
        // TODO: Add SEO description (VERY IMPORTANT)
        description=""
      />
      <div className="mt-28">
        <h1 className="font-bold text-4xl text-center">{course.title}</h1>
        <div className="md:container mx-auto px-4 mt-6">
          {mainSections.map((mainSection) => (
            <div
              className="border-gray-200 border-4 bg-gray-50 rounded-[1rem] px-4 py-3 max-w-5xl mx-auto"
              key={mainSection.id}
            >
              <div className="flex items-center mt-4 mb-3">
                <div className="flex-grow bg bg-gray-300 h-0.5"></div>
                <div className="flex-grow-0 mx-5 text dark:text-white font-bold text-center text-3xl">
                  {mainSection.title.toUpperCase()}
                </div>
                <div className="flex-grow bg bg-gray-300 h-0.5"></div>
              </div>
              <div className="flex flex-wrap px-10 py-5">
                {mainSection.subSections.map((subSection) => (
                  <div key={subSection.id} className="w-1/4 mx-auto my-1">
                    <Popover
                      popover={
                        <>
                          <LinkButton
                            href={`/course/${course.id}/s/${cleanTitle(
                              mainSection.title
                            )}/${cleanTitle(subSection.title)}/learn`}
                            block
                          >
                            Learn Content
                          </LinkButton>
                          <LinkButton
                            href={`/course/${course.id}/s/${cleanTitle(
                              mainSection.title
                            )}/${cleanTitle(subSection.title)}/flashcards`}
                            className="mt-2"
                            block
                          >
                            Flashcards
                          </LinkButton>
                          <LinkButton
                            href={`/course/${course.id}/s/${cleanTitle(
                              mainSection.title
                            )}/${cleanTitle(subSection.title)}/practice`}
                            className="mt-2"
                            block
                          >
                            Practice Problems
                          </LinkButton>
                        </>
                      }
                      trigger="click"
                      placement="bottom"
                      arrow
                    >
                      <div
                        className="mx-auto w-40 h-40 rounded-full flex items-center border-4 border-gray-200 hover:scale-110 hover:shadow-lg transition hover:cursor-pointer"
                        role="button"
                        style={{
                          background: `conic-gradient(${previouslyStudiedColor} ${
                            (subSection.totalPercentComplete ?? 0) * 100
                          }%, transparent 0%)`,
                        }}
                      >
                        <div
                          className="w-full h-full flex items-center rounded-full p-2"
                          style={{
                            background: `conic-gradient(${currentlyStudiedColor} ${
                              (subSection.percentComplete ?? 0) * 100
                            }%, transparent 0%)`,
                          }}
                        >
                          <div className="flex items-center rounded-full h-full w-full bg-gray-100 border-4 border-gray-200">
                            <p className="mx-auto">{subSection.title}</p>
                          </div>
                        </div>
                      </div>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
