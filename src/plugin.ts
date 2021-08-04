import { Plugin } from 'obsidian';
import { FileExplorerProvider, TagPaneProvider } from './item-provider';

export class CollapseAllPlugin extends Plugin {
  fileExplorerProvider = new FileExplorerProvider(this);
  tagPaneProvider = new TagPaneProvider(this);

  async onload(): Promise<void> {
    // Initialize
    this.app.workspace.onLayoutReady(() => {
      this.fileExplorerProvider.addCollapseButtons();
      this.tagPaneProvider.addCollapseButtons();
    });

    // Leaves that get opened later on
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.fileExplorerProvider.addCollapseButtons();
        this.tagPaneProvider.addCollapseButtons();
      })
    );

    // Update icon when files are opened
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        this.fileExplorerProvider.updateButtonIcons();
        this.tagPaneProvider.updateButtonIcons();
      })
    );

    // Add collapse command to palette
    this.addCommand({
      id: 'collapse-all-collapse',
      name: 'Collapse all open folders in all file explorers',
      icon: 'double-up-arrow-glyph',
      callback: () => {
        this.fileExplorerProvider.collapseAll();
      }
    });

    // Add expand command to palette
    this.addCommand({
      id: 'collapse-all-expand',
      name: 'Expand closed folders in all file explorers',
      icon: 'double-down-arrow-glyph',
      callback: () => {
        this.fileExplorerProvider.expandAll();
      }
    });
  }

  onunload(): void {
    // Remove all collapse buttons
    this.fileExplorerProvider.removeCollapseButtons();
    this.tagPaneProvider.removeCollapseButtons();
  }
}
