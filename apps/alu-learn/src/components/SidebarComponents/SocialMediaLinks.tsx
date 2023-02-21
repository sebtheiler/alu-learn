import Image from "next/image";

export default function SocialMediaLinks() {
  return (
    <div className="text-center mt-4">
      <p className="font-bold">Follow Alu</p>
      <div
        className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 rounded-full md:rounded-xl
                  lg:rounded-full border-4 border-gray-200 bg-gray-50 p-3 max-w-xs mx-auto"
      >
        <a
          href="https://www.instagram.com/alu_learn"
          target="_blank"
          rel="noreferrer"
          style={{ height: "40px" }}
          className="hover:scale-105 transition mb-0 md:mb-4 lg:mb-0"
        >
          <Image
            src="/assets/logos/instagram.svg"
            alt="Instagram logo"
            className="mx-auto"
            width={40}
            height={40}
          />
        </a>
        <a
          href="https://www.twitter.com/AluLearn"
          target="_blank"
          rel="noreferrer"
          style={{ height: "40px" }}
          className="hover:scale-105 transition"
        >
          <Image
            src="/assets/logos/twitter.svg"
            alt="Twitter logo"
            className="mx-auto"
            width={40}
            height={40}
          />
        </a>
        <a
          href="https://www.tiktok.com/@alulearn"
          target="_blank"
          rel="noreferrer"
          style={{ height: "40px" }}
          className="hover:scale-105 transition"
        >
          <Image
            src="/assets/logos/tiktok.svg"
            alt="TikTok logo"
            className="mx-auto"
            width={40}
            height={40}
          />
        </a>
        <a
          href="https://www.reddit.com/r/AluLearn"
          target="_blank"
          rel="noreferrer"
          style={{ height: "40px" }}
          className="hover:scale-105 transition"
        >
          <Image
            src="/assets/logos/reddit.svg"
            alt="Reddit logo"
            className="mx-auto"
            width={40}
            height={40}
          />
        </a>
      </div>
    </div>
  );
}
