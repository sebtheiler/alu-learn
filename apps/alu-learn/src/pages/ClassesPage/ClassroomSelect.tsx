import CreateClassroomModal from "./CreateClassroomModal";
import type { Classroom } from "@/types";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

export default function ClassroomSelect({
  classrooms,
}: {
  classrooms: Classroom[];
}) {
  const [createClassroomModalOpen, setCreateClassroomModalOpen] =
    useState(false);

  return (
    <div className="text-center mt-3">
      {classrooms.map((classroom) => (
        <Link
          href={`/classroom/${classroom.id}`}
          key={classroom.id}
          className="inline-block rounded-full px-5 py-2 mx-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
          role="button"
        >
          {classroom.title}
        </Link>
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
  );
}
