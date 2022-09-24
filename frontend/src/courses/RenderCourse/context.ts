import type { Course } from "@/types";
import { createContext } from "react";

interface CoursePageContextI {
  course?: Course;
  refreshData?(): void;
  editAccess?: boolean;
}

const CoursePageContext = createContext<CoursePageContextI>({
  course: undefined,
  refreshData: undefined,
  editAccess: undefined,
});

export default CoursePageContext;
