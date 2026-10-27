import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import logo from '@/assets/dose-logo.png';
import { IconTile } from '@/components/settings/SettingsRow';
import { SearchResults } from '@/components/settings/CategoryPane';
import { CATEGORIES, GROUP_LABELS, categoryPath, isCategoryId } from '@/components/settings/settingsConfig';
import { useIsWide } from '@/components/settings/useIsWide';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tool-accent';
const GROUPS = ['most-used', 'more'] as const;

// Sign-in gate for Settings. While false, Settings renders for everyone (signed in or not).
// To re-enable: set to true. Signed-out visitors are then sent to /auth?redirect=<current settings path>,
// and the page stays blank until auth has finished loading, so a signed-in refresh isn't bounced.
const REQUIRE_SIGN_IN = true;

// NOTE: relies on React Router's internal window.history.state.idx (not a public API).
// Re-test the Back arrow after React Router upgrades.
const historyIdx = () => (window.history.state as { idx?: number } | null)?.idx ?? 0;

/** Full-page settings view (rendered outside AppShell): header, category list, and the selected pane. */
const SettingsPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const wide = useIsWide();
  const [query, setQuery] = useState('');
  const startIdx = useRef(historyIdx());

  // Same pattern as the other pages: wait for auth to finish loading, then send signed-out users to /auth,
  // and bring them back to the exact settings page they opened. (Only when REQUIRE_SIGN_IN is on.)
  useEffect(() => {
    if (REQUIRE_SIGN_IN && !loading && !user) navigate(`/auth?redirect=${encodeURIComponent(pathname)}`, { replace: true });
  }, [loading, user, navigate, pathname]);

  // Picking a category, opening a detail view, or going back leaves search mode.
  useEffect(() => { setQuery(''); }, [pathname]);

  const [, , segment, sub] = pathname.split('/');
  const category = isCategoryId(segment) ? segment : undefined;
  const inDetail = category !== undefined && sub === 'name';
  const searching = query.trim().length > 0;
  // Phone only: the list, or one category full-screen, or search results.
  const showMain = category !== undefined || searching;
  const showList = !(category !== undefined && !searching);

  // Back within settings steps back one entry if we navigated inside settings, else replaces with `fallback`.
  const backWithin = (fallback: string) => {
    if (historyIdx() > startIdx.current) navigate(-1);
    else navigate(fallback, { replace: true });
  };

  const goBack = () => {
    if (!wide && searching) { setQuery(''); return; }
    if (inDetail) { backWithin(categoryPath(category)); return; }
    if (!wide && category) { backWithin('/settings'); return; }
    // Leave settings: back to the page we came from, or Home if there's no earlier page.
    if (startIdx.current > 0) navigate(-(historyIdx() - startIdx.current + 1));
    else navigate('/');
  };

  if (REQUIRE_SIGN_IN && (loading || !user)) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg-card px-4">
        <button
          onClick={goBack}
          aria-label="Back"
          className={cn('flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-primary/5', focusRing)}
        >
          <ArrowLeft size={20} />
        </button>
        <img src={logo} alt="" className="h-8 w-8" />
        <h1 className="font-heading font-extrabold text-foreground text-lg">Settings</h1>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col md:flex-row">
        <aside
          className={cn(
            'p-4 md:block md:w-[300px] md:shrink-0 md:border-r md:border-border',
            !showList && 'hidden',
          )}
        >
          <div className="relative mb-4">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
              placeholder="Search settings"
              aria-label="Search settings"
              className="rounded-button pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {searching && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className={cn('absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary hover:text-foreground', focusRing)}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <nav aria-label="Settings categories" className={cn(searching && 'hidden md:block')}>
            {GROUPS.map((group, i) => (
              <div key={group} className={cn(i > 0 && 'mt-3 border-t border-border pt-3')}>
                <p className="px-3 pb-2 text-text-hint font-body text-[11px] font-medium uppercase tracking-wider">
                  {GROUP_LABELS[group]}
                </p>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.filter((c) => c.group === group).map((c) => {
                    const selected = c.id === category;
                    return (
                      <Link
                        key={c.id}
                        to={categoryPath(c.id)}
                        aria-current={selected ? 'page' : undefined}
                        className={cn(
                          'flex min-h-12 items-center gap-3 rounded-button px-3 font-heading font-bold text-sm transition-colors',
                          selected
                            ? 'bg-primary/10 text-primary-strong'
                            : 'text-foreground hover:bg-primary/5 hover:text-primary-strong',
                          focusRing,
                        )}
                      >
                        <IconTile icon={c.icon} tone={c.tone} small />
                        <span className="flex-1">{c.label}</span>
                        <ChevronRight size={16} className="text-text-secondary md:hidden" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Bottom padding keeps the last row clear of the floating Slick bubble. */}
        <main className={cn('min-w-0 flex-1 p-4 pb-28 md:block md:p-8', !showMain && 'hidden')}>
          {searching ? <SearchResults query={query} /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
