import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Button from "alu-ui/src/Button";
import IconTooltip from "alu-ui/src/IconTooltip";
import TextInput from "alu-ui/src/TextInput";
import formatPlural from "helpers-lib/src/formatPlural";
import { RubricI, Col, Row, defaultRubric } from "./rubricPresets";
import Select from "alu-ui/src/Select";
import rubricPresets from "./rubricPresets";

export default function Rubric({
  rubric,
  setRubric,
}: {
  rubric: RubricI;
  setRubric: React.Dispatch<React.SetStateAction<RubricI>>;
}) {
  // Add a new row to the rubric
  function addRow(title: string) {
    setRubric({
      ...rubric,
      rows: [
        ...rubric.rows,
        {
          title,
          // Number of empty cols = number of cols in last row of rubric
          cols: Array(
            rubric.rows[rubric.rows.length - 1]?.cols?.length ?? 4
          ).fill([{ description: "" }]),
        },
      ],
    });
  }

  // Delete a row from the rubric
  function deleteRow(index: number) {
    setRubric({
      ...rubric,
      rows: rubric.rows.filter((_, i) => i !== index),
    });
  }

  // Update the title of a row in the rubric
  function updateRowTitle(index: number, title: string) {
    setRubric({
      ...rubric,
      rows: rubric.rows.map((row, i) => {
        if (i === index) {
          return { ...row, title };
        }
        return row;
      }),
    });
  }

  // Add a new column to the rubric
  function addColumn(description: string, rowIdx: number, index: number) {
    const rows = rubric.rows.map((row, i) =>
      i === rowIdx
        ? {
            ...row,
            cols: [
              ...row.cols.slice(0, index),
              { description },
              ...row.cols.slice(index),
            ],
          }
        : row
    );
    setRubric({ ...rubric, rows });
  }

  // Delete a column from the rubric
  function deleteColumn(rowIdx: number, colIdx: number): void {
    setRubric((prevRubric) => {
      const newRowCols = [...prevRubric.rows[rowIdx].cols];
      newRowCols.splice(colIdx, 1);
      const newRows = [...prevRubric.rows];
      newRows[rowIdx] = {
        ...newRows[rowIdx],
        cols: newRowCols,
      };
      return {
        ...prevRubric,
        rows: newRows,
      };
    });
  }

  // Update the description of a column in the rubric
  function updateColumnDescription(
    row: number,
    col: number,
    description: string
  ) {
    const rows = rubric.rows.map((r, i) => {
      if (i === row) {
        const cols = r.cols.map((c, j) => {
          if (j === col) {
            return { ...c, description };
          }
          return c;
        });
        return { ...r, cols };
      }
      return r;
    });
    setRubric({ ...rubric, rows });
  }

  return (
    <div>
      <Select
        label="Rubric preset"
        defaultValue="none"
        className="mb-4"
        options={rubricPresets.map((preset) => ({
          value: preset.name,
          label: preset.name,
        }))}
        onChange={(selectedPreset) => {
          if (selectedPreset === "none") {
            setRubric(defaultRubric);
            return;
          }
          const newRubric = rubricPresets.find(
            (preset) => preset.name === selectedPreset
          );
          if (newRubric) setRubric(newRubric);
        }}
      />
      {rubric.rows.map((row, i) => (
        <RubricRow
          row={row}
          deleteRow={deleteRow}
          updateRowTitle={updateRowTitle}
          addColumn={addColumn}
          deleteColumn={deleteColumn}
          updateColumnDescription={updateColumnDescription}
          idx={i}
          key={i}
        />
      ))}
      <Button variant="primary-outline" onClick={() => addRow("")}>
        Add row
      </Button>
    </div>
  );
}

function RubricRow({
  row,
  deleteRow,
  updateRowTitle,
  addColumn,
  deleteColumn,
  updateColumnDescription,
  idx,
}: {
  row: Row;
  deleteRow(i: number): void;
  updateRowTitle(i: number, title: string): void;
  addColumn(description: string, rowIdx: number, i: number): void;
  deleteColumn(row: number, col: number): void;
  updateColumnDescription(row: number, col: number, description: string): void;
  idx: number;
}) {
  return (
    <div className="relative p-4 border-alu-primary-purple/20 focus-within:border-alu-primary-purple rounded-xl border-2 transition-all mb-4">
      <TextInput
        label="Row title (required)"
        value={row.title}
        onChange={(e) => updateRowTitle(idx, e.target.value)}
        required
      />
      <div className="mt-4">
        <div className="flex px-4">
          {row.cols.map((col, i) => (
            <RubricCol
              col={col}
              points={row.cols.length - i}
              addColumn={addColumn}
              deleteColumn={deleteColumn}
              updateColumnDescription={updateColumnDescription}
              rowIdx={idx}
              idx={i}
              key={i}
            />
          ))}
        </div>
      </div>
      <div className="w-full text-right absolute pr-6 -translate-y-3">
        <IconTooltip
          faIcon={faTrash}
          tooltip="Delete row"
          tooltipProps={{ className: "w-24" }}
          onClick={() => deleteRow(idx)}
          className="text-gray-500"
        />
      </div>
    </div>
  );
}

function RubricCol({
  col,
  points,
  addColumn,
  deleteColumn,
  updateColumnDescription,
  rowIdx,
  idx,
}: {
  col: Col;
  points: number;
  addColumn(description: string, rowIdx: number, i: number): void;
  deleteColumn(row: number, col: number): void;
  updateColumnDescription(row: number, col: number, description: string): void;
  rowIdx: number;
  idx: number;
}) {
  return (
    <div className="flex flex-col h-32 first:border-l-2 border-r-2 border-gray-300 relative">
      <p className="text-gray-500 text-center mt-2">
        {formatPlural(points, "point")}
      </p>
      <div className="w-full text-right absolute pr-2 translate-y-2">
        <IconTooltip
          faIcon={faTrash}
          tooltip="Delete"
          onClick={() => deleteColumn(rowIdx, idx)}
          className="text-gray-500"
        />
      </div>
      <textarea
        className="block resize-none w-4/5 mx-auto flex-grow outline-none p-2"
        value={col.description}
        onChange={(e) => updateColumnDescription(rowIdx, idx, e.target.value)}
      />
      <button
        className="z-20 absolute top-1/2 -left-[17px] -translate-y-1/2 rounded-full h-8 w-8 bg-white hover:bg-gray-100 border-2 border-gray-300"
        onClick={() => addColumn("", rowIdx, idx)}
      >
        +
      </button>
      <button
        className="z-20 absolute top-1/2 -right-[17px] -translate-y-1/2 rounded-full h-8 w-8 bg-white hover:bg-gray-100 border-2 border-gray-300"
        onClick={() => addColumn("", rowIdx, idx + 1)}
      >
        +
      </button>
    </div>
  );
}
