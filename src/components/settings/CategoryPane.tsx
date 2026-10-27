import { useAuth } from '@/hooks/useAuth';
import { SettingsCard, SettingsRow } from './SettingsRow';
import { findCategory, searchRows, type CategoryConfig, type CategoryId, type SettingRowConfig } from './settingsConfig';

const ConfigRow = ({ row, category, showCategory }: { row: SettingRowConfig; category: CategoryConfig; showCategory?: boolean }) => {
  const { user, loading } = useAuth();
  // While auth is loading, show the normal (signed-in) row instead of flashing the signed-out one.
  const alt = !loading && !user ? row.signedOut : undefined;
  const Control = alt && alt.control !== undefined ? alt.control : row.control;
  const to = alt && alt.to !== undefined ? alt.to : row.to;
  return (
    <SettingsRow
      icon={alt?.icon ?? row.icon}
      tone={row.featured ? category.tone : 'muted'}
      title={alt?.title ?? row.title}
      subtitle={alt?.subtitle ?? row.subtitle}
      category={showCategory ? category.label : undefined}
      to={to ?? undefined}
      soon={row.soon}
    >
      {Control && <Control />}
    </SettingsRow>
  );
};

/** Rows for one category. */
export const CategoryPane = ({ categoryId }: { categoryId: CategoryId }) => {
  const category = findCategory(categoryId);
  return (
    <section aria-labelledby="category-heading">
      <h2 id="category-heading" className="text-foreground font-heading font-extrabold text-xl mb-4">{category.label}</h2>
      <SettingsCard>
        {category.rows.map((row) => (
          <ConfigRow key={row.id} row={row} category={category} />
        ))}
      </SettingsCard>
    </section>
  );
};

/** Matching rows from every category, each labeled with its category. */
export const SearchResults = ({ query }: { query: string }) => {
  const results = searchRows(query);
  return (
    <section aria-labelledby="search-heading" aria-live="polite">
      <h2 id="search-heading" className="text-foreground font-heading font-extrabold text-xl mb-4">Search results</h2>
      {results.length === 0 ? (
        <p className="text-text-secondary font-body text-sm">No settings match “{query.trim()}”.</p>
      ) : (
        <SettingsCard>
          {results.map(({ category, row }) => (
            <ConfigRow key={`${category.id}:${row.id}`} row={row} category={category} showCategory />
          ))}
        </SettingsCard>
      )}
    </section>
  );
};
