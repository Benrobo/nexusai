import { useEffect, useState } from "react";
import { FlexColCenter } from "./Flex";
import { Airplay } from "./icons";

export default function UnsupportedViewport() {
  const [width, setWidth] = useState(0);

  const checkScreenRatio = () => {
    const { innerWidth } = window;
    setWidth(innerWidth);
  };

  useEffect(() => {
    checkScreenRatio();
    window.addEventListener("resize", () => checkScreenRatio);
    return () => window.removeEventListener("resize", checkScreenRatio);
  }, [width]);

  if (width > 900) return null;

  return (
    <FlexColCenter className="w-screen h-screen bg-brown-100 fixed top-0 z-[999999] text-center px-10 md:px-10">
      <Airplay size={60} className="stroke-white-100" />
      <h1 className="text-white-100 text-lg font-ppB">
        Unsupported Screen Size
      </h1>
      <p className="text-white-200 text-sm font-pp">
        We're sorry, but this screen size is not supported yet, please switch to
        a desktop view.
      </p>
    </FlexColCenter>
  );
}
