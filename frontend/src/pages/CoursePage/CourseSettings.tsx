import AsyncButton from "@/atoms/AsyncButton";
import AsyncForm from "@/atoms/AsyncForm";
import Button from "@/atoms/Button";
import ButtonGroup from "@/atoms/ButtonGroup";
import FileUpload from "@/atoms/FileUpload";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import IconTooltip from "@/components/IconTooltip";
import DeleteCourse from "@/graphql/DeleteCourse";
import UpdateCourse from "@/graphql/UpdateCourse";
import UploadCourseBannerImage from "@/graphql/UploadCourseBannerImage";
import { getElementsVals } from "@/helpers/getElementsVals";
import type { Course } from "@/types";
import { useMutation } from "@apollo/client";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface CourseSettingsProps {
  course: Course;
  refreshData(): void;
}

export default function CourseSettings({
  course,
  refreshData,
}: CourseSettingsProps) {
  const [updateCourse] = useMutation(UpdateCourse);
  const [uploadCourseBannerImage] = useMutation(UploadCourseBannerImage);
  const [deleteCourse] = useMutation(DeleteCourse);
  const [courseSettingsModalOpen, setCourseSettingsModalOpen] = useState(false);
  const router = useRouter();

  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    const { courseTitle } = getElementsVals(e.target as HTMLFormElement, [
      "courseTitle",
    ]);

    if (bannerImage) {
      await uploadCourseBannerImage({
        variables: { bannerImage, courseId: course.id },
      });
    }

    await updateCourse({
      variables: {
        title: courseTitle,
        courseId: course.id,
      },
    });

    refreshData();
    setCourseSettingsModalOpen(false);
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to remove this course?")) return;
    await deleteCourse({
      variables: {
        courseId: course.id,
      },
    });
    router.push("/home");
  };

  const [bannerImage, setBannerImage] = useState<File>();
  function onChange({
    target: {
      validity,
      files: [file],
    },
  }) {
    if (validity.valid) setBannerImage(file);
  }

  return (
    <div>
      <div className="float-right pt-2 pr-2 z-50" style={{ zIndex: "5000" }}>
        <IconTooltip
          faIcon={faGear}
          onClick={() => setCourseSettingsModalOpen(true)}
          size="2x"
          tooltip="Course Settings"
          tooltipProps={{ className: "w-32" }}
          className="text-white"
        />
      </div>
      <Modal
        open={courseSettingsModalOpen}
        close={() => setCourseSettingsModalOpen(false)}
      >
        <h2 className="text-2xl font-bold text-center mb-3">Course Settings</h2>
        <AsyncForm
          onSubmit={handleUpdateCourse}
          buttonProps={{ children: "Save", className: "float-right" }}
        >
          <TextInput
            label="Course Title"
            name="courseTitle"
            defaultValue={course.title as string}
            required
          />
          <FileUpload
            label="Upload course banner image (optional)"
            accept=".png, .jpg, .jpeg, .webm"
            className="w-full mt-3"
            name="bannerImage"
            onChange={onChange}
          />
          <hr className="my-3" />
          <ButtonGroup className="inline" spaced>
            <AsyncButton
              variant="red"
              className="w-28"
              onClick={handleDeleteCourse}
            >
              Remove
            </AsyncButton>
            <Button
              variant="secondary"
              className="w-28"
              onClick={() => setCourseSettingsModalOpen(false)}
            >
              Close
            </Button>
          </ButtonGroup>
        </AsyncForm>
      </Modal>
    </div>
  );
}
