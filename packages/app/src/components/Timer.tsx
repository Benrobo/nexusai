import { useEffect, useState } from "react";

export const Timer = ({ revert }: { revert: () => void }) => {
  const [time, setTime] = useState(20);
  useEffect(() => {
    if (time <= 0) {
      revert();
      return;
    }
    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);
  return (
    <span className="text-[10px] font-jb font-bold text-white-400 cursor-not-allowed">
      Resend in 00:{time < 10 ? `0${time}` : time}
    </span>
  );
};
