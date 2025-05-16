import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import Image from "next/image";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <div className=" min-h-screen [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#ffd452_100%)]">{children}</div>;
};

export default layout;
