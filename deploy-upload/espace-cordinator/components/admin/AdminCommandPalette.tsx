"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";

type CommandEntry = {
  label: string;
  path: string;
  group: "Navigation" | "Operations";
};

type CopilotResult = {
  answer: string;
  navigationPath?: string;
  suggestions?: string[];
};

const COMMANDS: CommandEntry[] = [
  { label: "Open Overview", path: "/dashboard/admin", group: "Navigation" },
  { label: "Open Users", path: "/dashboard/admin/users", group: "Navigation" },
  { label: "Open Services", path: "/dashboard/admin/services", group: "Navigation" },
  { label: "Open Alerts", path: "/dashboard/admin/alerts", group: "Navigation" },
  { label: "Open Audit Logs", path: "/dashboard/admin/audit", group: "Navigation" },
  { label: "Open Analytics", path: "/dashboard/admin/analytics", group: "Navigation" },
  { label: "Open Export", path: "/dashboard/admin/export", group: "Operations" },
  { label: "Open Profile", path: "/dashboard/admin/profile", group: "Operations" },
  { label: "Open Settings", path: "/dashboard/admin/settings", group: "Operations" },
];

export default function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [copilotResult, setCopilotResult] = useState<CopilotResult | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isInputLike = tag === "input" || tag === "textarea" || target?.isContentEditable;
      if (isInputLike) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const grouped = useMemo(() => {
    return {
      Navigation: COMMANDS.filter((item) => item.group === "Navigation"),
      Operations: COMMANDS.filter((item) => item.group === "Operations"),
    };
  }, []);

  const onSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const askCopilot = async () => {
    if (!query.trim()) return;

    try {
      setCopilotLoading(true);
      setCopilotError(null);
      setCopilotResult(null);

      const response = await fetch("/api/admin/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      if (result.success && result.result) {
        setCopilotResult(result.result as CopilotResult);
      } else {
        setCopilotError(result?.error || "Copilot failed to process the command.");
      }
    } catch {
      setCopilotError("Copilot is unavailable right now.");
    } finally {
      setCopilotLoading(false);
    }
  };

  const onInputChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setCopilotResult(null);
      setCopilotError(null);
    }
  };

  const canAsk = query.trim().length > 0;

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && canAsk) {
      event.preventDefault();
      void askCopilot();
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onValueChange={onInputChange}
        onKeyDown={onInputKeyDown}
        placeholder="Search commands or ask anything... (press Enter)"
      />
      <CommandList>
        <CommandEmpty>No command found.</CommandEmpty>

        {canAsk && (
          <CommandGroup heading="AI Copilot">
            <CommandItem value={`ask ${query}`} keywords={[query]} onSelect={askCopilot}>
              Ask Copilot: {query}
            </CommandItem>
          </CommandGroup>
        )}

        {canAsk && <CommandSeparator />}

        <CommandGroup heading="Navigation">
          {grouped.Navigation.map((item) => (
            <CommandItem key={item.path} onSelect={() => onSelect(item.path)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Operations">
          {grouped.Operations.map((item) => (
            <CommandItem key={item.path} onSelect={() => onSelect(item.path)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Shortcut</span>
          <CommandShortcut>Ctrl + K</CommandShortcut>
        </div>
        <div className="px-3 pb-2 text-[11px] text-slate-500 dark:text-slate-400">
          Type anything and press Enter to ask Copilot.
        </div>

        {(copilotLoading || copilotError || copilotResult) && (
          <div className="px-3 pb-3">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/70">
              {copilotLoading && <p className="text-slate-600 dark:text-slate-300">Analyzing your command...</p>}
              {copilotError && <p className="text-red-600 dark:text-red-400">{copilotError}</p>}
              {copilotResult && (
                <>
                  <p className="text-slate-800 dark:text-slate-100">{copilotResult.answer}</p>
                  {copilotResult.navigationPath && (
                    <button
                      type="button"
                      onClick={() => onSelect(copilotResult.navigationPath!)}
                      className="mt-2 text-left text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Open suggested page
                    </button>
                  )}
                  {Array.isArray(copilotResult.suggestions) && copilotResult.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                      {copilotResult.suggestions.slice(0, 4).map((s, idx) => (
                        <p key={`${idx}-${s}`}>- {s}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
