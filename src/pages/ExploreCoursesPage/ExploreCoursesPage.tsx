import RenderSharedCourse from "@/courses/RenderSharedCourse";
import SEO from "@/helpers/SEO";
import { Course } from "@/types";

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
        description="Find free online flashcards for AP World, AP Psych, AP Gov, and more. Study today with Alu's science-backed spaced repetition studying system"
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
            <RenderSharedCourse course={course} key={course.id} />
          ))}
        </div>
      </div>
    </>
  );
}
