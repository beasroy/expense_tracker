import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900",
        className,
      )}
      {...props}
    />
  );
}

