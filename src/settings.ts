import { App, PluginSettingTab, Setting } from 'obsidian';
import { CollapseAllPlugin } from './plugin';

export class CollapseAllPluginSettings extends PluginSettingTab {
  constructor(app: App, readonly plugin: CollapseAllPlugin) {
    super(app, plugin);
  }

  display() {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: 'Collapse all plugin settings.' });

    new Setting(this.containerEl)
      .setName('Split buttons')
      .setDesc(
        'If enabled, instead of swapping between collapse and expand, there will be two separate buttons, one for collapse and one for expand.'
      )
      .addToggle((toggle) => {
        toggle
          .setTooltip('Split buttons')
          .setValue(this.plugin.settings.splitButtons)
          .onChange(async (value) => {
            this.plugin.settings.splitButtons = value;
            this.plugin.onunload();
            this.plugin.allProviders.forEach((provider) => {
              provider.addButtons();
            });
            await this.plugin.saveSettings();
          });
      });

    this.containerEl.createEl('h3', { text: 'Command settings' });
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
