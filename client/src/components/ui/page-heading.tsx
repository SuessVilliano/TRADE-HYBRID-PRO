import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface PageHeadingProps {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function PageHeading({ 
  title, 
  description, 
  className, 
  actions,
  ...props 
}: PageHeadingProps & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-6 space-y-2", className)} {...props}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}