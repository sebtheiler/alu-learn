import CreateAddCourseModal from "./CreateAddCourseModal";
import SocialMediaLinks from "./SocialMediaLinks";
import ReviewsDoneSVG from "@/components/ReviewsDoneSVG";
import SEO from "@/helpers/SEO";
import type { Course } from "@/types";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface HomePageProps {
  /**
   * The courses the user is currently in.
   * Displays as a list on the homepage
   */
  courses: Course[];
  reviewsDone: number;
  targetReviewsDone: number;
}

export default function HomePage({
  courses,
  reviewsDone,
  targetReviewsDone,
}: HomePageProps) {
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
                        className="border-gray-200 border-4 bg-gray-50 rounded-xl h-60 min-h-full relative
                                     overflow-hidden hover:shadow-lg hover:scale-105 transition flex flex-wrap"
                      >
                        {course.bannerImage && (
                          <div className="w-full h-24 relative">
                            <Image
                              src={course.bannerImage}
                              alt="Course banner"
                              layout="fill"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="absolute w-full text-center p-3 h-full flex flex-wrap items-center justify-center">
                          <div>
                            <h3 className="text-xl font-bold mt-4 w-full">
                              {course.title}
                            </h3>
                            <p>Sebastian Theiler</p>
                          </div>
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
            <ReviewsDoneSVG
              reviewsDone={reviewsDone}
              targetReviewsDone={targetReviewsDone}
            />
            <SocialMediaLinks />
          </div>
        </div>
      </div>
    </>
  );
}
