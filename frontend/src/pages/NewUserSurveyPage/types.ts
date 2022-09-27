import type { NewUserSurveyResponse } from "@/types";

export type Question = keyof NewUserSurveyResponse | "name";
