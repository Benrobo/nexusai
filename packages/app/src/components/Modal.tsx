"use client";
import React, { useRef, useState } from "react";
import { X } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ModalProp {
  isOpen?: boolean;
  onClose?: () => void;
  showCloseIcon?: boolean;
  children?: React.ReactNode;
  isBlurBg?: boolean;
  fixed?: boolean;
  scrollable?: boolean;
  className?: React.ComponentProps<"div">["className"];
  includeBg?: boolean;
}

const Modal = ({
  children,
  isOpen,
  showCloseIcon,
  onClose,
  fixed,
  scrollable,
  isBlurBg,
  className,
  includeBg,
}: ModalProp) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const childModalRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.removeEventListener("mousedown", () => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  React.useEffect(() => {
    if (!isVisible) return;

    const handler = (e: MouseEvent) => {
      const tgt = e.target as any;
      if (!childModalRef?.current?.contains(tgt)) {
        onClose && onClose();
      }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });

  // if (!isVisible) {
  //   return null;
  // }

  return (
    <div
      className={cn(
        "w-full hideScrollBar h-[100vh] top-0 left-0 py-5 ",
        includeBg ? "bg-dark-100/40" : "",
        fixed ? "fixed z-[1000]" : "absolute",
        isBlurBg ? "backdrop-blur-sm bg-opacity-85" : "",
        scrollable ? "overflow-y-auto hideScollBar" : "overflow-hidden",
        "transition-all",
        isVisible ? "scale-[1]" : "scale-[0]",
        className
      )}
      data-name="main-modal"
    >
      <div className={`${isVisible ? "opacity-100" : "opacity-0"}`}>
        {showCloseIcon && (
          <button
            onClick={onClose}
            className="absolute top-5 right-2 p-1 bg-dark-100/20 rounded-[50%] z-[70]"
          >
            <X size={25} className="cursor-pointer p-1 text-red-305 " />
          </button>
        )}
        <div
          ref={childModalRef}
          className="w-auto h-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999]"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
