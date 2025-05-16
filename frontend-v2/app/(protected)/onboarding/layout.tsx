import { Card } from "@/components/ui/card";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#ffd452_100%)]">
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className=" m-auto mx-2 bg-background shadow-md relative bottom-6">
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">{children}</div>{" "}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default layout;
