import type { Course } from "@/types";
import { createContext } from "react";

interface CoursePageContextI {
  course?: Course;
  refreshData?(): void;
  editAccess?: boolean;
  percentComplete?: {
    calculateSubSectionsPercentComplete: {
      [subSectionId: string]: {
        currentPercentComplete: number;
        totalPercentComplete: number;
      };
    };
  };
}

const CoursePageContext = createContext<CoursePageContextI>({
  course: undefined,
  refreshData: undefined,
  editAccess: undefined,
  percentComplete: undefined,
});

export default CoursePageContext;
