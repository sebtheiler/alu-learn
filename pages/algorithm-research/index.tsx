import AlgorithmResearchIndexPage from "@/pages/AlgorithmResearchPage/AlgorithmResearchIndexPage";
import type { NextPage } from "types";

const AlgorithmResearch: NextPage = () => <AlgorithmResearchIndexPage />;
AlgorithmResearch.authRequired = true;

export default AlgorithmResearch;
