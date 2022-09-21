import CreateClassroomModal from "./CreateClassroomModal";
import SEO from "@/helpers/SEO";
import type { Classroom } from "@/types";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export interface ClassesPageProps {
  classrooms: Classroom[];
}

/**
 *
 */
export default function ClassesPage({ classrooms }: ClassesPageProps) {
  const [createClassroomModalOpen, setCreateClassroomModalOpen] =
    useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(0);

  return (
    <>
      <SEO title="Classes" path="classes" description="" />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl">Classes</h1>
        <div className="text-center mt-3">
          {classrooms.map((classroom, i) => (
            <div
              className="inline-block rounded-full px-5 py-2 mx-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
              key={classroom.id}
              role="button"
              onClick={() => setSelectedClassroom(i)}
            >
              {classroom.title}
            </div>
          ))}
          <div
            className="inline-block rounded-full px-5 py-2 mx-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
            role="button"
            onClick={() => setCreateClassroomModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> New Class
          </div>
          <CreateClassroomModal
            open={createClassroomModalOpen}
            close={() => setCreateClassroomModalOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
