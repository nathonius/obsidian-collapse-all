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

export class TagExplorerItemImpl implements TagExplorerItem {
  constructor(item: TagExplorerItem) {
    Object.assign(this, item);
    this.setCollapsed = item.setCollapsed.bind(item);
  }

  tag: string;
  children?: TagExplorerItem[];
  collapsed?: boolean;
  setCollapsed?: (state: boolean) => void;
  vChildren?: { _children: TagExplorerItem[]; };

  getChildrenSafe(): TagExplorerItem[] {
    return this.children ?? this.vChildren._children;
  }
}

export interface TagPaneView extends View {
  tagDoms: TagExplorerItem[]
}
