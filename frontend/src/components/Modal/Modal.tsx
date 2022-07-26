import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import type { ButtonProps } from "components/Button";

interface ModalProps {
  /**
   * Is the modal open?
   */
  open: boolean;
  /**
   * Function to close to modal (`() => setOpen(false)`)
   */
  close(): void;
  /**
   * Title to display at the top of the modal
   */
  title?: string;
  /**
   * Content of the modal
   */
  children: React.ReactNode;
  /**
   * Buttons to display at the bottom of the modal
   */
  buttons?:
    | React.ReactElement<ButtonProps>
    | Array<React.ReactElement<ButtonProps>>;
  /**
   * Maximum width of the modal
   */
  maxWidth?: string;
}

export default function Modal({
  open,
  close,
  title,
  children,
  buttons,
}: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel
                className={`relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 max-w-xl w-full`}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-xl text-center leading-6 font-medium text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    <div className="mt-2">{children}</div>
                  </div>
                </div>
                {buttons && (
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    {buttons}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
