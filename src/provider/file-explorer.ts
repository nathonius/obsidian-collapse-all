import { Menu, TAbstractFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { CollapseAllPlugin } from '../plugin';
import { ProviderType } from '../constants';
import { FileExplorerItem } from '../interfaces';
import { ProviderBase } from './base';

export class FileExplorerProvider extends ProviderBase {
  providerType: ProviderType = ProviderType.FileExplorer;
  displayName = 'File Explorer';
  protected collapseButtonClass = 'nav-action-button';
  protected collapseClickTarget = '.nav-folder-title';
  protected leafType = 'file-explorer';
  protected collapseCommandName = 'Collapse open folders in all file explorers';
  protected expandCommandName = 'Expand closed folders in all file explorers';

  constructor(plugin: CollapseAllPlugin) {
    super(plugin);
  }

  handleMenu(menu: Menu, file: TAbstractFile, source: string): void {
    if (
      this.plugin.settings.folderContextMenu &&
      source === 'file-explorer-context-menu' &&
      file instanceof TFolder
    ) {
      const leaf = this.plugin.app.workspace
        .getLeavesOfType('file-explorer')
        .first();
      menu.addItem((item) => {
        item
          .setTitle('Collapse this level')
          .setIcon('double-up-arrow-glyph')
          .onClick(() => this.collapseOrExpandAll(leaf, true, file));
      });
      menu.addItem((item) => {
        item
          .setTitle('Expand this level')
          .setIcon('double-down-arrow-glyph')
          .onClick(() => this.collapseOrExpandAll(leaf, false, file));
      });
    }
  }

  protected override collapseOrExpandAll(
    leaf: WorkspaceLeaf,
    collapsed: boolean,
    parentFolder: TFolder | null = null
  ): void {
    let items: FileExplorerItem[] = [];
    if (parentFolder) {
      items = this.getCurrentLevelItems(leaf, parentFolder);
    } else {
      items = this.getExplorerItems(leaf);
    }
    items.forEach((item) => {
      if (this.explorerItemIsFolder(item) && item.collapsed !== collapsed) {
        item.setCollapsed(collapsed);
      }
    });
  }

  protected allCollapsed(leaf: WorkspaceLeaf): boolean {
    const items = this.getExplorerItems(leaf);
    return items.every(
      (i) => !this.explorerItemIsFolder(i) || i.collapsed === true
    );
  }

  /**
   * Get all `fileItems` on explorer view. This property is not documented.
   */
  private getExplorerItems(leaf: WorkspaceLeaf): FileExplorerItem[] {
    return Object.values((leaf.view as any).fileItems) as FileExplorerItem[];
  }

  /**
   * Get all FileExplorerItems that are descendants of the current folder
   */
  private getCurrentLevelItems(
    leaf: WorkspaceLeaf,
    parentFolder: TFolder
  ): FileExplorerItem[] {
    const allItems = this.getExplorerItems(leaf);
    // This is a very naiive but cheap way to do this.
    return allItems.filter((item) =>
      item.file.path.startsWith(`${parentFolder.path}/`)
    );
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
}
