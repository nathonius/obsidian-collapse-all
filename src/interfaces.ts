import { TFile, TFolder, View } from 'obsidian';
import { ProviderType } from './constants';

export interface Settings {
  commands: Record<ProviderType | 'global', boolean>;
  folderContextMenu: boolean;
  expandAttachmentFolder: boolean;
  splitButtons: boolean;
}

export interface FileExplorerItem {
  file: TFile | TFolder;
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
}

export interface TagExplorerItem {
  tag: string;
  children?: TagExplorerItem[];
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
  vChildren?: {
    _children: TagExplorerItem[]
  };
}

export interface TagPaneView extends View {
  tagDoms: TagExplorerItem[]
}
