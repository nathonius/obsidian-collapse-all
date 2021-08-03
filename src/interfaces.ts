import { TFile, TFolder } from 'obsidian';

export interface FileExplorerItem {
  file: TFile | TFolder;
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
}

export interface TagPaneItem {
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
  children: TagPaneItem[];
}
