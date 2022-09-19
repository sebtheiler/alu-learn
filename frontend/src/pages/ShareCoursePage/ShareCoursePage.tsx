import AsyncForm from "@/atoms/AsyncForm";
import ComboBox from "@/atoms/ComboBox";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import DisplayUserInline from "@/components/DisplayUserInline";
import IconTooltip from "@/components/IconTooltip";
import AddCourseOwner from "@/graphql/AddCourseOwner";
import RemoveCourseOwner from "@/graphql/RemoveCourseOwner";
import SearchUsers from "@/graphql/SearchUsers";
import UpdateCourse from "@/graphql/UpdateCourse";
import SEO from "@/helpers/SEO";
import { getElementsVals } from "@/helpers/getElementsVals";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Course,
  EditingAccess,
  Mutation,
  MutationAddCourseOwnerArgs,
  MutationRemoveCourseOwnerArgs,
  MutationUpdateCourseArgs,
  Option,
  PrivacySetting,
  Query,
  QuerySearchUsersArgs,
  User,
} from "@/types";
import { useLazyQuery, useMutation } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

export interface ShareCoursePageProps {
  course: Course | null;
  authorized: boolean;
  currentUserId: string;
}

/**
 *
 */
export default function ShareCoursePage({
  course,
  authorized,
  currentUserId,
}: ShareCoursePageProps) {
  const [privacySetting, setPrivacySetting] = useState("ALL");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);
  const [, { data: searchedUsers, refetch: searchUsers }] = useLazyQuery<
    {
      searchUsers: Query["searchUsers"];
    },
    QuerySearchUsersArgs
  >(SearchUsers, { variables: { name: query } });
  const [owners, setOwners] = useState<User[]>(course?.owners as User[]);

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

  useEffect(() => {
    if (debouncedQuery.length >= 3 && debouncedQuery === query)
      searchUsers({ name: query });
  }, [debouncedQuery, query, searchUsers]);

  const shareCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    const { privacySetting, editingAccess } = getElementsVals(
      e.target as HTMLFormElement,
      ["privacySetting", "editingAccess"]
    );
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
        coursePassword,
        courseId: course?.id as string,
      },
    });

    if (course?.privacySetting === "PRIVATE")
      setShareMsg("Your course is now available to others!");
    else setShareMsg("Updated course sharing settings");
  };

  const addOwner = async (username: string) => {
    const newOwner = searchedUsers?.searchUsers?.filter(
      (u) => u?.username === username
    )[0];
    if (newOwner && !owners.map((u) => u.username).includes(username)) {
      setOwners([...owners, newOwner]);
      await addCourseOwner({
        variables: { username, courseId: course?.id as string },
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
      <div className="mt-28 text-center">
        <h1 className="font-bold text-4xl mb-3">Not Authorized</h1>
        <p>
          You are not authorized to edit the sharing settings of this course
        </p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Share Course"
        path={`course/${course?.id}/share`}
        description=""
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
            <ComboBox
              options={
                (searchedUsers?.searchUsers?.map((user) => ({
                  value: user?.username,
                  label: user?.name,
                })) ?? []) as Option[]
              }
              onQueryChange={(e) => setQuery(e.target.value)}
              onChange={addOwner}
              placeholder="Add Owner (search by name)"
              className="mt-2"
              clearOnChange
            />
          </div>
        </AsyncForm>
        <p className="text-center mt-3">{shareMsg}</p>
      </div>
    </>
  );
}
