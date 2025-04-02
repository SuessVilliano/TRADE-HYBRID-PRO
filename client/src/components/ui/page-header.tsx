import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PageHeaderTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function PageHeaderTitle({ className, children }: PageHeaderTitleProps) {
  return (
    <h1 className={cn("text-2xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  );
}

interface PageHeaderDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function PageHeaderDescription({ className, children }: PageHeaderDescriptionProps) {
  return (
    <p className={cn("text-muted-foreground", className)}>
      {children}
    </p>
  );
}

interface PageHeaderActionsProps {
  className?: string;
  children: React.ReactNode;
}

export function PageHeaderActions({ className, children }: PageHeaderActionsProps) {
  return (
    <div className={cn("flex items-center gap-2 mt-2 sm:mt-0", className)}>
      {children}
    </div>
  );
}