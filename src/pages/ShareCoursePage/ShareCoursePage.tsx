import AsyncForm from "@/atoms/AsyncForm";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import CopyLink from "@/components/CopyLink";
import DisplayUserInline from "@/components/DisplayUserInline";
import IconTooltip from "@/components/IconTooltip";
import SearchUser from "@/components/SearchUser";
import LexicalEditor from "@/editor/LexicalEditor";
import AddCourseOwner from "@/graphql/AddCourseOwner";
import RemoveCourseOwner from "@/graphql/RemoveCourseOwner";
import UpdateCourse from "@/graphql/UpdateCourse";
import SEO from "@/helpers/SEO";
import { getElementsVals } from "@/helpers/getElementsVals";
import {
  Course,
  EditingAccess,
  Mutation,
  MutationAddCourseOwnerArgs,
  MutationRemoveCourseOwnerArgs,
  MutationUpdateCourseArgs,
  PrivacySetting,
  User,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import type { EditorState } from "lexical";
import { useState } from "react";

export interface ShareCoursePageProps {
  course: Course | null;
  authorized: boolean;
  currentUserId: string;
}

/**
 * Page for updating a course's sharing settings
 */
export default function ShareCoursePage({
  course,
  authorized,
  currentUserId,
}: ShareCoursePageProps) {
  const [privacySetting, setPrivacySetting] = useState("ALL");
  const [owners, setOwners] = useState<User[]>(course?.owners as User[]);
  const [description, setDescription] = useState<EditorState>();

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
  const [shareMsg, setShareMsg] = useState("");

  const shareCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    const { privacySetting, editingAccess, seoDescription, seoSubject } =
      getElementsVals(e.target as HTMLFormElement, [
        "privacySetting",
        "editingAccess",
        "seoDescription",
        "seoSubject",
      ]);
    let coursePassword: string | null = null;
    if (privacySetting === "PASSWORD") {
      coursePassword = getElementsVals(e.target as HTMLFormElement, [
        "coursePassword",
      ]).coursePassword;
    }

    await updateCourse({
      variables: {
        privacySetting: privacySetting as PrivacySetting,
        editingAccess: editingAccess as EditingAccess,
        seoDescription,
        seoSubject,
        coursePassword,
        description: JSON.stringify(description),
        courseId: course?.id as string,
      },
    });

    if (course?.privacySetting === "PRIVATE")
      setShareMsg("Your course is now available to others!");
    else setShareMsg("Updated course sharing settings");
  };

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

  if (!authorized) {
    return (
      <>
        <SEO
          title="Not Authorized"
          path={`course/${course?.id}/share`}
          description="You are not authorized to modify the sharing settings of this course"
        />
        <div className="mt-28 text-center">
          <h1 className="font-bold text-4xl mb-3">Not Authorized</h1>
          <p>
            You are not authorized to edit the sharing settings of this course
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Share Course"
        path={`course/${course?.id}/share`}
        description={`Update the sharing settings of ${course?.title} to share your flashcards with others`}
      />
      <div className="mt-28">
        <h1 className="text-center font-bold text-4xl mb-3">Share Course</h1>
        <p className="text-center">
          Made a course that others could benefit from? Help out the community
          and share it!
        </p>
        <AsyncForm
          onSubmit={shareCourse}
          buttonProps={{ children: "Share", block: true }}
          className="max-w-3xl px-5 mx-auto mt-5"
        >
          <Select
            label="Privacy Setting"
            options={[
              { value: "ALL", label: "All can view" },
              { value: "PASSWORD", label: "Requires a password to view" },
              { value: "FRIENDS", label: "Friends can view" },
              {
                value: "INSTITUTION",
                label: "Users with your email domain can view",
              },
              { value: "PRIVATE", label: "Only you can view" },
            ]}
            defaultValue={
              course?.privacySetting === "PRIVATE"
                ? "ALL"
                : course?.privacySetting ?? "ALL"
            }
            onChange={(val) => setPrivacySetting(val as string)}
            className="mb-3"
            name="privacySetting"
          />
          {privacySetting === "PASSWORD" && (
            <TextInput
              label="Password"
              type="password"
              className="mb-3"
              name="coursePassword"
              required
            />
          )}
          <Select
            label="Editing Access"
            options={[
              { value: "OWNERS", label: "Only owners can submit edits" },
              { value: "ALL", label: "Anyone can submit edits" },
              { value: "FRIENDS", label: "Friends can submit edits" },
              {
                value: "INSTITUTION",
                label: "Users with your email domain can submit edits",
              },
            ]}
            defaultValue={course?.editingAccess ?? "OWNERS"}
            className="mb-3"
            name="editingAccess"
          />
          <div className="mb-3">
            <h3 className="font-bold text-lg">Owners</h3>
            <ul className="list-disc">
              {owners.map((owner, i) => (
                <li key={i} className="ml-6">
                  <DisplayUserInline user={owner as User} />{" "}
                  {owner.id === currentUserId ? (
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
            <SearchUser
              onUserSelect={addOwner}
              placeholder="Add Owner (search by name)"
            />
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-lg">Description (optional)</h3>
            <LexicalEditor
              namespace="description"
              onChange={(state) => setDescription(state)}
              editorState={course?.description ? course?.description : null}
            />
          </div>
          <div className="mt-3 mb-5">
            <h3 className="font-bold text-lg">SEO</h3>
            <TextInput
              label="SEO Description (optional)"
              name="seoDescription"
              maxLength={160}
              defaultValue={course?.seoDescription ?? ""}
            />
            <TextInput
              className="mt-3"
              label="SEO Subject (optional)"
              name="seoSubject"
              maxLength={40}
              defaultValue={course?.seoSubject ?? ""}
            />
          </div>
        </AsyncForm>
        <p className="text-center my-3">{shareMsg}</p>
        <div className="text-center max-w-lg mx-auto">
          <p>Use this link to share the course:</p>
          <CopyLink link={`course/${course?.id}`} />
        </div>
      </div>
    </>
  );
}
