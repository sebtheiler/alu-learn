import { INSERT_EQUATION_COMMAND } from "./EquationPlugin";
import Button from "@/atoms/Button";
import Checkbox from "@/atoms/Checkbox";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import type { LexicalEditor } from "lexical";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const TeX = dynamic(() => import("@/components/TeX"), {
  // suspense: true,
  ssr: false,
  loading: () => <p>Loading KaTeX...</p>,
});

interface InsertEquationModalProps {
  open: boolean;
  close(): void;
  editor: LexicalEditor;
}
export default function InsertEquationModal({
  open,
  close,
  editor,
}: InsertEquationModalProps) {
  const [equation, setEquation] = useState("");
  const [inline, setInline] = useState(true);

  const insertEquation = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      editor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline });
      setEquation("");
      setInline(true);
      close();
    },
    [editor, equation, inline, close]
  );

  return (
    <Modal open={open} close={close} title="Insert Equation">
      <hr className="my-2" />
      <form onSubmit={insertEquation}>
        <TextInput
          label="Equation (KaTeX)"
          name="equation"
          onChange={(e) => setEquation(e.target.value)}
          required
        />
        <Checkbox
          label="Inline"
          className="my-3"
          name="inline"
          onChange={(e) => setInline(e.target.checked)}
          defaultChecked
        />
        <div className="my-3">
          <h3 className="text-lg font-bold">Equation Preview</h3>
          <TeX math={equation} block={!inline} />
        </div>
        <Button type="submit" className="mt-3" block>
          Insert
        </Button>
      </form>
    </Modal>
  );
}
