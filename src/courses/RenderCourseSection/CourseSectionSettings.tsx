import AsyncButton from "@/atoms/AsyncButton";
import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import Modal from "@/atoms/Modal";
import Select from "@/atoms/Select";
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

const colorOptions = [
  { value: "BLUE", label: "Blue" },
  { value: "GREEN", label: "Green" },
  { value: "LIME", label: "Lime" },
  { value: "ORANGE", label: "Orange" },
  { value: "PINK", label: "Pink" },
  { value: "PURPLE", label: "Purple" },
  { value: "RED", label: "Red" },
  { value: "SKY", label: "Sky" },
];

export const colorMap = new Map([
  ["BLUE", "bg-blue-500"],
  ["GREEN", "bg-green-500"],
  ["LIME", "bg-lime-500"],
  ["ORANGE", "bg-orange-500"],
  ["PINK", "bg-pink-500"],
  ["PURPLE", "bg-purple-500"],
  ["RED", "bg-red-500"],
  ["SKY", "bg-sky-500"],
]);

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
    const { courseSectionTitle, color, description } = getElementsVals(
      e.target as HTMLFormElement,
      ["courseSectionTitle", "color", "description"]
    );

    await updateCourseSection({
      variables: {
        title: courseSectionTitle,
        courseSectionId: courseSection.id,
        description,
        color,
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
      <div className="absolute -translate-x-1 -translate-y-4">
        <IconTooltip
          faIcon={faGear}
          onClick={() => setCourseSectionSettingsModalOpen(true)}
          size="lg"
          tooltip="Section Settings"
          tooltipProps={{ className: "w-32" }}
          className="text-white"
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
            className="mb-3"
            required
          />
          <Select
            label="Color"
            name="color"
            defaultValue={courseSection.color as string}
            className="mb-3"
            options={colorOptions}
          />
          <TextInput
            label="Description"
            name="description"
            defaultValue={courseSection.description as string}
            className="mb-3"
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
