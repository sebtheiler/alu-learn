import Button from "alu-ui/src/Button";
import ButtonGroup from "alu-ui/src/ButtonGroup";
import { useContext, useEffect, useState } from "react";
import KnowledgeTree from "./KnowledgeTree/KnowledgeTree";
import AddTopicModal from "./modals/AddTopicModal";
import { GlobalContext } from "../src/app/globalContext";
import dynamic from "next/dynamic";
import matchesShortcut from "../keyboardShortcuts";
import { trpcNonReact } from "../src/app/util";
import Image from "next/image";

const ImportModal = dynamic(import("./modals/ImportModal"), { ssr: false });

const Sidebar: React.FC = () => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addTopicModalOpen, setAddTopicModalOpen] = useState(false);
  const { selectedObject, setSelectedObject } = useContext(GlobalContext);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (matchesShortcut("import", event)) {
        setImportModalOpen(true);
      } else if (matchesShortcut("moveToParent", event) && selectedObject?.id) {
        trpcNonReact.extract.byId
          .query(selectedObject.id)
          .then((extract) => setSelectedObject(extract.parentArticle));
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedObject, setSelectedObject]);

  return (
    <div className="p-3 w-full h-full top-0">
      <div
        onClick={() => setSelectedObject(null)}
        role="button"
        className="hover:cursor-pointer"
      >
        <Image
          src="/logo.svg"
          alt="Alu Read logo"
          className="mb-2"
          width={180}
          height={180}
        />
      </div>
      <KnowledgeTree />
      <ButtonGroup className="mt-4" spaced vertical>
        <Button onClick={() => setImportModalOpen(true)} block>
          Import Article
        </Button>
        <ImportModal
          open={importModalOpen}
          close={() => setImportModalOpen(false)}
        />
        <Button onClick={() => setAddTopicModalOpen(true)} block>
          Add Topic
        </Button>
        <AddTopicModal
          open={addTopicModalOpen}
          close={() => setAddTopicModalOpen(false)}
        />
      </ButtonGroup>
    </div>
  );
};

export default Sidebar;
