import CourseSectionSettings from "./CourseSectionSettings";
import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import Tooltip from "@/atoms/Tooltip";
import RenderSubSection from "@/courses/RenderSubSection";
import CreateSubSection from "@/graphql/CreateSubSection";
import MoveSubSection from "@/graphql/MoveSubSection";
import { getElementsVals } from "@/helpers/getElementsVals";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import CoursePageContext from "@/pages/CoursePage/context";
import type {
  CourseSection,
  Mutation,
  MutationMoveSubSectionArgs,
  SubSection,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faGripVertical, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import type { SortableEvent } from "react-sortablejs";

type SubSectionWithId = SubSection & { id: string };

interface RenderCourseSectionProps {
  /**
   * Course section to render
   */
  courseSection: CourseSection;
}

/**
 * Renders a course section for use in displaying a course.
 * Needs to have `course` and `refreshData` in the `CoursePageContext` provider.
 */
export default function RenderCourseSection({
  courseSection,
}: RenderCourseSectionProps) {
  const { course, refreshData } = useContext(CoursePageContext);
  const [createSubSectionModalOpen, setCreateSubSectionModalOpen] =
    useState(false);
  const [createSubSection] = useMutation(CreateSubSection);

  const [subSections, setSubSections] = useState<SubSectionWithId[]>(
    courseSection.subSections as SubSectionWithId[]
  );
  const [moveSubSection] = useMutation<
    { moveSubSection: Mutation["moveSubSection"] },
    MutationMoveSubSectionArgs
  >(MoveSubSection);

  const handleCreateSubSection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const { subSectionTitle } = getElementsVals(e.target as HTMLFormElement, [
      "subSectionTitle",
    ]);

    await createSubSection({
      variables: {
        title: subSectionTitle,
        courseSectionId: courseSection.id,
      },
    });

    refreshData && refreshData();
    setCreateSubSectionModalOpen(false);
  };

  const { width } = useWindowDimensions();

  const onSubSectionDragEnd = (evt: SortableEvent) => {
    if (evt.oldIndex === undefined || evt.newIndex === undefined) return;

    moveSubSection({
      variables: {
        courseSectionId: courseSection.id as string,
        from: evt.oldIndex,
        to: evt.newIndex,
      },
    });
  };

  return (
    <div className="border-gray-200 border-4 bg-gray-50 rounded-[1rem] px-4 py-3 max-w-5xl mx-auto mb-8">
      <div className="flex items-center mt-4 mb-3">
        <div className="absolute -translate-y-6 -translate-x-3">
          <span title="Drag to rearrange">
            <FontAwesomeIcon
              icon={faGripVertical}
              // `.course-section-drag-handle` is the handle class defined in `CoursePage.tsx`
              className="text-gray-400 mx-3 hover:cursor-grab course-section-drag-handle"
            />
          </span>
        </div>
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
        <div className="flex-grow-0 mx-5 text font-bold text-center text-3xl">
          {courseSection?.title?.toUpperCase()}
        </div>
        <div className="flex-grow bg bg-gray-300 h-0.5"></div>
        <CourseSectionSettings courseSection={courseSection} />
      </div>
      <ButtonGroup
        className="text-center"
        fixedWidth="175px"
        spaced
        vertical={width < 640}
      >
        {/* <LinkButton href={`/course/${course?.id}/learn/${courseSection.slug}`}>
          Learn Content
        </LinkButton> */}
        <LinkButton href={`/course/${course?.id}/study/${courseSection.slug}`}>
          Study
        </LinkButton>
        <LinkButton
          href={`/course/${course?.id}/flashcards/${courseSection.slug}`}
        >
          Flashcards
        </LinkButton>
        {/* <DropdownButton
          options={[
            {
              text: "Games",
              href: `/course/${course?.id}/games/${courseSection.slug}`,
            },
            {
              text: "Practice Problems",
              href: `/course/${course?.id}/practice/${courseSection.slug}`,
            },
          ]}
        >
          More
        </DropdownButton> */}
      </ButtonGroup>
      <ReactSortable
        list={subSections}
        setList={setSubSections}
        onEnd={onSubSectionDragEnd}
        className="flex flex-wrap px-10 py-5"
      >
        {subSections.map((subSection) => (
          <RenderSubSection
            subSection={subSection as SubSection}
            courseSection={courseSection}
            key={subSection?.id}
          />
        ))}
      </ReactSortable>
      {subSections.length === 0 && (
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
