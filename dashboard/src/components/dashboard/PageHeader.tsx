import Link from "next/link";

export function PageHeader({
  icon,
  title,
  backHref = "/dashboard",
}: {
  icon: React.ReactNode;
  title: string;
  backHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={backHref}
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-brand-orange-soft text-brand-navy">
          {icon}
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      </div>
    </div>
  );
}

// Icônes trait (24x24, currentColor) partagées entre les pages du
// dashboard, dans le même style que la landing page.
export const dashboardIcons = {
  seo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  avis: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 9 22 9.5 16.5 14.5 18 22 12 18 6 22 7.5 14.5 2 9.5 9 9" />
    </svg>
  ),
  google: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10c0 5-6 11-6 11s-6-6-6-11a6 6 0 0 1 12 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  social: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-1L3 20l1-5.5a8.4 8.4 0 0 1-1-4 8.38 8.38 0 0 1 8.5-8.5 8.5 8.5 0 0 1 8.5 8.5z" />
    </svg>
  ),
  tiktok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v6a2 2 0 0 0 2 2v10" />
      <path d="M7 3v6" />
      <path d="M4 3v6" />
      <path d="M17 3c-1.5 1-2 3-2 5s.5 3 2 4v10" />
    </svg>
  ),
  edit: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  new: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};
