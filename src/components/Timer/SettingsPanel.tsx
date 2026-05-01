import { Bell, Moon, RotateCcw, Volume2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Settings } from "../../types";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
}

export function SettingsPanel({ settings, onChange, onReset }: SettingsPanelProps) {
  return (
    <aside className="rounded-lg border border-forge-line bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191a17]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#746f63] dark:text-[#b8b1a4]">Session setup</p>
          <h2 className="mt-1 text-xl font-semibold">Settings</h2>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-forge-line text-[#746f63] hover:bg-forge-paper hover:text-forge-ink dark:border-white/10 dark:text-[#b8b1a4] dark:hover:bg-white/10 dark:hover:text-white"
          onClick={onReset}
          title="Reset settings"
          type="button"
        >
          <RotateCcw size={17} />
        </button>
      </div>

      <div className="space-y-5">
        <NumberField
          label="Focus"
          value={settings.focusDuration}
          min={1}
          max={180}
          suffix="min"
          onChange={(focusDuration) => onChange({ focusDuration })}
        />
        <NumberField
          label="Short break"
          value={settings.shortBreakDuration}
          min={1}
          max={60}
          suffix="min"
          onChange={(shortBreakDuration) => onChange({ shortBreakDuration })}
        />
        <NumberField
          label="Long break"
          value={settings.longBreakDuration}
          min={1}
          max={90}
          suffix="min"
          onChange={(longBreakDuration) => onChange({ longBreakDuration })}
        />
        <NumberField
          label="Cycles before long break"
          value={settings.cyclesBeforeLongBreak}
          min={2}
          max={12}
          suffix="cycles"
          onChange={(cyclesBeforeLongBreak) => onChange({ cyclesBeforeLongBreak })}
        />

        <ToggleRow
          icon={Bell}
          label="Notifications"
          checked={settings.notificationsEnabled}
          onChange={(notificationsEnabled) => onChange({ notificationsEnabled })}
        />
        <ToggleRow
          icon={Volume2}
          label="Sound"
          checked={settings.soundEnabled}
          onChange={(soundEnabled) => onChange({ soundEnabled })}
        />

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Moon size={16} />
            Theme
          </div>
          <div className="grid grid-cols-3 rounded-lg border border-forge-line bg-forge-paper p-1 dark:border-white/10 dark:bg-black/20">
            {(["system", "light", "dark"] as const).map((theme) => (
              <button
                key={theme}
                className={`h-9 rounded-md text-sm font-medium capitalize transition ${
                  settings.theme === theme
                    ? "bg-white text-forge-ink shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-[#6f6b60] hover:text-forge-ink dark:text-[#aaa397] dark:hover:text-white"
                }`}
                onClick={() => onChange({ theme })}
                type="button"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <div className="flex h-11 items-center rounded-lg border border-forge-line bg-forge-paper px-3 dark:border-white/10 dark:bg-black/20">
        <input
          className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        <span className="text-sm text-[#746f63] dark:text-[#b8b1a4]">{suffix}</span>
      </div>
    </label>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange
}: {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-forge-line bg-forge-paper px-4 py-3 dark:border-white/10 dark:bg-black/20">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon size={16} />
        {label}
      </span>
      <input
        checked={checked}
        className="h-5 w-5 accent-forge-accent"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}
