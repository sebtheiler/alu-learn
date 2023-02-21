/**
 * Helper function for formatting a user's name into what is displayed in an email.
 * Prepends a space to the name.
 * @example "John Doe" -> " John"
 * @example "John" -> " John"
 * @example "User" -> ""
 */

const formatName = (name: string | undefined | null) => {
  const firstName = name?.split(" ")[0];
  return firstName?.toLowerCase() !== "user" ? ` ${firstName}` : "";
};

export default formatName;
