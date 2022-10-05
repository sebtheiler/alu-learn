import ComboBox from "@/atoms/ComboBox";
import SearchUsers from "@/graphql/SearchUsers";
import { useDebounce } from "@/hooks/useDebounce";
import type { Option, Query, QuerySearchUsersArgs, User } from "@/types";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";

interface SearchUserProps {
  /**
   * Called when a user is selected
   * @param user User that got searched and selected
   */
  onUserSelect(user: User): void;
  /**
   * Placeholder text
   */
  placeholder?: string;
}

/**
 * Interface for searching and selecting a user with a combobox
 */
export default function SearchUser({
  onUserSelect,
  placeholder,
}: SearchUserProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);
  const [, { data: searchedUsers, refetch: searchUsers }] = useLazyQuery<
    {
      searchUsers: Query["searchUsers"];
    },
    QuerySearchUsersArgs
  >(SearchUsers, { variables: { name: query } });

  useEffect(() => {
    if (debouncedQuery.length >= 3 && debouncedQuery === query)
      searchUsers({ name: query });
  }, [debouncedQuery, query, searchUsers]);

  return (
    <ComboBox
      options={
        (searchedUsers?.searchUsers?.map((user) => ({
          value: user?.username,
          label: user?.name,
        })) ?? []) as Option[]
      }
      onQueryChange={(e) => setQuery(e.target.value)}
      onChange={(username) =>
        onUserSelect(
          searchedUsers?.searchUsers?.filter(
            (u) => u?.username === username
          )[0] as User
        )
      }
      placeholder={placeholder}
      className="mt-2"
      clearOnChange
    />
  );
}
