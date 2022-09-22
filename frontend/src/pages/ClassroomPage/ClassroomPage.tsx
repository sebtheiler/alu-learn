import ClassroomSelect from "../ClassesPage/ClassroomSelect";
import StudentsTab from "./StudentsTab";
import SEO from "@/helpers/SEO";
import type { Classroom, UserWithHistory } from "@/types";
import {
  faClipboard,
  faGear,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export interface ClassesPageProps {
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
}

/**
 * Shows a page for a specific classroom
 */
export default function ClassroomPage({
  classrooms,
  classroom,
  students,
}: ClassesPageProps) {
  const [tab, setTab] = useState("STUDENTS");

  if (!classroom) {
    return (
      <>
        <SEO
          title="Class not found"
          path="/classrooms/undefined"
          description=""
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
      <SEO title={classroom.title as string} path="classes" description="" />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl">{classroom.title}</h1>
        <ClassroomSelect classrooms={classrooms} />
        <div className="mt-5 grid grid-cols-12 mx-10">
          <div className="col-span-2 mx-5">
            <ul>
              <li
                className="px-4 py-3 hover:bg-gray-100 my-2 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm"
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
                className="px-4 py-3 hover:bg-gray-100 my-2 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm"
                onClick={() => setTab("ASSIGNMENTS")}
                role="button"
              >
                <FontAwesomeIcon
                  icon={faClipboard}
                  className="mr-2 text-gray-600"
                />
                Assignments
              </li>
              <li
                className="px-4 py-3 hover:bg-gray-100 my-2 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm"
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
          </div>
        </div>
      </div>
    </>
  );
}
