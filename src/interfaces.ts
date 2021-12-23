import { TFile, TFolder } from 'obsidian';
import { ProviderType } from './constants';

export interface Settings {
  commands: Record<ProviderType | 'global', boolean>;
  splitButtons: boolean;
}

export interface FileExplorerItem {
  file: TFile | TFolder;
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
}

export interface TagExplorerItem {
  tag: string;
  children: TagExplorerItem[];
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
}
