interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Avatar({ name, size = "md" }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full bg-amber-600/20 border border-amber-600/30 flex items-center justify-center shrink-0`}
    >
      <span className="font-semibold text-amber-500">{getInitials(name)}</span>
    </div>
  );
}
