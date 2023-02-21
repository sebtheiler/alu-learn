import DisplayUserInline from "@/components/DisplayUserInline";
import LexicalEditor from "@/editor/LexicalEditor";
import type { Course } from "@/types";
import Link from "next/link";
import { Fragment } from "react";

interface RenderSharedCourseProps {
  course: Course;
}

/**
 * Render a shared course.
 * E.g., on the explore page and a user's homepage
 */
export default function RenderSharedCourse({
  course,
}: RenderSharedCourseProps) {
  return (
    <div
      className="rounded-xl border-4 border-alu-mid-gray bg-alu-light-gray px-6 py-4 my-3"
      key={course.id}
    >
      <div>
        <p className="float-right -translate-y-1">
          Created by{" "}
          {course?.owners?.map(
            (owner, i) =>
              owner && (
                <Fragment key={i}>
                  <DisplayUserInline user={owner} />
                  {course?.owners && i !== course.owners.length - 1 && ", "}
                </Fragment>
              )
          )}
          <br />
          {/* @ts-ignore */}
          {course._count.users} {/* @ts-ignore */}
          {course._count.users === 1 ? "student" : "students"}
        </p>
        <h2>
          <Link
            href={`/course/${course.id}`}
            className="my-2 text-4xl font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            {course.title}
          </Link>
        </h2>
        <hr className="my-3" />
      </div>
      <LexicalEditor
        namespace={`course-${course.id}`}
        editorState={course.description}
        editable={false}
      />
    </div>
  );
}
