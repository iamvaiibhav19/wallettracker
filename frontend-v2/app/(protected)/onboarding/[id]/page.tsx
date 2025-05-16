import React from "react";

interface PageProps {
  id: string;
}

const Page: React.FC<PageProps> = ({ id }) => {
  console.log(id);

  return <div>{id}</div>;
};

export default Page;
