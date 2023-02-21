import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  PreviewData,
} from "next";
import { getServerSession as nextAuth_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import type { ParsedUrlQuery } from "querystring";

const getServerSession = (
  context:
    | GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
    | { req: NextApiRequest; res: NextApiResponse<any> }
) => nextAuth_getServerSession(context.req, context.res, authOptions);

export default getServerSession;
