export function AuthIntentDivider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-uzazi-blush/50" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-3 text-uzazi-earth/55">{label}</span>
      </div>
    </div>
  );
}
