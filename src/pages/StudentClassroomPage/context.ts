import type { Classroom } from "@/types";
import { createContext } from "react";

interface ClassroomPageContextI {
  classroom?: Classroom;
}

const ClassroomPageContext = createContext<ClassroomPageContextI>({
  classroom: undefined,
});

export default ClassroomPageContext;
