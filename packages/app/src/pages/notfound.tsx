import { FlexColCenter } from "@/components/Flex";
import TopBar from "@/components/landing/navigations/TopBar";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <>
      <TopBar />
      <FlexColCenter className="h-screen w-screen">
        <h1 className="text-4xl font-ppB text-dark-100">404</h1>
        <p className="text-md font-ppR text-white-400">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="w-auto text-xs px-5 mt-3 border-[1px] border-white-300/30 bg-brown-103 font-ppReg py-3 rounded-2xl text-white-100 enableBounceEffect"
        >
          Go Home
        </Link>
      </FlexColCenter>
    </>
  );
}
