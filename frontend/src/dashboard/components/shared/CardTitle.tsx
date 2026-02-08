/**
 * CardTitle - Standardized title component for all cards
 */
interface CardTitleProps {
  title: string;
  subtitle?: string;
}

export function CardTitle({ title, subtitle }: CardTitleProps) {
  return (
    <p className="text-sm font-bold leading-none text-[#696969] uppercase tracking-wide py-1">
      {title}
      {subtitle && (
        <>
          {" • "}
          <span className="font-normal">{subtitle}</span>
        </>
      )}
    </p>
  );
}
