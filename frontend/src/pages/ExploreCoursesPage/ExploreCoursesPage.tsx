import DisplayUserInline from "@/components/DisplayUserInline";
import SEO from "@/helpers/SEO";
import LexicalEditor from "@/lexicalEditor/LexicalEditor";
import { Course } from "@/types";
import Link from "next/link";
import { Fragment } from "react";

export interface ExploreCoursesPageProps {
  courses: Course[];
}

export default function ExploreCoursesPage({
  courses,
}: ExploreCoursesPageProps) {
  return (
    <>
      <SEO
        title="Explore Decks"
        path="/explore"
        // description=""  TODO: (SEO) set description
      />
      <div className="container mx-auto mt-28 px-48">
        <div>
          <h1 className="mb-3 text-4xl font-bold">Explore</h1>
          <p className="text-lg">
            Find top courses created by others to help you study
          </p>
        </div>
        <hr className="my-3" />
        <div>
          {courses.map((course) => (
            <div
              className="rounded-xl border-4 border-alu-mid-gray bg-alu-light-gray px-6 py-4"
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
                          {course?.owners &&
                            i !== course.owners.length - 1 &&
                            ", "}
                        </Fragment>
                      )
                  )}
                  <br />
                  {/* @ts-ignore */}
                  {course._count.users} {/* @ts-ignore */}
                  {course._count.users === 1 ? "student" : "students"}
                </p>
                <h1 className="my-2 text-4xl font-bold text-blue-500 hover:text-blue-600 hover:underline">
                  <Link href={`/course/${course.id}`}>{course.title}</Link>
                </h1>
                <hr className="my-3" />
              </div>
              <LexicalEditor
                namespace={`course-${course.id}`}
                editorState={course.description}
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
