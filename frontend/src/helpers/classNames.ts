/**
 * Combine different classes, if they are truthy
 * @param classes Classes to combine
 * @returns Classes combined into a single string
 */
export default function classNames(
  ...classes: (string | undefined | false | null)[]
) {
  return classes.filter(Boolean).join(" ");
}
