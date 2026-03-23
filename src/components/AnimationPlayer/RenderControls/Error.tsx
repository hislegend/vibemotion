import { ErrorDisplay } from "@/components/ErrorDisplay";
import React from "react";

export const ErrorComp: React.FC<{
  message: string;
}> = ({ message }) => {
  return (
    <ErrorDisplay error={message} title="렌더링 오류" variant="card" size="md" />
  );
};
