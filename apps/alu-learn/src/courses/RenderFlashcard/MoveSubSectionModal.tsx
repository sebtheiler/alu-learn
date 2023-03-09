import Modal from "alu-ui/src/Modal";
import GetCourseSubSections from "graphql-operations/operations/GetCourseSubSections";
import MoveFlashcardToSubSection from "graphql-operations/operations/MoveFlashcardToSubSection";
import type {
  Mutation,
  MutationMoveFlashcardToSubSectionArgs,
  Query,
  QueryGetCourseSubSectionsArgs,
  SubSection,
} from "@/types";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";

export default function MoveSubSectionModal({
  open,
  close,
  courseId,
  flashcardId,
}: {
  open: boolean;
  close(): void;
  courseId: string;
  flashcardId: string;
}) {
  const { data, loading } = useQuery<
    { getFlashcard: Query["getCourseSubSections"] },
    QueryGetCourseSubSectionsArgs
  >(GetCourseSubSections, { variables: { courseId }, skip: !open });
  const [moveFlashcardToSubSection] = useMutation<
    { moveFlashcardToSubSection: Mutation["moveFlashcardToSubSection"] },
    MutationMoveFlashcardToSubSectionArgs
  >(MoveFlashcardToSubSection);
  const router = useRouter();

  const moveTo = async (subSection: SubSection) => {
    const { data } = await moveFlashcardToSubSection({
      variables: {
        subSectionId: subSection.id as string,
        flashcardId,
      },
    });

    const url = data?.moveFlashcardToSubSection;
    if (url) router.push(url);
    close();
  };

  return (
    <Modal open={open} close={close} title="Move to Different Sub-section">
      {loading && <p>Loading...</p>}
      {/* @ts-ignore */}
      {data?.getCourseSubSections?.map((subSection: SubSection) => (
        <div
          key={subSection?.id}
          className="bg-gray-100 border-2 border-gray-200 rounded-lg my-2 px-3 py-2 text-center hover:scale-105 hover:cursor-pointer transition"
          role="button"
          onClick={() => moveTo(subSection)}
        >
          {subSection?.title}
        </div>
      ))}
    </Modal>
  );
}
