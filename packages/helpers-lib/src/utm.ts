interface UTMParams {
  /**
   * Social network, search engine, newsletter name, or other source driving the traffic
   * E.g., facebook, twitter, blog, newsletter
   */
  source: string;
  /**
   * The type of channel driving the traffic
   * E.g., cpc, organic_social, paid_social
   */
  medium: string;
  /**
   * Name of the marketing campaign that this is a part of
   * E.g., summer_sale, free_trial
   */
  campaign?: string;
  /**
   * Used to track paid keywords or key phrases
   * E.g., social_media, newyork_cupcakes
   */
  term?: string;
  /**
   * Used to track different ads within a campaign
   * E.g., video_ad, text_ad, blue_banner, green_banner
   */
  content?: string;
}

/**
 * Add UTM attributes to a link
 * @param url URL to add UTM attributes to
 * @returns The URL with UTM attributes
 */
const utm = (
  url: string,
  { source, medium, campaign, term, content }: UTMParams
) => {
  let urlCopy = url + "?";
  if (campaign) urlCopy += `utm_campaign=${campaign}&`;
  if (source) urlCopy += `utm_source=${source}&`;
  if (medium) urlCopy += `utm_medium=${medium}&`;
  if (term) urlCopy += `utm_term=${term}&`;
  if (content) urlCopy += `utm_content=${content}&`;

  // Remove the trailing ampersand
  return urlCopy.slice(0, urlCopy.length - 1);
};

export default utm;
