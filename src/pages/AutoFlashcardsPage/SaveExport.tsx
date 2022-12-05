import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import Tabs from "@/components/Tabs";
import GetCourseSubSections from "@/graphql/GetCourseSubSections";
import MyCourses from "@/graphql/MyCourses";
import SaveGeneratedFlashcards from "@/graphql/SaveGeneratedFlashcards";
import { getElementsVals } from "@/helpers/getElementsVals";
import type {
  Course,
  GeneratedFlashcard,
  Mutation,
  MutationSaveGeneratedFlashcardsArgs,
  Query,
  QueryGetCourseSubSectionsArgs,
  SubSection,
} from "@/types";
import { useMutation, useQuery } from "@apollo/client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SaveExportAutoFlashcards({
  generatedFlashcards,
}: {
  generatedFlashcards: GeneratedFlashcard[];
}) {
  const router=  useRouter();

  const [saveAllModalOpen, setSaveAllModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [saveAllOption, setSaveAllOption] = useState("NEW");
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined
  );

  const { data: coursesData, loading: coursesLoading } = useQuery<{
    myCourses: Query["myCourses"];
  }>(MyCourses, { skip: !(saveAllModalOpen && saveAllOption === "EXISTING") });
  const { data: subSectionsData, loading: subSectionsLoading } = useQuery<
    { getCourseSubSections: Query["getCourseSubSections"] },
    QueryGetCourseSubSectionsArgs
  >(GetCourseSubSections, {
    variables: { courseId: selectedCourse?.id as string },
    skip: !selectedCourse?.id,
  });
  console.log(subSectionsData);

  const [saveGeneratedFlashcards] = useMutation<
    { saveGeneratedFlashcards: Mutation["saveGeneratedFlashcards"] },
    MutationSaveGeneratedFlashcardsArgs
  >(SaveGeneratedFlashcards);

  const saveAll = async ({
    courseTitle,
    subSectionId,
  }: {
    /** Save the flashcards to a new course */
    courseTitle?: string;
    /** Save the flashcards to an existing sub section */
    subSectionId?: string;
  }) => {
    const { data } = await saveGeneratedFlashcards({
      variables: {
        generatedFlashcards,
        courseTitle,
        subSectionId,
      }
    })
    
    if (data?.saveGeneratedFlashcards) router.push(data.saveGeneratedFlashcards);
  };

  return (
    <>
      <ButtonGroup fixedWidth="200px" spaced className="text-center">
        <Button variant="green" onClick={() => setSaveAllModalOpen(true)}>
          Save All
        </Button>
        <Button variant="blue" onClick={() => setExportModalOpen(true)}>
          Export
        </Button>
      </ButtonGroup>
      <Modal
        open={saveAllModalOpen}
        close={() => setSaveAllModalOpen(false)}
        title="Save All Flashcards"
      >
        <Tabs
          tabs={[
            { label: "Create New", value: "NEW" },
            { label: "Add to Existing", value: "EXISTING" },
          ]}
          callback={setSaveAllOption}
          className="mx-auto"
        />
        {saveAllOption === "NEW" && (
          <AsyncForm
            onSubmit={(e) =>
              saveAll({
                courseTitle: getElementsVals(e.target as HTMLFormElement, [
                  "courseTitle",
                ]).courseTitle,
              })
            }
            buttonProps={{
              block: true,
              children: "Save All",
              variant: "green",
            }}
          >
            <TextInput
              label="Course Title"
              name="courseTitle"
              className="my-3"
              required
            />
          </AsyncForm>
        )}
        {saveAllOption === "EXISTING" && (
          <div>
            {selectedCourse && (
              <p className="font-bold mt-2 text-center">
                <FontAwesomeIcon
                  icon={faX}
                  onClick={() => setSelectedCourse(undefined)}
                  className="hover:cursor-pointer"
                />{" "}
                {selectedCourse.title}
              </p>
            )}
            {(coursesLoading || subSectionsLoading) && <p>Loading...</p>}
            {!selectedCourse &&
              coursesData?.myCourses?.map((course: Course | null) => (
                <div
                  key={course?.id}
                  className="bg-gray-100 border-2 border-gray-200 rounded-lg my-2 px-3 py-2 text-center hover:scale-105 hover:cursor-pointer transition"
                  role="button"
                  onClick={() => setSelectedCourse(course as Course)}
                >
                  {course?.title}
                </div>
              ))}
            {subSectionsData?.getCourseSubSections?.map(
              (subSection: SubSection | null) => (
                <div
                  key={subSection?.id}
                  className="bg-gray-100 border-2 border-gray-200 rounded-lg my-2 px-3 py-2 text-center hover:scale-105 hover:cursor-pointer transition"
                  role="button"
                  onClick={() =>
                    saveAll({ subSectionId: subSection?.id as string })
                  }
                >
                  {subSection?.title}
                </div>
              )
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={exportModalOpen}
        close={() => setExportModalOpen(false)}
        title="Export Flashcards"
      >
        <textarea
          rows={10}
          className="border-2 border-alu-primary-purple/20 focus:border-alu-primary-purple rounded-xl p-3 outline-none w-full resize-none transition-all"
          name="exportedFlashcards"
        >
          {generatedFlashcards
            .map((flashcard) => `${flashcard.front}\t${flashcard.back}`)
            .join("\n")}
        </textarea>
        <Button
          onClick={() => {
            // Taken from https://stackoverflow.com/a/65241581/10226703
            const linkEl = document.createElement("a");
            linkEl.href = `data:text/plain;charset=UTF-8,${
              (
                document.getElementsByName(
                  "exportedFlashcards"
                )[0] as HTMLInputElement
              ).value
            }}`;
            linkEl.setAttribute("download", "export.txt");
            linkEl.click();
          }}
          block
        >
          Download .txt File
        </Button>
        <hr className="my-3" />
        <p>
          <strong>Anki:</strong> Download the file, then click
          &quot;Import&quot; in Anki
        </p>
        <p>
          <strong>Quizlet:</strong> Click &quot;Import from Word, Excel, Google
          Docs, etc.&quot;, then copy-paste the text above into the input
        </p>
      </Modal>
    </>
  );
}
