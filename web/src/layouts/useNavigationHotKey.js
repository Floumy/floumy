import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';

export default function useNavigationHotKey(
  key,
  navigateTo,
  replace = false,
  enabled = true,
) {
  const navigate = useNavigate();

  useHotkeys(
    key,
    () => {
      // If previous page was a create page, replace it with the new page
      navigate(navigateTo, { replace });
    },
    {
      enabled,
    },
  );
}
