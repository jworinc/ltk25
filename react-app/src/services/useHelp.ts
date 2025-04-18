import { useState, useRef } from 'react';
import { useDataloader } from './useDataloader';

interface ItemsState {
  items: any[];
  loading: boolean;
}

export function useHelp() {
  const dl = useDataloader();
  const [helpMenuItems, setHelpMenuItems] = useState<ItemsState>({ items: [], loading: false });
  const helpItemsRef = useRef<any[]>([]);
  const [mask, setMask] = useState(false);

  // Load help menu configuration
  const loadConfigItems = async () => {
    setHelpMenuItems({ items: [], loading: true });
    try {
      const data = await dl.getHelpConfiguration();
      setHelpMenuItems({ items: data, loading: false });
    } catch (e) {
      setHelpMenuItems({ items: [], loading: false });
    }
  };

  // Get help menu items (triggers load if needed)
  const getConfigItems = () => {
    if (helpMenuItems.items.length === 0 && !helpMenuItems.loading) loadConfigItems();
    return helpMenuItems;
  };

  // Set help items
  const setItems = (items: any[]) => {
    helpItemsRef.current = items;
  };

  // Mask state handling (simplified for React)
  const showMask = () => setMask(true);
  const hideMask = () => setMask(false);

  return {
    helpMenuItems,
    loadConfigItems,
    getConfigItems,
    setItems,
    mask,
    showMask,
    hideMask,
  };
}
