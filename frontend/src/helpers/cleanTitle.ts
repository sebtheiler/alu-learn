export const cleanTitle = (title?: string) =>
  title
    ? encodeURIComponent(
        title.toLowerCase().replaceAll("-", ".d.").replaceAll(" ", "-")
      )
    : undefined;
export const uncleanTag = (tags: string) =>
  tags.replaceAll("-", " ").replaceAll("__", " AND ").replace(".d.", "-");
