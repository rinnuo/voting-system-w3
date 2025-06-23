import React from "react";

interface PageContainerProps {
  title?: string;
  left: React.ReactNode;
  right?: React.ReactNode;
}

const PageContainer = ({ title, left, right }: PageContainerProps) => (
  <div className="mx-auto mt-10 bg-gray-900 rounded-xl shadow border border-gray-700 overflow-hidden w-fit max-w-full">
    {title && (
      <h1 className="text-2xl font-bold mb-4 text-gray-100 px-6 pt-6">{title}</h1>
    )}
    <div className={right ? "inline-flex flex-row items-stretch" : "flex flex-col"}>
      <div>{left}</div>
      {right && <div>{right}</div>}
    </div>
  </div>
);

export default PageContainer;