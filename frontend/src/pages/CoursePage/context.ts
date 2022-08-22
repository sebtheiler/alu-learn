import { createContext } from "react";
import type { Course } from "types";

interface CoursePageContextI {
  course?: Course;
  refreshData?(): void;
}

const CoursePageContext = createContext<CoursePageContextI>({
  course: undefined,
  refreshData: undefined,
});

export default CoursePageContext;
