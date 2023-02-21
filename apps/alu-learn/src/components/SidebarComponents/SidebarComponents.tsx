import FriendsList from "./FriendsList";
import SocialMediaLinks from "./SocialMediaLinks";
import Ad from "@/components/Ad";
import ReviewsDoneSVG from "@/components/ReviewsDoneSVG";
import useMeStore from "@/stores/meStore";

export default function SidebarComponents() {
  const me = useMeStore((state) => state.me);

  return (
    <>
      <ReviewsDoneSVG
        reviewsDone={me?.numReviewsDoneToday ?? 0}
        targetReviewsDone={me?.targetNumReviews ?? 0}
      />
      <SocialMediaLinks />
      <Ad adType="META_SIDEBAR" className="max-w-xs mx-auto" />
      <FriendsList />
    </>
  );
}
