import type { ButtonProps } from "@/atoms/Button";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

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
      <Dialog
        as="div"
        className="relative"
        onClose={close}
        style={{ zIndex: "1000" }}
      >
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                className={`relative my-8 w-full max-w-xl transform rounded-lg bg-white text-left shadow-xl transition-all`}
              >
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-center text-xl leading-6 text-gray-900 font-bold"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    <FontAwesomeIcon
                      icon={faClose}
                      className="absolute right-3 top-3 py-2 rounded-full bg-gray-50 hover:bg-gray-100 hover:cursor-pointer"
                      role="button"
                      onClick={close}
                      width={32}
                      height={32}
                    />
                    <div className="mt-2">{children}</div>
                  </div>
                </div>
                {buttons && (
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
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
