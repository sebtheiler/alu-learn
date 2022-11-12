const generateReferralLink = (username: string) =>
  `?referredBy=${username}?utm_source=referral&utm_medium=referral&utm_campaign=referral`;
export default generateReferralLink;
