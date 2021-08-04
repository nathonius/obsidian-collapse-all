import { Plugin, TFolder, WorkspaceLeaf } from 'obsidian';
import { FileExplorerItem } from 'src/interfaces';
import { ItemProviderBase } from './base';

export class FileExplorerProvider extends ItemProviderBase {
  protected collapseButtonClass = 'nav-action-button';
  protected collapseClickTarget = '.nav-folder-title';
  protected leafType = 'file-explorer';

  constructor(plugin: Plugin) {
    super(plugin);
  }

  protected collapseOrExpandAll(leaf: WorkspaceLeaf, collapsed: boolean): void {
    const items = this.getExplorerItems(leaf);
    items.forEach((item) => {
      if (this.explorerItemIsFolder(item) && item.collapsed !== collapsed) {
        item.setCollapsed(collapsed);
      }
    });
  }

  protected allCollapsed(leaf: WorkspaceLeaf): boolean {
    return this.foldersAreCollapsed(this.getExplorerItems(leaf));
  }

  /**
   * Get all `fileItems` on explorer view. This property is not documented.
   */
  private getExplorerItems(leaf: WorkspaceLeaf): FileExplorerItem[] {
    return Object.values((leaf.view as any).fileItems) as FileExplorerItem[];
  }

  /**
   * Ensures given explorer item is a folder and not the root or a note
   */
  private explorerItemIsFolder(item: FileExplorerItem): boolean {
    return (
      item.file instanceof TFolder &&
      item.file.path !== '/' &&
      item.collapsed !== undefined
    );
  }

  /**
   * Returns true if every folder in the given items (files and folders) is collapsed
   */
  private foldersAreCollapsed(items: FileExplorerItem[]): boolean {
    return items.every(
      (i) => !this.explorerItemIsFolder(i) || i.collapsed === true
    );
  }
}
