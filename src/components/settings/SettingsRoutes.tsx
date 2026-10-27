import { Navigate, useParams } from 'react-router-dom';
import { CategoryPane } from './CategoryPane';
import { DEFAULT_CATEGORY, categoryPath, isCategoryId } from './settingsConfig';
import { useIsWide } from './useIsWide';

/**
 * /settings with no category. Two panes: never leave the right pane empty, so show Account & Profile
 * (also when the window is widened later). On phones the category list is the screen, so render nothing.
 */
export const SettingsIndexRoute = () => {
  const wide = useIsWide();
  return wide ? <Navigate to={categoryPath(DEFAULT_CATEGORY)} replace /> : null;
};

export const SettingsCategoryRoute = () => {
  const { category } = useParams();
  if (!isCategoryId(category)) return <Navigate to={categoryPath(DEFAULT_CATEGORY)} replace />;
  return <CategoryPane categoryId={category} />;
};
