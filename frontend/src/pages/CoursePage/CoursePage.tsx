import CoursePageContext from "./context";
import { useMutation } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import RenderMainSection from "components/RenderMainSection";
import CreateMainSection from "graphql/CreateMainSection";
import SEO from "helpers/SEO";
import { getElementsVals } from "helpers/getElementsVals";
import { useRouter } from "next/router";
import React, { useState } from "react";
import type { Course, MainSection } from "types";

export interface CoursePageProps {
  /**
   * Course to display
   */
  course: Course;
  /**
   * Is the user authorized to view the course? (course is null if true)
   */
  authorized: boolean;
}

/**
 *
 */
export default function CoursePage({ course, authorized }: CoursePageProps) {
  const [createMainSection] = useMutation(CreateMainSection);
  const [createMainSectionModalOpen, setCreateMainSectionModalOpen] =
    useState(false);

  const router = useRouter();
  const refreshData = () => router.replace(router.asPath);

  const handleCreateMainSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { mainSectionTitle } = getElementsVals(e.target as HTMLFormElement, [
      "mainSectionTitle",
    ]);

    await createMainSection({
      variables: {
        title: mainSectionTitle,
        courseId: course.id,
      },
    });

    refreshData();
    setCreateMainSectionModalOpen(false);
  };

  return (
    <>
      <SEO
        title={course?.title ?? "Course"}
        path={`course/${course?.id}`}
        // TODO: Add SEO description (VERY IMPORTANT)
        description=""
      />
      {authorized && (
        <div className="mt-28">
          <h1 className="font-bold text-4xl text-center">{course.title}</h1>
          <div className="md:container mx-auto px-4 mt-6">
            <CoursePageContext.Provider value={{ course, refreshData }}>
              {course?.mainSections?.map((mainSection) => (
                <RenderMainSection
                  mainSection={mainSection as MainSection}
                  key={mainSection?.id as string}
                />
              ))}
            </CoursePageContext.Provider>
          </div>
          <div className="text-center">
            {course.mainSections?.length === 0 && (
              <p className="mb-3">
                This course doesn&apos;t have any sections yet. Add one below to
                start organizing the course!
              </p>
            )}
            <Button
              onClick={() => setCreateMainSectionModalOpen(true)}
              faIcon={faPlus}
              className="mb-3"
            >
              Add Section
            </Button>
            <Modal
              open={createMainSectionModalOpen}
              close={() => setCreateMainSectionModalOpen(false)}
            >
              <h2 className="text-2xl font-bold text-center mb-3">
                Add Section
              </h2>
              <AsyncForm
                onSubmit={handleCreateMainSection}
                buttonProps={{ block: true, children: "Add Section" }}
              >
                <TextInput
                  label="Section Title"
                  className="mb-3"
                  name="mainSectionTitle"
                  required
                />
              </AsyncForm>
            </Modal>
          </div>
        </div>
      )}
      {!authorized && (
        <div className="mt-28 text-center">
          <p>You are not authorized to view this course</p>
        </div>
      )}
    </>
  );
}
