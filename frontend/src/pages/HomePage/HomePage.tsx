import CreateAddCourseModal from "./CreateAddCourseModal";
import SocialMediaLinks from "./SocialMediaLinks";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CardsDoneSVG from "components/CardsDoneSVG";
import SEO from "helpers/SEO";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const courses = [
  {
    title: "AP World History: Modern",
    imageBanner:
      "https://d1whtlypfis84e.cloudfront.net/guides/wp-content/uploads/2018/03/16025228/bell.jpg",
    teacher: {
      name: "Dr. Test User",
    },
    id: 1,
  },
  {
    title: "AP Psychology",
    imageBanner: "https://www.mooc.org/hubfs/psych-fields-jpg.jpeg",
    id: 2,
  },
  {
    title: "AP U.S. Government and Politics",
    imageBanner:
      "https://d2v9ipibika81v.cloudfront.net/uploads/sites/22/2016/01/Capitol_west_front750.jpg",
    id: 3,
  },
  {
    title: "AP Biology",
    imageBanner:
      "https://thumbs.dreamstime.com/z/biology-hand-drawn-doodles-lettering-education-science-vector-white-background-135246167.jpg",
    id: 4,
  },
  {
    title: "AP Statistics",
    imageBanner:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3DOqLYnHco4T4AmP8lNma8przbed2TPOjGw-Y3bDdwSFUiIkWhiA1Zlighw&s",
    id: 5,
  },
];

export default function HomePage() {
  const [addCourseModalOpen, setAddCourseModalOpen] = useState(false);

  return (
    <>
      <SEO
        title="Home"
        path="/home"
        // description=""  TODO: (SEO) set description
      />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold mb-3">Welcome!</h1>
        <div className="grid md:grid-cols-12 sm:grid-cols-6 h-40">
          <div className="md:col-start-4 col-span-6 mx-10 md:mx-5">
            <div className="flex flex-wrap">
              {courses.map((course) => (
                <div
                  className="w-full lg:w-1/3 md:w-1/2 px-2 mb-4 mx-auto"
                  key={course.id}
                >
                  <Link href={`/course/${course.id}/`}>
                    <a>
                      <div
                        className="border-gray-200 border-4 bg-gray-50 rounded-xl h-60 min-h-full
                                      overflow-hidden hover:shadow-lg hover:scale-105 transition"
                      >
                        <div className="w-full h-24 relative">
                          <Image
                            src={course.imageBanner}
                            alt=""
                            layout="fill"
                            className="object-cover"
                          />
                        </div>
                        <div className="w-full text-center p-3">
                          <h3 className="text-xl font-bold mt-4">
                            {course.title}
                          </h3>
                          <p>{course.teacher?.name}</p>
                        </div>
                      </div>
                    </a>
                  </Link>
                </div>
              ))}
              <div className="w-full lg:w-1/3 md:w-1/2 px-2 mb-4 mx-auto">
                <div
                  className="border-gray-200 border-4 bg-gray-50 rounded-xl h-60 min-h-full
                             overflow-hidden hover:shadow-lg hover:cursor-pointer text-center
                             p-5 hover:scale-105 transition"
                  onClick={() => setAddCourseModalOpen(true)}
                >
                  <h3 className="text-xl font-bold">Create or Add Course</h3>
                  <FontAwesomeIcon icon={faPlus} size="8x" />
                </div>
              </div>
              <CreateAddCourseModal
                open={addCourseModalOpen}
                close={() => setAddCourseModalOpen(false)}
              />
            </div>
          </div>
          <div className="col-span-6 md:col-span-3 mx-4">
            <CardsDoneSVG cardsDone={30} targetCardsDone={50} />
            <SocialMediaLinks />
          </div>
        </div>
      </div>
    </>
  );
}
