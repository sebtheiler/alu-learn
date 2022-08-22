export const cleanTitle = (title: string) =>
  encodeURIComponent(
    title.toLowerCase().replaceAll("-", ".d.").replaceAll(" ", "-")
  );
export const uncleanTag = (tags: string) =>
  tags.replaceAll("-", " ").replaceAll("__", " AND ").replace(".d.", "-");
