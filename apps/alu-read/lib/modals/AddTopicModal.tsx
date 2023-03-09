import AsyncForm from "alu-ui/src/AsyncForm";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import { trpc } from "../../src/app/util";

interface AddTopicModalProps {
  open: boolean;
  close(): void;
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({ open, close }) => {
  const utils = trpc.useContext();
  const createTopic = trpc.topic.create.useMutation({
    onSuccess: () => utils.topic.all.invalidate(),
  });

  const addTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const { topicTitle } = getElementsVals(e.target as HTMLFormElement, [
      "topicTitle",
    ]);
    createTopic.mutate({
      title: topicTitle,
    });
    close();
  };

  return (
    <Modal open={open} close={close} title="Add Topic">
      <AsyncForm
        onSubmit={addTopic}
        buttonProps={{ children: "Add Topic", className: "mt-2", block: true }}
      >
        <TextInput label="Topic Title" name="topicTitle" />
      </AsyncForm>
    </Modal>
  );
};

export default AddTopicModal;
