export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-4 ${className}`}>
      {Icon && (
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100">
          <Icon size={28} className="text-neutral-400" strokeWidth={1.5} />
        </div>
      )}
      <div className="text-center space-y-1.5">
        {title && (
          <p className="text-lg font-semibold text-neutral-900">{title}</p>
        )}
        {description && (
          <p className="text-sm text-neutral-500 max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
