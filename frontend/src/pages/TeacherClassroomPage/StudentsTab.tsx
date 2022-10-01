import Button from "@/atoms/Button";
import Modal from "@/atoms/Modal";
import CopyLink from "@/components/CopyLink";
import IconTooltip from "@/components/IconTooltip";
import RemoveStudentFromClassroom from "@/graphql/RemoveStudentFromClassroom";
import formatPlural from "@/helpers/formatPlural";
import formatTimeTaken from "@/helpers/formatTimeTaken";
import type {
  Classroom,
  Mutation,
  MutationRemoveStudentFromClassroomArgs,
  User,
  UserWithHistory,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

export default function StudentsTab({
  students,
  classroom,
}: {
  students: UserWithHistory[];
  classroom: Classroom;
}) {
  const router = useRouter();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // const [studentsToInvite, setStudentsToInvite] = useState<User[]>([])
  const [removeStudentFromClassroom] = useMutation<
    { removeStudentFromClassroom: Mutation["removeStudentFromClassroom"] },
    MutationRemoveStudentFromClassroomArgs
  >(RemoveStudentFromClassroom);

  const removeStudentHandler =
    (student: User) => async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        !window.confirm(
          `Are you sure you want to remove ${student.name} from this class?`
        )
      )
        return;

      await removeStudentFromClassroom({
        variables: {
          studentId: student.id as string,
          classroomId: classroom.id as string,
        },
      });

      router.push(router.asPath);
    };

  return (
    <>
      <h2 className="mt-3 mb-2 text-center font-bold text-2xl">Students</h2>
      {students.length > 0 ? (
        <ul className="border-2 border-gray-200 rounded-xl overflow-hidden">
          <li className="flex items-center border-b-2 border-gray-200 p-3 font-bold">
            <span className="w-1/3 flex items-center">Name</span>
            <span className="w-1/3">Flashcards Reviewed</span>
            <span className="w-1/3">Time Spent</span>
          </li>
          {students.map((student) => (
            <li
              key={student.id}
              className="flex items-center border-b-2 border-gray-200 last:border-b-0 p-3 hover:bg-gray-100 relative"
            >
              <span className="w-1/3 flex items-center">
                {student.image && (
                  <Image
                    src={student.image}
                    width={28}
                    height={28}
                    alt={`${student.name}'s profile picture`}
                    className="rounded-full"
                  />
                )}
                <span className="ml-1">{student.name}</span>
              </span>
              <span className="w-1/3">
                {formatPlural(
                  student.history[0]?.reviewsStudied ?? 0,
                  "flashcard"
                )}
              </span>
              <span className="w-1/3">
                {formatTimeTaken(student.history[0]?.timeTaken ?? 0)}
              </span>
              <IconTooltip
                faIcon={faX}
                className="absolute right-5 top-4 text-gray-600"
                title="Remove Student"
                onClick={removeStudentHandler(student)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center mt-2">This class has no students yet</p>
      )}
      <div className="text-center">
        <Button
          faIcon={faPlus}
          className="mt-2"
          onClick={() => setInviteModalOpen(true)}
        >
          Invite Students
        </Button>
        <Modal
          open={inviteModalOpen}
          close={() => setInviteModalOpen(false)}
          title="Invite Students"
        >
          <div>
            <h2 className="text-xl font-bold">Link</h2>
            <p>Share this link to invite students to your class</p>
            <CopyLink link={`join-classroom/${classroom.joinCode}`} />
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold">Code</h2>
            <p>
              Students can enter this code to join your class:{" "}
              <span className="font-bold">{classroom.joinCode}</span>
            </p>
          </div>
          {/* <div className="mt-3">
              <h2 className="text-xl font-bold">Direct Invite</h2>
              <p>Search for a student below to invite them to your class. Only works if the user currently has an Alu account.</p>
              <SearchUser onUserSelect={(student) => setStudentsToInvite([...studentsToInvite, student])} placeholder="Search for student by name" />
              {studentsToInvite.length > 0 && <><ul className="list-disc">
                {studentsToInvite.map(student => <li key={student.id}>{student.name}</li>)}
              </ul><Button>Invite Students</Button></>}
            </div> */}
        </Modal>
      </div>
    </>
  );
}
