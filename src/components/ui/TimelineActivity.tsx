interface TimelineActivityProps {
  notes: string;
}

const ICON_MAP: Record<string, string> = {
  '📋': 'bg-slate-100',
  '⚡': 'bg-blue-100',
  '🔬': 'bg-amber-100',
  '📝': 'bg-purple-100',
  '✅': 'bg-emerald-100',
  '🎯': 'bg-green-100',
  '🔔': 'bg-red-100',
  '⚠️': 'bg-red-100',
  '🔄': 'bg-orange-100',
};

export function TimelineActivity({ notes }: TimelineActivityProps) {
  if (!notes) return null;

  const entries = notes.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-0">
      {entries.map((entry, idx) => {
        const icon = Object.keys(ICON_MAP).find(k => entry.includes(k)) || '📋';
        const bgColor = ICON_MAP[icon] || 'bg-slate-100';
        const isLast = idx === entries.length - 1;

        // Extract timestamp and content
        const match = entry.match(/^\[(.+?)\]\s*(.+)$/s);
        const timestamp = match?.[1] || '';
        const content = match?.[2] || entry;

        return (
          <div key={idx} className="flex gap-3 group">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} text-sm flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {icon}
              </div>
              {!isLast && (
                <div className="w-0.5 h-full min-h-[24px] bg-slate-100 my-1" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${isLast ? '' : ''}`}>
              {timestamp && (
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">{timestamp}</p>
              )}
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
