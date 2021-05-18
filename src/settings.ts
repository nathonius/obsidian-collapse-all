import { App, PluginSettingTab, Setting } from 'obsidian';
import { CollapseAllPlugin } from './plugin';

export interface CollapseAllSettings {
  maxDepth: number;
  speed: number;
}

export class CollapseAllSettingsTab extends PluginSettingTab {
  plugin: CollapseAllPlugin;

  constructor(app: App, plugin: CollapseAllPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    // Add Settings
    this.addMaxDepthSetting(containerEl);
    this.addSpeedSetting(containerEl);
  }

  private addMaxDepthSetting(containerEl: HTMLElement): void {
    const settings = this.plugin.settings;
    const maxDepthSetting = new Setting(containerEl)
      .setName(`Max Depth: ${settings.maxDepth}`)
      .setDesc(
        'Collapsing is done recursively. If you have an excessive amount of child folders, set this value. -1 is unlimited.'
      )
      .addSlider((slider) =>
        slider
          .setLimits(-1, 20, 1)
          .setValue(settings.maxDepth)
          .onChange((value) => {
            settings.maxDepth = value;
            this.plugin.saveData(settings);
            maxDepthSetting.setName(`Max Depth: ${settings.maxDepth}`);
          })
      );
  }

  private addSpeedSetting(containerEl: HTMLElement): void {
    const settings = this.plugin.settings;
    const speedSetting = new Setting(containerEl)
      .setName(`Speed: ${settings.speed}`)
      .setDesc(
        "If you prefer a slower collapse or you notice inconsistencies where subfolders aren't getting collapsed, lower the speed."
      )
      .addSlider((slider) =>
        slider
          .setLimits(1, 10, 1)
          .setValue(settings.speed)
          .onChange((value) => {
            settings.speed = value;
            this.plugin.saveData(settings);
            speedSetting.setName(`Speed: ${settings.speed}`);
          })
      );
  }
}
