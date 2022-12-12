import SEO from "@/helpers/SEO";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export interface RetentionData {
  day: number; // 0-30
  num: number; // % retention
}

export interface AdminRetentionPageProps {
  retentionData: RetentionData[];
}

export default function AdminRetentionPage({
  retentionData,
}: AdminRetentionPageProps) {
  return (
    <>
      <SEO title="Admin Retention" path="/admin" noindex />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold">Retention Data</h1>
        <p className="text-center">
          This is expensive to calculate, so it&apos;s on a different page
        </p>
        <div className="max-w-xl mx-auto">
          <LineChart
            width={500}
            height={300}
            data={retentionData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="num" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>
    </>
  );
}
