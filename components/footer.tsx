import React from "react";
import Wrapper from "./wrapper";
import { Separator } from "./ui/separator";

const Footer = () => {
  return (
    <Wrapper>
      <div className="mt-40">
        <Separator />
        <div className="my-5 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} | All rights reserved
        </div>
      </div>
    </Wrapper>
  );
};

export default Footer;
