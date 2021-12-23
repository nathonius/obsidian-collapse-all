import { App, PluginSettingTab, Setting } from 'obsidian';
import { CollapseAllPlugin } from './plugin';

export class CollapseAllPluginSettings extends PluginSettingTab {
  constructor(app: App, readonly plugin: CollapseAllPlugin) {
    super(app, plugin);
  }

  display() {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: 'Collapse all plugin settings.' });

    this.containerEl.createEl('h3', { text: 'Command Settings' });
    this.containerEl.createEl('p', {
      text: 'Each toggle controls whether commands should be added to collapse and expand that view, or global which operates on all available views. Updates on app reload.'
    });

    // Add global toggle
    new Setting(this.containerEl).setName('Global').addToggle((toggle) => {
      toggle
        .setTooltip('Global')
        .setValue(this.plugin.settings.commands.global)
        .onChange(async (value) => {
          this.plugin.settings.commands.global = value;
          await this.plugin.saveSettings();
        });
    });

    // Add individual toggles
    this.plugin.allProviders.forEach((provider) => {
      new Setting(this.containerEl)
        .setName(provider.displayName)
        .addToggle((toggle) => {
          toggle
            .setTooltip(provider.displayName)
            .setValue(this.plugin.settings.commands[provider.providerType])
            .onChange(async (value) => {
              this.plugin.settings.commands[provider.providerType] = value;
              await this.plugin.saveSettings();
            });
        });
    });
  }
}
