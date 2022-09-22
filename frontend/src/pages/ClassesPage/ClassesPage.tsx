import ClassroomSelect from "./ClassroomSelect";
import SEO from "@/helpers/SEO";
import type { Classroom } from "@/types";

export interface ClassesPageProps {
  classrooms: Classroom[];
}

/**
 * Shows a button to create new classrooms.
 * Only displayed when the user has no classes yet.
 */
export default function ClassesPage({ classrooms }: ClassesPageProps) {
  return (
    <>
      <SEO title="Classes" path="classes" description="" />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl">Classes</h1>
        <ClassroomSelect classrooms={classrooms} />
      </div>
    </>
  );
}
