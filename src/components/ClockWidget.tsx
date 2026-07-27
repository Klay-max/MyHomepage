import { useState, useEffect } from 'react';

export function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const dateStr = time.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-hover/60">
      <span className="text-xs text-ink-secondary font-medium">{dateStr}</span>
      <span className="text-sm font-mono font-semibold text-ink tabular-nums tracking-tight">
        {hours}:{minutes}
        <span className="text-ink-tertiary">:{seconds}</span>
      </span>
    </div>
  );
}
