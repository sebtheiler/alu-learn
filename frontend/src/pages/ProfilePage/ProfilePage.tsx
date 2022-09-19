import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import RenderSharedCourse from "@/courses/RenderSharedCourse";
import SEO from "@/helpers/SEO";
import type { Course, User } from "@/types";

export interface ProfilePageProps {
  user: User;
  isSelf: boolean;
  courses: Course[];
}

/**
 * A page with information on a user, including their shared courses
 */
export default function ProfilePage({
  user,
  isSelf,
  courses,
}: ProfilePageProps) {
  if (!user)
    return (
      <>
        <SEO title="Profile not found" path="profile" description="" />
        <div className="mt-28 mx-auto text-center">
          <h1 className="text-4xl font-bold">Profile not Found</h1>
          <p className="my-6">
            The profile you are looking for does not exist.
          </p>
          <LinkButton href="/">Return Home</LinkButton>
        </div>
      </>
    );

  return (
    <>
      <SEO title={`${user.name}'s Profile`} path="profile" description="" />
      <div className="mt-28 px-10 md:container md:px-48 mx-auto">
        <h1 className="text-4xl font-bold">{user.name}</h1>
        <hr className="my-3" />
        {isSelf && (
          <ButtonGroup className="mb-3" fixedWidth="200px" spaced>
            <LinkButton href="/settings">Settings</LinkButton>
            <LinkButton href="/archived">Archived Courses</LinkButton>
          </ButtonGroup>
        )}
        <div>
          {courses.map((course) => (
            <RenderSharedCourse course={course} key={course.id} />
          ))}
        </div>
      </div>
    </>
  );
}
