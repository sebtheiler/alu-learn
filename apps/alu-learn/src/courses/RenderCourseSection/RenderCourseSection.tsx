import CourseSectionSettings, { colorMap } from "./CourseSectionSettings";
import AsyncForm from "alu-ui/src/AsyncForm";
import Button from "alu-ui/src/Button";
import ButtonGroup from "alu-ui/src/ButtonGroup";
import LinkButton from "alu-ui/src/LinkButton";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import Tooltip from "alu-ui/src/Tooltip";
import CoursePageContext from "@/courses/RenderCourse/context";
import RenderSubSection from "@/courses/RenderSubSection";
import CreateSubSection from "graphql-operations/operations/CreateSubSection";
import MoveSubSection from "graphql-operations/operations/MoveSubSection";
import classNames from "helpers-lib/src/classNames";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import type {
  AssignedState,
  CourseSection,
  Mutation,
  MutationCreateSubSectionArgs,
  MutationMoveSubSectionArgs,
  SubSection,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faGripHorizontal, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useMemo, useState } from "react";
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
  /**
   * Collapse the sub sections of the course section?
   */
  collapsedSubSections?: boolean;
  /**
   * IDs of which sub sections are assigned
   */
  assignedSubSections?: { id: string; essentialOnly: boolean }[];
}

/**
 * Renders a course section for use in displaying a course.
 * Needs to have `course` and `refreshData` in the `CoursePageContext` provider.
 */
export default function RenderCourseSection({
  courseSection,
  collapsedSubSections,
  assignedSubSections,
}: RenderCourseSectionProps) {
  const { course, editAccess } = useContext(CoursePageContext);
  const [createSubSectionModalOpen, setCreateSubSectionModalOpen] =
    useState(false);
  const [createSubSection] = useMutation<
    { createSubSection: Mutation["createSubSection"] },
    MutationCreateSubSectionArgs
  >(CreateSubSection);

  // This needs to be a separate state from the props because of `ReactSortable`
  const [subSections, setSubSections] = useState<SubSectionWithId[]>(
    courseSection.subSections as SubSectionWithId[]
  );
  const [moveSubSection] = useMutation<
    { moveSubSection: Mutation["moveSubSection"] },
    MutationMoveSubSectionArgs
  >(MoveSubSection);

  // Update sub sections when props change
  useEffect(() => {
    setSubSections(courseSection.subSections as SubSectionWithId[]);
  }, [courseSection.subSections]);

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

  const renderedSubSections = useMemo(
    () =>
      subSections.map((subSection, i) => {
        // NOTE: the `!assignedSubSections || asignedIndex === -1` could be reduced to
        // just `assignedIndex === -1`, but TypeScript isn't that smart
        const assignedIndex =
          assignedSubSections?.findIndex((ss) => ss.id === subSection.id) ?? -1;
        const assigned: AssignedState =
          !assignedSubSections || assignedIndex === -1
            ? "NOT_ASSIGNED"
            : assignedSubSections[assignedIndex].essentialOnly
            ? "ASSIGNED_ESSENTIAL_ONLY"
            : "ASSIGNED_ALL";

        return (
          <RenderSubSection
            subSection={subSection as SubSection}
            courseSection={courseSection}
            assigned={assigned}
            key={subSection?.id}
            style={{
              // Can't use translate because that messes up z-index and
              // some stuff with drag-and-drop
              marginLeft: `${xScale[i % xScale.length] * factor}px`,
              marginBottom: `-15px`,
            }}
          />
        );
      }),
    [courseSection, subSections, assignedSubSections]
  );

  return (
    <section className="w-full md:max-w-xl mx-auto mb-20">
      <header
        className={classNames(
          "flex p-5 md:rounded-xl text-white",
          colorMap.get(courseSection.color as string)
        )}
      >
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
          <h2 className="text-xl font-bold">{courseSection.title}</h2>
          <p>{courseSection.description}</p>
        </div>
        <div className="w-1/3 flex items-center">
          <ButtonGroup className="w-full" spaced vertical>
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
              View
            </LinkButton>
          </ButtonGroup>
        </div>
        {editAccess && <CourseSectionSettings courseSection={courseSection} />}
      </header>
      {!collapsedSubSections && (
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
          {subSections.length === 0 && (
            <p className="text-center mb-4">
              This section doesn&apos;t have any sub-sections yet. Create one
              with the &quot;+&quot; icon!
            </p>
          )}
          {editAccess && (
            <div className="float-right -translate-y-12">
              <Tooltip tooltip="Add Sub-section" className="w-32">
                <Button
                  faIcon={faPlus}
                  className="!px-4"
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
        </div>
      )}
    </section>
  );
}
