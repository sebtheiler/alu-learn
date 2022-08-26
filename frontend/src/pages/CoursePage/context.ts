import type { Course } from "@/types";
import { createContext } from "react";

interface CoursePageContextI {
  course?: Course;
  refreshData?(): void;
}

const CoursePageContext = createContext<CoursePageContextI>({
  course: undefined,
  refreshData: undefined,
});

export default CoursePageContext;
