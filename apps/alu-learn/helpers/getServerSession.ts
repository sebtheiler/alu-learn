import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  PreviewData,
} from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import type { ParsedUrlQuery } from "querystring";

const getServerSession = (
  context:
    | GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
    | { req: NextApiRequest; res: NextApiResponse<any> }
) => unstable_getServerSession(context.req, context.res, authOptions);

export default getServerSession;
