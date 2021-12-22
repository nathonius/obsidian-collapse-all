import { Plugin } from 'obsidian';
import { FileExplorerProvider, TagPaneProvider } from './provider';
import { ProviderBase } from './provider/base';

export class CollapseAllPlugin extends Plugin {
  providers = {
    fileExplorer: new FileExplorerProvider(this),
    tag: new TagPaneProvider(this)
  };

  get allProviders(): ProviderBase[] {
    return Object.values(this.providers);
  }

  async onload(): Promise<void> {
    // Initialize
    this.app.workspace.onLayoutReady(() => {
      this.allProviders.forEach((provider) => {
        provider.addCollapseButtons();
      });
    });

    // File explorers that get opened later on
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.allProviders.forEach((provider) => {
          provider.addCollapseButtons();
        });
      })
    );

    // Update icon when files are opened
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        this.allProviders.forEach((provider) => {
          provider.updateButtonIcons();
        });
      })
    );

    // Add collapse command to palette
    this.addCommand({
      id: 'collapse-all-collapse',
      name: 'Collapse all open folders in all file explorers',
      icon: 'double-up-arrow-glyph',
      callback: () => {
        this.allProviders.forEach((provider) => {
          provider.collapseAll();
        });
      }
    });

    // Add expand command to palette
    this.addCommand({
      id: 'collapse-all-expand',
      name: 'Expand closed folders in all file explorers',
      icon: 'double-down-arrow-glyph',
      callback: () => {
        this.allProviders.forEach((provider) => {
          provider.collapseAll();
        });
      }
    });
  }

  onunload(): void {
    // Remove all collapse buttons
    this.allProviders.forEach((provider) => {
      provider.removeCollapseButtons();
    });
  }
}
