import ToolsPage from "@/pages/ToolsPage";
import type { GetServerSideProps } from "next";
import type { NextPage } from "types";

const Tools: NextPage = (props) => <ToolsPage {...props} />;
Tools.authRequired = true;

export default Tools;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
