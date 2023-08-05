// eslint-disable-next-line - Need at least one import so this compiles.
import { View } from 'obsidian';

declare module 'obsidian' {
  interface View {
    toggleCollapseAll: () => void;
    setCollapseAll: (collapse: boolean) => void;
    isAllCollapsed: boolean;
    collapseOrExpandAllEl: HTMLDivElement;
  }
}
