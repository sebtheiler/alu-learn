import Button from "alu-ui/src/Button";
import Checkbox from "alu-ui/src/Checkbox";
import LinkButton from "alu-ui/src/LinkButton";
import Modal from "alu-ui/src/Modal";
import Select from "alu-ui/src/Select";
import CopyLink from "@/components/CopyLink";
import DisplayUserInline from "@/components/DisplayUserInline";
import IconTooltip from "@/components/IconTooltip";
import SearchUser from "@/components/SearchUser";
import AddCourseOwner from "@/graphql/AddCourseOwner";
import RemoveCourseOwner from "@/graphql/RemoveCourseOwner";
import UpdateCourse from "@/graphql/UpdateCourse";
import useMeStore from "@/stores/meStore";
import type {
  Course,
  Mutation,
  MutationAddCourseOwnerArgs,
  MutationRemoveCourseOwnerArgs,
  MutationUpdateCourseArgs,
  PrivacySetting,
  User,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface ShareCourseModalProps {
  open: boolean;
  close(): void;
  course: Course;
}

export default function ShareCourseModal({
  open,
  close,
  course,
}: ShareCourseModalProps) {
  const [owners, setOwners] = useState<User[]>(course?.owners as User[]);
  const username = useMeStore((state) => state.me?.username);
  const [privacySetting, setPrivacySetting] = useState(course.privacySetting);

  const [addCourseOwner] = useMutation<
    Mutation["addCourseOwner"],
    MutationAddCourseOwnerArgs
  >(AddCourseOwner);
  const [removeCourseOwner] = useMutation<
    Mutation["removeCourseOwner"],
    MutationRemoveCourseOwnerArgs
  >(RemoveCourseOwner);
  const [updateCourse] = useMutation<
    Mutation["updateCourse"],
    MutationUpdateCourseArgs
  >(UpdateCourse);

  const addOwner = async (newOwner: User) => {
    if (
      newOwner &&
      !owners.map((u) => u.username).includes(newOwner.username)
    ) {
      setOwners([...owners, newOwner]);
      await addCourseOwner({
        variables: {
          username: newOwner.username as string,
          courseId: course?.id as string,
        },
      });
    }
  };

  const removeOwner = async (username: string) => {
    setOwners(owners.filter((owner) => owner.username !== username));
    await removeCourseOwner({
      variables: { username, courseId: course?.id as string },
    });
  };

  return (
    <Modal open={open} close={close} title="Share Course">
      <div className="mb-3">
        <SearchUser
          onUserSelect={addOwner}
          placeholder="Add editor (search by name)"
        />
        <h3 className="font-bold text-lg mt-2">People with editing access</h3>
        <ul>
          {owners.map((owner, i) => (
            <li key={i} className="ml-6">
              <DisplayUserInline user={owner as User} />{" "}
              {owner.username === username ? (
                "(You)"
              ) : (
                <IconTooltip
                  onClick={() => removeOwner(owner.username as string)}
                  tooltip={`Remove ${owner.name}'s ownership`}
                  faIcon={faX}
                  className="text-gray-600"
                  tooltipProps={{ className: "w-48" }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
      <h3 className="font-bold text-lg mt-2">General access</h3>
      <Select
        options={[
          { value: "ALL", label: "Everyone with the link can view" },
          { value: "FRIENDS", label: "Only friends can view" },
          {
            value: "INSTITUTION",
            label: "Only users with your email domain can view",
          },
          { value: "PRIVATE", label: "Only you and other editors can view" },
        ]}
        defaultValue={course?.privacySetting as string}
        onChange={(val) => {
          setPrivacySetting(val as PrivacySetting);
          updateCourse({
            variables: {
              courseId: course.id as string,
              privacySetting: val as PrivacySetting,
            },
          });
        }}
        className="mt-2 mb-3"
        name="privacySetting"
      />
      <h3 className="font-bold text-lg mt-2">Link</h3>
      <CopyLink link={`course/${course.id}`} />
      {privacySetting === "ALL" && (
        <>
          <h3 className="font-bold text-lg mt-2">Public</h3>
          <Checkbox
            label="Display your course on the explore page?"
            defaultChecked={course.isPublic ?? false}
            onChange={(val) =>
              updateCourse({
                variables: {
                  courseId: course.id as string,
                  isPublic: val.target.checked,
                },
              })
            }
          />
        </>
      )}
      <hr className="my-4" />
      <LinkButton
        href={`/course/${course.id}/share`}
        style={{ width: "150px" }}
      >
        Advanced
      </LinkButton>
      <Button
        variant="secondary"
        className="float-right"
        onClick={close}
        style={{ width: "150px" }}
      >
        Close
      </Button>
    </Modal>
  );
}
