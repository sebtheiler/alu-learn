import type {
  Course,
  Query,
  QueryGetCourseSubSectionsArgs,
  SubSection,
} from "@/types";
import { useQuery } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AsyncForm from "alu-ui/src/AsyncForm";
import Tabs from "alu-ui/src/Tabs";
import TextInput from "alu-ui/src/TextInput";
import GetCourseSubSections from "graphql-operations/operations/GetCourseSubSections";
import MyCourses from "graphql-operations/operations/MyCourses";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import { useState } from "react";

/**
 * Specify a destination for where to save flashcards
 * (e.g., flashcards that are created with auto flashcard or flashcards from imports)
 */
export default function SaveLocation({
  callback,
  className,
  createTitle,
}: {
  /**
   * Called when the user makes a decision
   * @param loc Where the user decided to save the flashcard. Either has the `courseTitle` or `subSectionId` attribute
   */
  callback(loc: { courseTitle?: string; subSectionId?: string }): Promise<void>;
  /**
   * Title of the button shown when the user is confirming the new course name
   */
  createTitle: string;
  className?: string;
}) {
  const [location, setLocation] = useState("NEW");

  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined
  );

  const { data: coursesData, loading: coursesLoading } = useQuery<{
    myCourses: Query["myCourses"];
  }>(MyCourses, { skip: !(location === "EXISTING") });
  const { data: subSectionsData, loading: subSectionsLoading } = useQuery<
    { getCourseSubSections: Query["getCourseSubSections"] },
    QueryGetCourseSubSectionsArgs
  >(GetCourseSubSections, {
    variables: { courseId: selectedCourse?.id as string },
    skip: !selectedCourse?.id,
  });

  return (
    <div className={className}>
      <Tabs
        tabs={[
          { label: "Create New", value: "NEW" },
          { label: "Add to Existing", value: "EXISTING" },
        ]}
        callback={setLocation}
        className="mx-auto"
      />
      {location === "NEW" && (
        <AsyncForm
          onSubmit={(e) =>
            callback({
              courseTitle: getElementsVals(e.target as HTMLFormElement, [
                "courseTitle",
              ]).courseTitle as string,
            })
          }
          buttonProps={{
            block: true,
            children: createTitle,
            variant: "green",
          }}
        >
          <TextInput
            label="Course Title"
            name="courseTitle"
            className="my-3"
            autoFocus
            required
          />
        </AsyncForm>
      )}
      {location === "EXISTING" && (
        <div>
          {selectedCourse && (
            <p className="font-bold mt-2 text-center">
              <FontAwesomeIcon
                icon={faX}
                onClick={() => setSelectedCourse(undefined)}
                className="hover:cursor-pointer"
              />{" "}
              {selectedCourse.title}
            </p>
          )}
          {(coursesLoading || subSectionsLoading) && <p>Loading...</p>}
          {!selectedCourse &&
            ((coursesData?.myCourses?.length ?? 0) > 0 ? (
              coursesData?.myCourses?.map((course: Course | null) => (
                <div
                  key={course?.id}
                  className="bg-gray-100 border-2 border-gray-200 rounded-lg my-2 px-3 py-2 text-center hover:scale-105 hover:cursor-pointer transition"
                  role="button"
                  onClick={() => setSelectedCourse(course as Course)}
                >
                  {course?.title}
                </div>
              ))
            ) : (
              <p className="text-center mt-2">You have no existing courses</p>
            ))}
          {subSectionsData?.getCourseSubSections?.map(
            (subSection: SubSection | null) => (
              <div
                key={subSection?.id}
                className="bg-gray-100 border-2 border-gray-200 rounded-lg my-2 px-3 py-2 text-center hover:scale-105 hover:cursor-pointer transition"
                role="button"
                onClick={() =>
                  callback({ subSectionId: subSection?.id as string })
                }
              >
                {subSection?.title}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
