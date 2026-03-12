/**
 * Shared navigation config for sidebar hotkeys.
 * Keys are always consecutive (1, 2, 3, 4, ...) based on visible items.
 */

/**
 * Returns the ordered list of visible navigation item IDs.
 */
function getVisibleItemIds(cyclesEnabled, codeEnabled) {
  const ids = ['okrs', 'roadmap', 'active-cycle'];
  if (cyclesEnabled) ids.push('cycles');
  ids.push('pages');
  if (codeEnabled) ids.push('code');
  ids.push('issues', 'requests');
  return ids;
}

/**
 * Returns the hotkey for a given item, or null if the item is hidden.
 */
export function getNavKey(cyclesEnabled, codeEnabled, itemId) {
  const visible = getVisibleItemIds(cyclesEnabled, codeEnabled);
  const index = visible.indexOf(itemId);
  return index >= 0 ? String(index + 1) : null;
}

/**
 * Returns the full list of visible navigation items with key, route, and description.
 */
export function getNavigationItems(cyclesEnabled, codeEnabled) {
  const items = [
    { id: 'okrs', route: 'okrs', description: 'Go to OKRs' },
    { id: 'roadmap', route: 'roadmap', description: 'Go to Roadmap' },
    {
      id: 'active-cycle',
      route: 'active-cycle',
      description: cyclesEnabled ? 'Go to Active Cycle' : 'Go to Active Work',
    },
  ];
  if (cyclesEnabled) {
    items.push({ id: 'cycles', route: 'cycles', description: 'Go to Cycles' });
  }
  items.push({ id: 'pages', route: 'pages', description: 'Go to Pages' });
  if (codeEnabled) {
    items.push({ id: 'code', route: 'code', description: 'Go to Code' });
  }
  items.push(
    { id: 'issues', route: 'issues', description: 'Go to Issues' },
    { id: 'requests', route: 'requests', description: 'Go to Requests' },
  );

  return items.map((item, i) => ({
    ...item,
    key: String(i + 1),
  }));
}
