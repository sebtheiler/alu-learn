import Tooltip from "../Tooltip";
import classNames from "helpers-lib/src/classNames";
import { Tab as HeadlessTab } from "@headlessui/react";

interface Tab {
  label: string;
  value: string;
  description?: string;
}

interface TabsProps {
  /**
   * List of tabs to display
   */
  tabs: Tab[];
  /**
   * Called when a tab is selected
   */
  callback(selectedTab: string): void;
  className?: string;
}

/**
 * Tabs that you can select from
 */
export default function Tabs({ tabs, callback, className }: TabsProps) {
  return (
    <div className={classNames("w-full max-w-md px-2 sm:px-0", className)}>
      <HeadlessTab.Group>
        <HeadlessTab.List className="flex space-x-2 rounded-full border-alu-light-gray-darker border-2 bg-alu-light-gray p-1">
          {tabs.map((tab) => (
            <HeadlessTab
              key={tab.value}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-full py-2.5 text-sm font-medium leading-5 text-white focus:outline-none transition-all duration-300",
                  selected
                    ? "bg-alu-primary-purple shadow"
                    : "text-alu-primary-purple hover:bg-white/[0.12]"
                )
              }
              onClick={() => callback(tab.value)}
            >
              {tab.description ? (
                <Tooltip tooltip={tab.description} className="w-40">
                  {tab.label}
                </Tooltip>
              ) : (
                tab.label
              )}
            </HeadlessTab>
          ))}
        </HeadlessTab.List>
      </HeadlessTab.Group>
    </div>
  );
}
