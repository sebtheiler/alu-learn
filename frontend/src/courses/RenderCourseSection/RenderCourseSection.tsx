import CourseSectionSettings from "./CourseSectionSettings";
import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import LinkButton from "@/atoms/LinkButton";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import Tooltip from "@/atoms/Tooltip";
import CoursePageContext from "@/courses/RenderCourse/context";
import RenderSubSection from "@/courses/RenderSubSection";
import CreateSubSection from "@/graphql/CreateSubSection";
import MoveSubSection from "@/graphql/MoveSubSection";
import { getElementsVals } from "@/helpers/getElementsVals";
import type {
  CourseSection,
  Mutation,
  MutationCreateSubSectionArgs,
  MutationMoveSubSectionArgs,
  SubSection,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faGripHorizontal, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import type { SortableEvent } from "react-sortablejs";

const factor = 100;
const xScale = [0, 1, 0, -1];

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
  const { course, editAccess } = useContext(CoursePageContext);
  const [createSubSectionModalOpen, setCreateSubSectionModalOpen] =
    useState(false);
  const [createSubSection] = useMutation<
    { createSubSection: Mutation["createSubSection"] },
    MutationCreateSubSectionArgs
  >(CreateSubSection);

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

    const { data } = await createSubSection({
      variables: {
        title: subSectionTitle,
        courseSectionId: courseSection.id as string,
      },
    });

    if (data?.createSubSection)
      setSubSections([
        ...subSections,
        data?.createSubSection as SubSectionWithId,
      ]);
    setCreateSubSectionModalOpen(false);
  };

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

  console.log(subSections);

  const renderedSubSections = useMemo(
    () =>
      subSections.map((subSection, i) => (
        <RenderSubSection
          subSection={subSection as SubSection}
          courseSection={courseSection}
          key={subSection?.id}
          style={{
            // Can't use translate because that messes up z-index and
            // some stuff with drag-and-drop
            marginLeft: `${xScale[i % xScale.length] * factor}px`,
            marginBottom: `-15px`,
          }}
        />
      )),
    [courseSection, subSections]
  );

  return (
    <section className="max-w-xl mx-auto">
      <header className="bg-blue-500 flex p-5 rounded-xl text-white">
        {editAccess && (
          <div className="absolute -translate-y-4 -translate-x-6">
            <span title="Drag to rearrange">
              <FontAwesomeIcon
                icon={faGripHorizontal}
                // `.course-section-drag-handle` is the handle class defined in `CoursePage.tsx`
                className="text-white mx-3 hover:cursor-grab course-section-drag-handle"
              />
            </span>
          </div>
        )}
        <div className="w-2/3">
          <h1 className="text-xl font-bold">{courseSection.title}</h1>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolorum
            nam vero sed quaerat. Nulla esse aut ipsa
          </p>
        </div>
        <div className="w-1/3">
          <ButtonGroup spaced vertical>
            <LinkButton
              href={`/course/${course?.id}/study/${courseSection.slug}`}
              variant="transparent"
              block
            >
              Study
            </LinkButton>
            <LinkButton
              href={`/course/${course?.id}/flashcards/${courseSection.slug}`}
              variant="transparent"
              block
            >
              View Flashcards
            </LinkButton>
          </ButtonGroup>
        </div>
        {editAccess && <CourseSectionSettings courseSection={courseSection} />}
      </header>
      <div>
        {editAccess ? (
          <ReactSortable
            list={subSections}
            setList={setSubSections}
            onEnd={onSubSectionDragEnd}
            handle=".sub-section-drag-handle"
          >
            {renderedSubSections}
          </ReactSortable>
        ) : (
          renderedSubSections
        )}
      </div>
      {subSections.length === 0 && (
        <p className="text-center mb-4">
          This section doesn&apos;t have any sub-sections yet. Create one with
          the &quot;+&quot; icon!
        </p>
      )}
      {editAccess && (
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
      )}
    </section>
  );
}
