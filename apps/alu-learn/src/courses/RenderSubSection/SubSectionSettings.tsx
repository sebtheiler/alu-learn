import AsyncButton from "alu-ui/src/AsyncButton";
import AsyncForm from "alu-ui/src/AsyncForm";
import Button from "alu-ui/src/Button";
import ButtonGroup from "alu-ui/src/ButtonGroup";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import IconTooltip from "alu-ui/src/IconTooltip";
import CoursePageContext from "@/courses/RenderCourse/context";
import DeleteSubSection from "graphql-operations/operations/DeleteSubSection";
import UpdateSubSection from "graphql-operations/operations/UpdateSubSection";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import type { SubSection } from "@/types";
import { useMutation } from "@apollo/client";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";

interface SubSectionSettingsProps {
  subSection: SubSection;
  open: boolean;
  setOpen(open: boolean): void;
}

export default function SubSectionSettings({
  subSection,
  open,
  setOpen,
}: SubSectionSettingsProps) {
  const { refreshData } = useContext(CoursePageContext);
  const [updateSubSection] = useMutation(UpdateSubSection);
  const [deleteSubSection] = useMutation(DeleteSubSection);

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
    setOpen(false);
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
    setOpen(false);
  };

  return (
    <div>
      <div className="absolute right-1 top-1">
        <IconTooltip
          faIcon={faGear}
          onClick={() => setOpen(true)}
          size="lg"
          tooltip="Sub-section Settings"
          tooltipProps={{ className: "w-40" }}
          className="text-gray-500"
        />
      </div>
      <Modal open={open} close={() => setOpen(false)}>
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
              variant="red"
              className="w-28"
              onClick={handleDeleteSubSection}
            >
              Remove
            </AsyncButton>
            <Button
              variant="secondary"
              className="w-28"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </ButtonGroup>
        </AsyncForm>
      </Modal>
    </div>
  );
}
