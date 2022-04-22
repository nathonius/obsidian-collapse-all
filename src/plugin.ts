import { Menu, MenuItem, Plugin, TAbstractFile, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, ProviderType } from './constants';
import { Settings } from './interfaces';
import { FileExplorerProvider, TagPaneProvider } from './provider';
import { ProviderBase } from './provider/base';
import { CollapseAllPluginSettings } from './settings';

export class CollapseAllPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS;

  providers: Record<ProviderType, ProviderBase> = {
    [ProviderType.FileExplorer]: new FileExplorerProvider(this),
    [ProviderType.TagPane]: new TagPaneProvider(this)
  };

  get allProviders(): ProviderBase[] {
    return Object.values(this.providers);
  }

  async onload(): Promise<void> {
    // Load settings
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    // Initialize
    this.app.workspace.onLayoutReady(() => {
      this.allProviders.forEach((provider) => {
        provider.addButtons();
      });
    });

    this.app.workspace.on(
      'file-menu',
      (menu: Menu, file: TAbstractFile, source: string) => {
        (this.providers.FileExplorer as FileExplorerProvider).handleMenu(
          menu,
          file,
          source
        );
      }
    );

    // File explorers that get opened later on
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.allProviders.forEach((provider) => {
          provider.addButtons();
        });
      })
    );

    // Update icon when files are opened
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        if (!this.settings.splitButtons) {
          this.allProviders.forEach((provider) => {
            provider.updateButtonIcons();
          });
        }
      })
    );

    if (this.settings.commands.global) {
      // Add global collapse command to palette
      this.addCommand({
        id: 'collapse-all-collapse',
        name: 'Collapse open items in all supported explorers',
        icon: 'double-up-arrow-glyph',
        callback: () => {
          this.allProviders.forEach((provider) => {
            provider.collapseAll();
          });
        }
      });

      // Add global expand command to palette
      this.addCommand({
        id: 'collapse-all-expand',
        name: 'Expand closed items in all supported explorers',
        icon: 'double-down-arrow-glyph',
        callback: () => {
          this.allProviders.forEach((provider) => {
            provider.expandAll();
          });
        }
      });
    }

    // Add individual commands for each provider
    this.allProviders.forEach((provider) => {
      if (this.settings.commands[provider.providerType]) {
        this.addCommand(provider.collapseCommand);
        this.addCommand(provider.expandCommand);
      }
    });

    // Add settings tab
    this.addSettingTab(new CollapseAllPluginSettings(this.app, this));
  }

  onunload(): void {
    // Remove all collapse buttons
    this.allProviders.forEach((provider) => {
      provider.removeCollapseButtons();
    });
  }

  saveSettings(): Promise<void> {
    return this.saveData(this.settings);
  }
}
