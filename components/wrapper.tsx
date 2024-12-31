import { cn } from "@/lib/utils";
import React from "react";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn("relative mx-auto w-full max-w-screen-2xl px-2.5 md:px-20")}
    >
      {children}
    </div>
  );
};

export default Wrapper;
