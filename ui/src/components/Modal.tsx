import { Fragment, PropsWithChildren } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import classNames from "classnames";

export default function Modal({
  children,
  show = false,
  closeable = true,
  onClose = () => {},
  className = "",
  position = "center",
  noBackground = false,
}: PropsWithChildren<{
  show: boolean;
  closeable?: boolean;
  onClose: CallableFunction;
  className?: string;
  position?:
    | "left"
    | "right"
    | "bottom"
    | "top"
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  noBackground?: boolean;
}>) {
  const close = () => {
    if (closeable) {
      onClose();
    }
  };

  const positionClasses = () => {
    switch (position) {
      case "left":
        return "justify-start items-center";
      case "right":
        return "justify-end items-center";
      case "bottom":
        return "justify-center items-end";
      case "top":
        return "justify-center items-start";
      case "top-left":
        return "justify-start items-start";
      case "top-right":
        return "justify-end items-start";
      case "bottom-left":
        return "justify-start items-end";
      case "bottom-right":
        return "justify-end items-end";
      case "center":
      default:
        return "justify-center items-center";
    }
  };

  return (
    <Transition show={show} as={Fragment} leave="duration-200">
      <Dialog
        as="div"
        id="modal"
        className={classNames(
          "z-[999] fixed inset-0 flex overflow-y-auto px-4 py-6 transform",
          positionClasses()
        )}
        onClose={close}
      >
        {!noBackground && (
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-242732/75" />
          </TransitionChild>
        )}

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            className={classNames(
              "bg-1E212C",
              "rounded-lg",
              "overflow-hidden",
              "shadow-xl",
              "transform",
              "w-full",
              className
            )}
          >
            {children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
