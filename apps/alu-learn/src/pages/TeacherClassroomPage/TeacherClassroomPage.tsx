import ClassroomSelect from "../ClassesPage/ClassroomSelect";
import AssignmentsTab from "./AssignmentsTab";
import SettingsTab from "./SettingsTab";
import StudentsTab from "./StudentsTab";
import SEO from "@/helpers/SEO";
import classNames from "helpers-lib/src/classNames";
import type {
  Assignment,
  Classroom,
  CourseSection,
  UserWithHistory,
} from "@/types";
import {
  faClipboard,
  faEye,
  faGear,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export interface TeacherClassroomPageProps {
  /**
   * All the teacher's classrooms
   */
  classrooms: Classroom[];
  /**
   * The classroom for this specific page
   */
  classroom?: Classroom;
  /**
   * The students of the class
   */
  students: UserWithHistory[];
  /**
   * The assignments of the class
   */
  assignments: Assignment[];
  /**
   * The sections of the classroom's course (for assigning the assignment)
   */
  courseSections: CourseSection[];
}

/**
 * Shows a page for a specific classroom
 */
export default function TeacherClassroomPage({
  classrooms,
  classroom,
  students,
  assignments,
  courseSections,
}: TeacherClassroomPageProps) {
  const [tab, setTab] = useState("STUDENTS");

  if (!classroom) {
    return (
      <>
        <SEO
          title="Class not found"
          path="/classrooms/undefined"
          description="The classroom you are looking for does not exist"
        />
        <div className="mt-28">
          <h1 className="text-center font-bold text-4xl">
            Classroom Not Found
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={classroom.title as string}
        path="classes"
        description={`Manage ${classroom.title} with free flashcards at Alu Learn`}
      />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl">{classroom.title}</h1>
        <ClassroomSelect classrooms={classrooms} />
        <div className="mt-5 grid grid-cols-12 mx-10">
          <div className="col-span-2 mx-5">
            <ul>
              <li
                className={classNames(
                  "px-4 py-3 hover:bg-gray-100 my-2 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md",
                  tab === "STUDENTS" && "bg-gray-100 border-gray-200"
                )}
                onClick={() => setTab("STUDENTS")}
                role="button"
              >
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="mr-2 text-gray-600"
                />
                Students
              </li>
              <li
                className={classNames(
                  "px-4 py-3 hover:bg-gray-100 my-2 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md",
                  tab === "ASSIGNMENTS" && "bg-gray-100 border-gray-200"
                )}
                onClick={() => setTab("ASSIGNMENTS")}
                role="button"
              >
                <FontAwesomeIcon
                  icon={faClipboard}
                  className="mr-2 text-gray-600"
                />
                Assignments
              </li>
              <li className="my-2 flex">
                <a
                  href={`/classroom/${classroom.id}?studentPreview=true`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:bg-gray-100 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md px-4 py-3 w-full"
                >
                  <FontAwesomeIcon
                    icon={faEye}
                    className="mr-2 text-gray-600"
                  />
                  Student Preview
                </a>
              </li>
              <li
                className={classNames(
                  "px-4 py-3 hover:bg-gray-100 my-2 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md",
                  tab === "SETTINGS" && "bg-gray-100 border-gray-200"
                )}
                onClick={() => setTab("SETTINGS")}
                role="button"
              >
                <FontAwesomeIcon icon={faGear} className="mr-2 text-gray-600" />
                Settings
              </li>
            </ul>
          </div>
          <div className="col-span-8 mx-10">
            <hr />
            {tab === "STUDENTS" && (
              <StudentsTab students={students} classroom={classroom} />
            )}
            {tab === "ASSIGNMENTS" && (
              <AssignmentsTab
                assignments={assignments}
                courseSections={courseSections}
                classrooms={classrooms}
                classroom={classroom}
              />
            )}
            {tab === "SETTINGS" && <SettingsTab classroom={classroom} />}
          </div>
        </div>
      </div>
    </>
  );
}
