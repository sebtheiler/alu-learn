import Checkbox from "@/atoms/Checkbox";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import UpdateUser from "@/graphql/UpdateUser";
import SEO from "@/helpers/SEO";
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation } from "@apollo/client";
import type { UserType } from "@prisma/client";
import { useEffect } from "react";
import { useState } from "react";

const userTypeOptions = [
  {
    value: "STUDENT",
    label: "Student",
  },
  {
    value: "TEACHER",
    label: "Teacher",
  },
  {
    value: "MIXED",
    label: "Mixed",
  },
];

const timezoneOptions = [
  { label: "GMT-12 International Date Line West (IDLW)", value: 720 },
  { label: "GMT-11 Nome Time (NT)", value: 660 },
  { label: "GMT-10 Hawaii Standard Time (HST)", value: 600 },
  { label: "GMT-9 Alaska Standard Time (AKST)", value: 540 },
  { label: "GMT-8 Pacific Standard Time (PST)", value: 480 },
  { label: "GMT-7 Mountain Standard Time (MST)", value: 420 },
  { label: "GMT-6 Central Standard Time (CST)", value: 360 },
  { label: "GMT-5 Eastern Standard Time (EST)", value: 300 },
  { label: "GMT-4 Atlantic Standard Time (AST)", value: 240 },
  { label: "GMT-3 Argentina Time (ART)", value: 180 },
  { label: "GMT-2 Azores Time (AT)", value: 120 },
  { label: "GMT-1 West Africa Time (WAT)", value: 60 },
  { label: "GMT+0 Greenwich Mean Time (GMT)", value: 0 },
  { label: "GMT+1 Central European Time (CET)", value: -60 },
  { label: "GMT+2 Eastern European Time (EET)", value: -120 },
  { label: "GMT+3 Moscow Time (MSK)", value: -180 },
  { label: "GMT+4 Armenia Time (AMT)", value: -240 },
  { label: "GMT+5 Pakistan Standard Time (PKT)", value: -300 },
  { label: "GMT+6 Omsk Time (OMSK)", value: -360 },
  { label: "GMT+7 Kranoyask Time (KRAT)", value: -420 },
  { label: "GMT+8 China Standard Time (CST)", value: -480 },
  { label: "GMT+9 Japan Standard Time (JST)", value: -540 },
  { label: "GMT+10 Eastern Australia Standard Time (AEST)", value: -600 },
  { label: "GMT+11 Sakhalin Time (SAKT)", value: -660 },
  { label: "GMT+12 New Zealand Standard Time (NZST)", value: -720 },
];

export interface SettingsPageProps {
  name?: string;
  timezoneOffset?: number;
  userType?: UserType;
  sendReminders?: boolean;
  targetNumReviews?: number;
  sendMarketingResearch?: boolean;
}

export default function SettingsPage({
  name,
  timezoneOffset,
  userType,
  sendReminders,
  targetNumReviews,
  sendMarketingResearch,
}: SettingsPageProps) {
  const [updateUser] = useMutation(UpdateUser);

  const [nameState, setNameState] = useState(name);
  const debouncedName = useDebounce(nameState, 500);
  useEffect(() => {
    if (debouncedName !== name)
      updateUser({ variables: { name: debouncedName } });
  }, [debouncedName, name, updateUser]);

  const [targetNumReviewsState, settargetNumReviewsState] =
    useState(targetNumReviews);
  const debouncedtargetNumReviews = useDebounce(targetNumReviewsState, 500);
  useEffect(() => {
    if (
      debouncedtargetNumReviews &&
      debouncedtargetNumReviews !== targetNumReviews
    )
      updateUser({
        variables: { targetNumReviews: debouncedtargetNumReviews },
      });
  }, [debouncedtargetNumReviews, targetNumReviews, updateUser]);

  return (
    <>
      <SEO
        title="Settings"
        path="/settings"
        description="Update your user preferences and settings for Alu Learn"
      />
      <div className="mt-28 container mx-auto max-w-xl px-5">
        <h1 className="text-center text-4xl font-bold">Settings</h1>
        <p className="text-center">
          All of your preferences are saved automatically
        </p>
        <div>
          <h3 className="text-xl font-bold mb-2">General</h3>
          <TextInput
            label="Name"
            className="mb-4"
            value={nameState}
            onChange={(e) => setNameState(e.target.value)}
            required
          />
          <TextInput
            label="Target Flashcards per Day"
            type="number"
            className="mb-4"
            value={targetNumReviewsState}
            onChange={(e) => settargetNumReviewsState(parseInt(e.target.value))}
            required
          />
          <div className="mb-4">
            <Select
              label="User Type"
              options={userTypeOptions}
              defaultValue={userType}
              onChange={(val) => updateUser({ variables: { userType: val } })}
              id="userType"
            />
          </div>
          <div>
            <Select
              label="Timezone"
              options={timezoneOptions}
              defaultValue={timezoneOffset}
              onChange={(val) =>
                updateUser({ variables: { timezoneOffset: val } })
              }
              id="timezoneOffset"
            />
          </div>
        </div>
        <br />
        <div>
          <h3 className="text-xl font-bold">Emails</h3>
          <Checkbox
            label="Send reminder emails"
            description="Alu will send you a reminder email if you have an active streak and haven't studied that day"
            onChange={(e) =>
              updateUser({ variables: { sendReminders: e.target.checked } })
            }
            defaultChecked={sendReminders}
            id="sendReminders"
          />
          <br />
          <Checkbox
            label="Send marketing research emails"
            description="Alu will occasionally send you emails for marketing research. We will never spam you."
            onChange={(e) =>
              updateUser({
                variables: { sendMarketingResearch: e.target.checked },
              })
            }
            defaultChecked={sendMarketingResearch}
            id="sendMarketingResearch"
          />
        </div>
      </div>
    </>
  );
}
