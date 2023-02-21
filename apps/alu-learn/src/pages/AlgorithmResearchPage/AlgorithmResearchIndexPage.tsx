import Link from "next/link";

export default function AlgorithmResearchIndexPage() {
  return (
    <div className="max-w-lg mx-auto mt-24">
      <h1 className="text-center text-4xl font-bold">
        Alu Learn Spanish Vocabulary AP Research Study
      </h1>
      <p className="my-3">Please select your Spanish Level Below.</p>
      <ul className="list-disc text-blue-500 underline">
        <li>
          <Link href="/algorithm-research/ap-spanish">AP Spanish</Link>
        </li>
        <li>
          <Link href="/algorithm-research/spanish-iii">Spanish III</Link>
        </li>
      </ul>
    </div>
  );
}
