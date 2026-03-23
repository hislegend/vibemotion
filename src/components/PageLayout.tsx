"use client";

import Link from "next/link";
import { Header } from "./Header";

interface PageLayoutProps {
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  showLogoAsLink?: boolean;
}

export function PageLayout({
  children,
  rightContent,
  showLogoAsLink = false,
}: PageLayoutProps) {
  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <header className="flex justify-between items-start py-8 px-12 shrink-0">
        <div className="flex items-center gap-6">
          <Header asLink={showLogoAsLink} />
          <Link
            href="/smart"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            🧠 스마트 생성
          </Link>
        </div>
        {rightContent}
      </header>
      {children}
    </div>
  );
}
