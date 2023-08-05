import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, ProviderType } from './constants';
import { Settings } from './interfaces';
import {
  BookmarksProvider,
  FileExplorerProvider,
  GlobalProvider,
  SearchProvider,
  TagPaneProvider
} from './provider';
import { ProviderBase } from './provider/base';
import { CollapseAllPluginSettings } from './settings';

export class CollapseAllPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS;

  providers: Record<ProviderType, ProviderBase> = {
    [ProviderType.Global]: new GlobalProvider(this),
    [ProviderType.FileExplorer]: new FileExplorerProvider(this),
    [ProviderType.TagPane]: new TagPaneProvider(this),
    [ProviderType.Search]: new SearchProvider(this),
    [ProviderType.Bookmarks]: new BookmarksProvider(this)
  };

  get allProviders(): ProviderBase[] {
    return Object.values(this.providers);
  }

  async onload(): Promise<void> {
    // Load settings
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    // Add commands for each provider
    this.allProviders.forEach((provider) => {
      if (this.settings.commands[provider.providerType]) {
        provider.register();
      }
    });

    // Add settings tab
    this.addSettingTab(new CollapseAllPluginSettings(this.app, this));
  }

  saveSettings(): Promise<void> {
    return this.saveData(this.settings);
  }
}
