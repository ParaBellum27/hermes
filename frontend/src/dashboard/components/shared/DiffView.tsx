import { diffWords } from 'diff';

interface DiffViewProps {
  original: string;
  edited: string;
}

export function DiffView({ original, edited }: DiffViewProps) {
  const diff = diffWords(original, edited);

  return (
    <div className="text-sm leading-relaxed p-4 bg-white rounded border border-border min-h-[500px]">
      {diff.map((part, index) => {
        if (part.added) {
          return (
            <span
              key={index}
              className="bg-green-200 text-green-900 font-medium"
            >
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              key={index}
              className="bg-red-100 text-red-500 line-through opacity-60"
            >
              {part.value}
            </span>
          );
        }
        return <span key={index} className="text-[#696969]">{part.value}</span>;
      })}
    </div>
  );
}
