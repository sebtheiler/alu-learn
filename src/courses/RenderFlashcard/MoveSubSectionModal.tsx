import Modal from "@/atoms/Modal";
import GetCourseSubSections from "@/graphql/GetCourseSubSections";
import type { Query, QueryGetCourseSubSectionsArgs } from "@/types";
import { useQuery } from "@apollo/client";

export default function MoveSubSectionModal({
  open,
  close,
  courseId,
}: {
  open: boolean;
  close(): void;
  courseId: string;
}) {
  const { data, loading } = useQuery<
    { getFlashcard: Query["getCourseSubSections"] },
    QueryGetCourseSubSectionsArgs
  >(
    GetCourseSubSections,
    { variables: { courseId }, skip: !open });
  console.log(data);

  const moveTo = (subSectionId: string) => {
    
  }

  return (
    <Modal open={open} close={close} title="Move to Different Sub-section">
      {loading && <p>Loading...</p>}
      {/* @ts-ignore */}
      {data?.getCourseSubSections?.map((subSection) => (
        <div
          key={subSection?.id}
          className="bg-gray-100 border-2 border-gray-200 rounded-lg my-2 px-3 py-2 text-center hover:scale-105 hover:cursor-pointer transition"
          role="button"
          onClick={() => moveTo(subSection.id)}
        >
          {subSection?.title}
        </div>
      ))}
    </Modal>
  );
}
