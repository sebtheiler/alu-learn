import { MergedObject } from "../types";
import { GlobalContext } from "../src/app/globalContext";
import { trpcNonReact } from "../src/app/util";
import { useContext, useState, useEffect } from "react";

const useGetObject = (): MergedObject | null => {
  const { selectedObject } = useContext(GlobalContext);
  const [object, setObject] = useState<MergedObject | null>(null);

  // Fetch the new article whenever the selected article changes
  useEffect(() => {
    if (selectedObject === null) {
      setObject(null);
      return;
    }
    if (!selectedObject?.id) return;
    (async () => {
      switch (selectedObject.objectType) {
        case "ARTICLE": {
          const article = await trpcNonReact.article.byId.query(
            selectedObject.id as string
          );
          setObject({ objectType: "ARTICLE", ...article });

          break;
        }
        case "EXTRACT": {
          const extract = await trpcNonReact.extract.byId.query(
            selectedObject.id as string
          );
          setObject({ objectType: "EXTRACT", ...extract });
          break;
        }
      }
    })();
  }, [selectedObject]);

  return object;
};

export default useGetObject;
