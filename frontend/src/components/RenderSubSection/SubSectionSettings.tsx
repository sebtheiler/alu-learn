import { useMutation } from "@apollo/client";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import AsyncButton from "atoms/AsyncButton";
import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import ButtonGroup from "atoms/ButtonGroup";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import IconTooltip from "components/IconTooltip";
import DeleteSubSection from "graphql/DeleteSubSection";
import UpdateSubSection from "graphql/UpdateSubSection";
import { getElementsVals } from "helpers/getElementsVals";
import CoursePageContext from "pages/CoursePage/context";
import React, { useContext, useState } from "react";
import type { SubSection } from "types";

interface SubSectionSettingsProps {
  subSection: SubSection;
}

export default function SubSectionSettings({
  subSection,
}: SubSectionSettingsProps) {
  const { refreshData } = useContext(CoursePageContext);
  const [updateSubSection] = useMutation(UpdateSubSection);
  const [deleteSubSection] = useMutation(DeleteSubSection);
  const [subSectionSettingsModalOpen, setSubSectionSettingsModalOpen] =
    useState(false);

  const handleUpdateSubSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { subSectionTitle } = getElementsVals(e.target as HTMLFormElement, [
      "subSectionTitle",
    ]);

    await updateSubSection({
      variables: {
        title: subSectionTitle,
        subSectionId: subSection.id,
      },
    });

    refreshData && refreshData();
    setSubSectionSettingsModalOpen(false);
  };

  const handleDeleteSubSection = async () => {
    if (!window.confirm("Are you sure you want to remove this sub section?"))
      return;

    await deleteSubSection({
      variables: {
        subSectionId: subSection.id,
      },
    });

    refreshData && refreshData();
    setSubSectionSettingsModalOpen(false);
  };

  return (
    <div>
      <div className="absolute right-1 top-1">
        <IconTooltip
          faIcon={faGear}
          onClick={() => setSubSectionSettingsModalOpen(true)}
          size="lg"
          tooltip="Sub-section Settings"
          tooltipProps={{ className: "w-40" }}
          className="text-gray-500"
        />
      </div>
      <Modal
        open={subSectionSettingsModalOpen}
        close={() => setSubSectionSettingsModalOpen(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          Sub-section Settings
        </h2>
        <AsyncForm
          onSubmit={handleUpdateSubSection}
          buttonProps={{ children: "Save", className: "float-right" }}
        >
          <TextInput
            label="Sub-section Title"
            name="subSectionTitle"
            defaultValue={subSection.title as string}
            required
          />
          <hr className="my-3" />
          <ButtonGroup className="inline" spaced>
            <AsyncButton
              variant="danger"
              className="w-28"
              onClick={handleDeleteSubSection}
            >
              Remove
            </AsyncButton>
            <Button
              variant="secondary"
              className="w-28"
              onClick={() => setSubSectionSettingsModalOpen(false)}
            >
              Close
            </Button>
          </ButtonGroup>
        </AsyncForm>
      </Modal>
    </div>
  );
}
