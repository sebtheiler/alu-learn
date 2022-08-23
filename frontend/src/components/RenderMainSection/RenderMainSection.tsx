import MainSectionSettings from "./MainSectionSettings";
import { useMutation } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import AsyncForm from "atoms/AsyncForm";
import Button from "atoms/Button";
import ButtonGroup from "atoms/ButtonGroup";
import Dropdown from "atoms/Dropdown";
import LinkButton from "atoms/LinkButton";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
import Tooltip from "atoms/Tooltip";
import RenderSubSection from "components/RenderSubSection";
import CreateSubSection from "graphql/CreateSubSection";
import { cleanTitle } from "helpers/cleanTitle";
import { getElementsVals } from "helpers/getElementsVals";
import useWindowDimensions from "hooks/useWindowDimensions";
import CoursePageContext from "pages/CoursePage/context";
import { useContext, useState } from "react";
import type { MainSection, SubSection } from "types";

interface RenderMainSectionProps {
  /**
   * Main section to render
   */
  mainSection: MainSection;
}

/**
 * Renders a main section for use in displaying a course.
 * Needs to have `course` and `refreshData` in the `CoursePageContext` provider.
 */
export default function RenderMainSection({
  mainSection,
}: RenderMainSectionProps) {
  const { course, refreshData } = useContext(CoursePageContext);
  const [createSubSectionModalOpen, setCreateSubSectionModalOpen] =
    useState(false);
  const [createSubSection] = useMutation(CreateSubSection);

  const handleCreateSubSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { subSectionTitle } = getElementsVals(e.target as HTMLFormElement, [
      "subSectionTitle",
    ]);

    await createSubSection({
      variables: {
        title: subSectionTitle,
        mainSectionId: mainSection.id,
        courseId: course?.id,
      },
    });

    refreshData && refreshData();
    setCreateSubSectionModalOpen(false);
  };

  const { width } = useWindowDimensions();

  return (
    <div className="border-gray-200 border-4 bg-gray-50 rounded-[1rem] px-4 py-3 max-w-5xl mx-auto mb-8">
      <div className="flex items-center mt-4 mb-3">
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
        <div className="flex-grow-0 mx-5 text font-bold text-center text-3xl">
          {mainSection?.title?.toUpperCase()}
        </div>
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
        <MainSectionSettings mainSection={mainSection} />
      </div>
      <ButtonGroup
        className="text-center"
        fixedWidth="175px"
        spaced
        vertical={width < 640}
      >
        <LinkButton
          href={`/course/${course?.id}/learn/${cleanTitle(
            mainSection.title as string
          )}`}
        >
          Learn Content
        </LinkButton>
        <LinkButton
          href={`/course/${course?.id}/flashcards/${cleanTitle(
            mainSection.title as string
          )}`}
        >
          Flashcards
        </LinkButton>
        <Button>
          <Dropdown
            options={[
              {
                text: "Games",
                href: `/course/${course?.id}/games/${cleanTitle(
                  mainSection.title as string
                )}`,
              },
              {
                text: "Practice Problems",
                href: `/course/${course?.id}/practice/${cleanTitle(
                  mainSection.title as string
                )}`,
              },
            ]}
          >
            More
          </Dropdown>
        </Button>
      </ButtonGroup>
      <div className="flex flex-wrap px-10 py-5">
        {mainSection?.subSections?.map((subSection) => (
          <RenderSubSection
            subSection={subSection as SubSection}
            mainSection={mainSection}
            key={subSection?.id}
          />
        ))}
      </div>
      {mainSection.subSections?.length === 0 && (
        <p className="text-center mb-4">
          This section doesn&apos;t have any sub-sections yet. Create one with
          the &quot;+&quot; icon!
        </p>
      )}
      <div className="float-right -translate-y-12">
        <Tooltip tooltip="Add Sub-section" className="w-32">
          <Button
            faIcon={faPlus}
            className="px-4"
            onClick={() => setCreateSubSectionModalOpen(true)}
          />
        </Tooltip>
        <Modal
          open={createSubSectionModalOpen}
          close={() => setCreateSubSectionModalOpen(false)}
        >
          <h2 className="text-2xl font-bold text-center mb-3">
            Add Sub-section
          </h2>
          <AsyncForm
            onSubmit={handleCreateSubSection}
            buttonProps={{ block: true, children: "Add Sub-section" }}
          >
            <TextInput
              label="Sub-section Title"
              className="mb-3"
              name="subSectionTitle"
              required
            />
          </AsyncForm>
        </Modal>
      </div>
    </div>
  );
}
