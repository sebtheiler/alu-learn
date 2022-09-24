import AsyncButton from "@/atoms/AsyncButton";
import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import IconTooltip from "@/components/IconTooltip";
import CoursePageContext from "@/courses/RenderCourse/context";
import DeleteCourseSection from "@/graphql/DeleteCourseSection";
import UpdateCourseSection from "@/graphql/UpdateCourseSection";
import { getElementsVals } from "@/helpers/getElementsVals";
import type { CourseSection } from "@/types";
import { useMutation } from "@apollo/client";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useState } from "react";

interface CourseSectionSettingsProps {
  courseSection: CourseSection;
}

export default function CourseSectionSettings({
  courseSection,
}: CourseSectionSettingsProps) {
  const { refreshData } = useContext(CoursePageContext);
  const [updateCourseSection] = useMutation(UpdateCourseSection);
  const [deleteCourseSection] = useMutation(DeleteCourseSection);
  const [courseSectionSettingsModalOpen, setCourseSectionSettingsModalOpen] =
    useState(false);

  const handleUpdateCourseSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { courseSectionTitle } = getElementsVals(
      e.target as HTMLFormElement,
      ["courseSectionTitle"]
    );

    await updateCourseSection({
      variables: {
        title: courseSectionTitle,
        courseSectionId: courseSection.id,
      },
    });

    refreshData && refreshData();
    setCourseSectionSettingsModalOpen(false);
  };

  const handleDeleteCourseSection = async () => {
    if (!window.confirm("Are you sure you want to remove this section?"))
      return;

    await deleteCourseSection({
      variables: {
        courseSectionId: courseSection.id,
      },
    });

    refreshData && refreshData();
    setCourseSectionSettingsModalOpen(false);
  };

  return (
    <div>
      <div className="absolute -translate-x-3 -translate-y-10">
        <IconTooltip
          faIcon={faGear}
          onClick={() => setCourseSectionSettingsModalOpen(true)}
          size="lg"
          tooltip="Section Settings"
          tooltipProps={{ className: "w-32" }}
          className="text-gray-500"
        />
      </div>
      <Modal
        open={courseSectionSettingsModalOpen}
        close={() => setCourseSectionSettingsModalOpen(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          Section Settings
        </h2>
        <AsyncForm
          onSubmit={handleUpdateCourseSection}
          buttonProps={{ children: "Save", className: "float-right" }}
        >
          <TextInput
            label="Section Title"
            name="courseSectionTitle"
            defaultValue={courseSection.title as string}
            required
          />
          <hr className="my-3" />
          <ButtonGroup className="inline" spaced>
            <AsyncButton
              variant="red"
              className="w-28"
              onClick={handleDeleteCourseSection}
            >
              Remove
            </AsyncButton>
            <Button
              variant="secondary"
              className="w-28"
              onClick={() => setCourseSectionSettingsModalOpen(false)}
            >
              Close
            </Button>
          </ButtonGroup>
        </AsyncForm>
      </Modal>
    </div>
  );
}
