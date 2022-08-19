import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "atoms/Modal";
import TextInput from "atoms/TextInput";
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
              <Modal
                open={addCourseModalOpen}
                close={() => setAddCourseModalOpen(false)}
              >
                <h1 className="text-center text-4xl font-bold">
                  Create or Add Course
                </h1>
                <h3 className="text-xl font-bold">Add Existing Course</h3>
                <TextInput label="Search Course" />
                <hr />
                <h3 className="text-xl font-bold">Create New Course</h3>
                <TextInput label="Course Name" />
              </Modal>
            </div>
          </div>
          <div className="col-span-6 md:col-span-3 mx-4">
            <CardsDoneSVG cardsDone={30} targetCardsDone={50} />
            <div className="text-center mt-4">
              <p className="font-bold">Follow Alu</p>
              <div
                className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 rounded-full md:rounded-xl
                          lg:rounded-full border-4 border-gray-200 bg-gray-100 p-3 max-w-xs mx-auto"
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
                    alt="Instagram logo"
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
                    alt="Instagram logo"
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
                    alt="Instagram logo"
                    width={40}
                    height={40}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
