import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import Checkbox from "@/atoms/Checkbox";
import Modal from "@/atoms/Modal";
import Tooltip from "@/atoms/Tooltip";
import CreateFlashcardReport from "@/graphql/CreateFlashcardReport";
import type { Mutation, MutationCreateFlashcardReportArgs } from "@/types";
import { useMutation } from "@apollo/client";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Report({ flashcardId }: { flashcardId: string }) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [createFlashcardReport] = useMutation<
    { createFlashcardReport: Mutation["createFlashcardReport"] },
    MutationCreateFlashcardReportArgs
  >(CreateFlashcardReport);

  const submitReport = async () => {
    const reasonEls = document.getElementsByName(
      "reason"
    ) as NodeListOf<HTMLInputElement>;
    const reasons = Array.from(reasonEls)
      .filter((el) => el.checked)
      .map((el) => el.value);

    await createFlashcardReport({
      variables: {
        reasons: reasons.join(", "),
        flashcardId,
      },
    });

    setFinished(true);
  };

  return (
    <>
      <div className="absolute left-3 md:left-12 -bottom-12 sm:bottom-0">
        <Tooltip tooltip="Report Flashcard" className="w-32">
          <Button
            faIcon={faFlag}
            className="px-[14px]"
            variant="red"
            onClick={() => setReportModalOpen(true)}
          />
        </Tooltip>
      </div>
      <Modal
        open={reportModalOpen}
        close={() => setReportModalOpen(false)}
        title="Report Flashcard"
      >
        {finished ? (
          <div className="text-center">
            <p>
              Your report has been submitted and the owners of the course have
              been notified. Thank you for taking the time to improve the
              quality of the flashcards on Alu.
            </p>
            <br />
            <Button
              onClick={() => {
                setReportModalOpen(false);
                setTimeout(() => setFinished(false), 1000);
              }}
              variant="secondary"
            >
              Close
            </Button>
          </div>
        ) : (
          <AsyncForm
            onSubmit={submitReport}
            buttonProps={{ variant: "red", children: "Report", block: true }}
          >
            <p className="mb-1">Select reasons</p>
            <Checkbox
              name="reason"
              label="Inaccurate definition"
              value="INACCURATE"
            />
            <Checkbox name="reason" label="Too wordy" value="WORDY" />
            <Checkbox
              name="reason"
              label="Needs more detail"
              value="NEEDS_DETAIL"
            />
            <Checkbox
              name="reason"
              label="Unclear definition"
              value="UNCLEAR"
            />
            <Checkbox name="reason" label="Broken image" value="BROKEN_IMAGE" />
            <Checkbox
              name="reason"
              label="Typo/grammatical error"
              value="TYPO"
            />
            <Checkbox
              name="reason"
              label="Inappropriate"
              value="INAPPROPRIATE"
            />
            <Checkbox
              name="reason"
              label="Needs general improvement"
              value="GENERAL"
            />
            <Checkbox name="reason" label="Other" value="OTHER" />
            <br />
          </AsyncForm>
        )}
      </Modal>
    </>
  );
}
