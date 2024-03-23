// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { View } from 'obsidian';
declare module 'obsidian' {
  interface View {
    tree?: {
      toggleCollapseAll?: () => void;
      setCollapseAll?: (collapse: boolean) => void;
      isAllCollapsed?: boolean;
    };
    toggleCollapseAll?: () => void;
    setCollapseAll?: (collapse: boolean) => void;
    isAllCollapsed?: boolean;
    collapseOrExpandAllEl?: HTMLDivElement;
  }
}
