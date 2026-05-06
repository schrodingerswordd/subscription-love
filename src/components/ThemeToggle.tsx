import { Sun, Moon, Zap } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "neon", label: "Neon", icon: Zap },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Current = OPTIONS.find((o) => o.value === theme)?.icon ?? Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground" aria-label="Theme">
          <Current className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => setTheme(o.value)}
            className={theme === o.value ? "font-semibold text-primary" : ""}
          >
            <o.icon className="mr-2 h-4 w-4" /> {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
