import AsyncButton from "@/atoms/AsyncButton";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import RenderSharedCourse from "@/courses/RenderSharedCourse";
import AddFriend from "@/graphql/AddFriend";
import RemoveFriend from "@/graphql/RemoveFriend";
import SEO from "@/helpers/SEO";
import englishList from "@/helpers/englishList";
import type {
  Course,
  Mutation,
  MutationAddFriendArgs,
  MutationRemoveFriendArgs,
  User,
} from "@/types";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";

export interface ProfilePageProps {
  user: User;
  isSelf: boolean;
  courses: Course[];
  areFriends: boolean;
  friendPending: boolean;
}

/**
 * A page with information on a user, including their shared courses
 */
export default function ProfilePage({
  user,
  isSelf,
  courses,
  areFriends,
  friendPending,
}: ProfilePageProps) {
  const [addFriend] = useMutation<
    { addFriend: Mutation["addFriend"] },
    MutationAddFriendArgs
  >(AddFriend);
  const [removeFriend] = useMutation<
    { removeFriend: Mutation["removeFriend"] },
    MutationRemoveFriendArgs
  >(RemoveFriend);
  const router = useRouter();

  if (!user)
    return (
      <>
        <SEO
          title="Profile not found"
          path="profile"
          description="The profile you are looking for does not exist"
        />
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
      <SEO
        title={`${user.name}'s Profile`}
        path="profile"
        description={`View ${
          user.name
        }'s free study guide flashcards for ${englishList(
          courses.map((course) => course.title as string)
        )}`}
      />
      <div className="mt-28 px-10 md:container md:px-48 mx-auto">
        <h1 className="text-4xl font-bold">{user.name}</h1>
        <hr className="my-3" />
        {isSelf ? (
          <ButtonGroup className="mb-3" fixedWidth="200px" spaced>
            <LinkButton href="/settings">Settings</LinkButton>
            <LinkButton href="/archived">Archived Courses</LinkButton>
          </ButtonGroup>
        ) : areFriends ? (
          <AsyncButton
            onClick={async () => {
              await removeFriend({ variables: { userId: user.id as string } });
              router.push(router.asPath);
            }}
            variant="red"
          >
            Remove Friend
          </AsyncButton>
        ) : friendPending ? (
          <Button>Friend Requested</Button>
        ) : (
          <AsyncButton
            onClick={async () => {
              await addFriend({ variables: { userId: user.id as string } });
              router.push(router.asPath);
            }}
          >
            Add Friend
          </AsyncButton>
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
