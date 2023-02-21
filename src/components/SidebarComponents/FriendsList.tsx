import AsyncButton from "@/atoms/AsyncButton";
import Button from "@/atoms/Button";
import ComboBox from "@/atoms/ComboBox";
import Modal from "@/atoms/Modal";
import CopyLink from "@/components/CopyLink";
import DisplayUserInline from "@/components/DisplayUserInline";
import AddFriend from "@/graphql/AddFriend";
import MyFriends from "@/graphql/MyFriends";
import SearchUsers from "@/graphql/SearchUsers";
import formatPlural from "@/helpers/formatPlural";
import generateReferralLink from "@/helpers/generateReferralLink";
import { useDebounce } from "@/hooks/useDebounce";
import useMeStore from "@/stores/meStore";
import type {
  Mutation,
  MutationAddFriendArgs,
  Option,
  Query,
  QuerySearchUsersArgs,
} from "@/types";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function FriendsList() {
  const { data: friendsData } = useQuery<{
    myFriends: Query["myFriends"];
  }>(MyFriends);

  const username = useMeStore((state) => state.me?.username);

  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce<string>(query, 500);
  const [, { data: searchedUsers, refetch: searchCourses }] = useLazyQuery<
    {
      searchUsers: Query["searchUsers"];
    },
    QuerySearchUsersArgs
  >(SearchUsers, { variables: { name: debouncedQuery } });

  useEffect(() => {
    if (debouncedQuery.length >= 3 && debouncedQuery === query) searchCourses();
  }, [debouncedQuery, query, searchedUsers, searchCourses]);

  const selectedUser = useMemo(
    () =>
      searchedUsers?.searchUsers?.find((u) => u?.username === selectedUsername),
    [searchedUsers, selectedUsername]
  );

  const [addFriendMutation] = useMutation<
    { addFriend: Mutation["addFriend"] },
    MutationAddFriendArgs
  >(AddFriend);

  const addFriend = async () => {
    if (!selectedUser) return;
    await addFriendMutation({
      variables: { userId: selectedUser.id as string },
    });

    setRequestSent(true);
  };

  return (
    <div className="bg-gray-100 rounded-xl mt-4 max-w-xs mx-auto border-4 border-gray-200 overflow-hidden">
      <header className="w-full font-bold text-center px-3 py-2">
        Friends
      </header>
      <hr />
      {!friendsData ? (
        <p className="text-center py-2">Loading...</p>
      ) : (
        <section className="bg-gray-50 px-3 py-2 text-center">
          <div className="text-left px-3">
            {friendsData.myFriends?.length === 0 && (
              <p>You haven&apos;t added any friends yet</p>
            )}
            {friendsData.myFriends?.map((friend) => (
              <div
                className="py-2 border-b-2 border-gray-200 last:border-b-0 flex"
                key={friend.id}
              >
                <DisplayUserInline user={friend} />
                <span className="ml-auto">
                  {formatPlural(friend.reviewsStudied, "flashcard")}
                </span>
              </div>
            ))}
          </div>
          {(friendsData.myFriends?.length ?? 0) > 0 && (
            <p className="my-1">Flashcards studied this week</p>
          )}
          <Button
            className="mt-2"
            variant="primary-outline"
            onClick={() => setFriendModalOpen(true)}
            faIcon={faPlus}
            block
          >
            Add Friends
          </Button>
        </section>
      )}
      <Modal
        title="Add Friends"
        open={friendModalOpen}
        close={() => setFriendModalOpen(false)}
      >
        {requestSent ? (
          <>
            You&apos;ve sent a friend request to {selectedUser?.name}. If they
            accept, you will see them on your friends list.
            <Button
              onClick={() => {
                setQuery("");
                setSelectedUsername(null);
                setRequestSent(false);
              }}
              className="my-2"
              block
            >
              Add Another Friend
            </Button>
            <Button
              onClick={() => setFriendModalOpen(false)}
              variant="secondary"
              block
            >
              Close
            </Button>
          </>
        ) : (
          <>
            <ComboBox
              options={
                (searchedUsers?.searchUsers?.map((user) => ({
                  value: user?.username,
                  label: `${user?.name} (${user?.username})`,
                })) ?? []) as Option[]
              }
              onQueryChange={(e) => setQuery(e.target.value)}
              onChange={(userId) => setSelectedUsername(userId as string)}
              placeholder="Search user by name, username, or email"
              loading={debouncedQuery !== query}
              className="mb-3"
            />
            {selectedUser && (
              <AsyncButton onClick={addFriend} block>
                Add {selectedUser.name} as a Friend
              </AsyncButton>
            )}
            <hr className="my-5" />
            <p>
              Can&apos;t find your friends on Alu? Invite a new user with the
              link below and{" "}
              <strong>
                you&apos;ll both earn a free week of{" "}
                <Link href="/pro">
                  <a className="text-blue-500">Alu Pro</a>
                </Link>
                .<sup>*</sup>
              </strong>
            </p>
            <CopyLink
              link={generateReferralLink(username as string)}
              className="my-2"
            />
            <p>
              <small>
                <sup>*</sup>You will earn one free week of Alu Pro for each new
                user that signs up using your referral link. You may earn a
                maximum of four weeks per month. Only applies if you do not have
                an existing pro-mode subscription. Subject to Alu&apos;s{" "}
                <Link href="/legal/tos">
                  <a className="text-blue-500">terms of service</a>
                </Link>
                .
              </small>
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
