import { useMutation } from "@apollo/client";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import AsyncButton from "atoms/AsyncButton";
import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import ButtonGroup from "atoms/ButtonGroup";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import IconTooltip from "components/IconTooltip";
import DeleteMainSection from "graphql/DeleteMainSection";
import UpdateMainSection from "graphql/UpdateMainSection";
import { getElementsVals } from "helpers/getElementsVals";
import CoursePageContext from "pages/CoursePage/context";
import React, { useContext, useState } from "react";
import type { MainSection } from "types";

interface MainSectionSettingsProps {
  mainSection: MainSection;
}

export default function MainSectionSettings({
  mainSection,
}: MainSectionSettingsProps) {
  const { refreshData } = useContext(CoursePageContext);
  const [updateMainSection] = useMutation(UpdateMainSection);
  const [deleteMainSection] = useMutation(DeleteMainSection);
  const [mainSectionSettingsModalOpen, setMainSectionSettingsModalOpen] =
    useState(false);

  const handleUpdateMainSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { mainSectionTitle } = getElementsVals(e.target as HTMLFormElement, [
      "mainSectionTitle",
    ]);

    await updateMainSection({
      variables: {
        title: mainSectionTitle,
        mainSectionId: mainSection.id,
      },
    });

    refreshData && refreshData();
    setMainSectionSettingsModalOpen(false);
  };

  const handleDeleteMainSection = async () => {
    if (!window.confirm("Are you sure you want to remove this section?"))
      return;

    await deleteMainSection({
      variables: {
        mainSectionId: mainSection.id,
      },
    });

    refreshData && refreshData();
    setMainSectionSettingsModalOpen(false);
  };

  return (
    <div>
      <div className="absolute -translate-x-3 -translate-y-10">
        <IconTooltip
          faIcon={faGear}
          onClick={() => setMainSectionSettingsModalOpen(true)}
          size="lg"
          tooltip="Section Settings"
          tooltipProps={{ className: "w-32" }}
          className="text-gray-500"
        />
      </div>
      <Modal
        open={mainSectionSettingsModalOpen}
        close={() => setMainSectionSettingsModalOpen(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          Section Settings
        </h2>
        <AsyncForm
          onSubmit={handleUpdateMainSection}
          buttonProps={{ children: "Save", className: "float-right" }}
        >
          <TextInput
            label="Section Title"
            name="mainSectionTitle"
            defaultValue={mainSection.title as string}
            required
          />
          <hr className="my-3" />
          <ButtonGroup className="inline" spaced>
            <AsyncButton
              variant="danger"
              className="w-28"
              onClick={handleDeleteMainSection}
            >
              Remove
            </AsyncButton>
            <Button
              variant="secondary"
              className="w-28"
              onClick={() => setMainSectionSettingsModalOpen(false)}
            >
              Close
            </Button>
          </ButtonGroup>
        </AsyncForm>
      </Modal>
    </div>
  );
}
