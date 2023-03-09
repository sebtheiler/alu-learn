import { createContext } from "react";
import type { MergedObject } from "../../types";

export type GlobalState = {
  selectedObject: Partial<MergedObject> | null;
  setSelectedObject(object: Partial<MergedObject> | null): void;
};

export const GlobalContext = createContext<GlobalState>({
  selectedObject: null,
  setSelectedObject: () => null,
});
