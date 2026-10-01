import { Compass } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-500 mb-6">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-default mb-2">{title}</h1>
        {description && (
          <p className="text-muted max-w-md leading-relaxed">{description}</p>
        )}
        <p className="text-sm text-muted mt-6 italic">
          This screen will be built in the next phase.
        </p>
      </div>
    </div>
  );
}
