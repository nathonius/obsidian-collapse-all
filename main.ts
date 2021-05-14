import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";

interface CollapseAllSettings {
  maxDepth: number;
}

const DEFAULT_SETTINGS: CollapseAllSettings = {
  maxDepth: -1,
};

export default class CollapseAllPlugin extends Plugin {
  settings: CollapseAllSettings;

  async onload() {
    await this.loadSettings();

    // TODO: Find a better event to listen for.
    // We only add the button once, but this is probably unnecessary.
    this.app.workspace.on("active-leaf-change", () => {
      const explorers = this.getFileExplorers();
      explorers.forEach((exp) => {
        this.addCollapseButton(exp);
      });
    });

    this.addSettingTab(new CollapseAllSettingsTab(this.app, this));
  }

  onunload() {
    console.log("unloading plugin");
  }

  private getFileExplorers(): WorkspaceLeaf[] {
    return this.app.workspace.getLeavesOfType("file-explorer");
  }

  private addCollapseButton(explorer: WorkspaceLeaf): void {
    // TODO: containerEl is not a public property of the leaf. Is there a better way?
    const container = (explorer as any).containerEl as HTMLDivElement;
    const navContainer = container.querySelector(
      "div.nav-buttons-container"
    ) as HTMLDivElement;
    if (navContainer.querySelector(".collapse-button")) {
      return;
    }
    const newIcon = document.createElement("div");
    // TODO: Add an actual icon
    newIcon.innerHTML = "C";
    newIcon.className = "nav-action-button collapse-button";
    this.registerDomEvent(newIcon, "click", () => {
      const exp = document.querySelector(
        'div.workspace-leaf-content[data-type="file-explorer"]'
      ) as HTMLDivElement | null;
      if (exp) {
        this.collapseAllUnder(exp, 0);
      }
    });
    navContainer.appendChild(newIcon);
  }

  private collapseAllUnder(currentFolder: HTMLDivElement, depth: number): void {
    while (true) {
      // Depth first search
      const nextFolder = this.getNextOpenFolder(currentFolder);
      // Root element has children to close
      if (
        nextFolder !== null &&
        (this.settings.maxDepth === -1 || depth < this.settings.maxDepth)
      ) {
        this.collapseAllUnder(nextFolder, depth + 1);
      }
      // Root element has no children to close. Close root element.
      else {
        const title = currentFolder.querySelector(
          "div.nav-folder-title"
        ) as HTMLDivElement | null;
        const children = currentFolder.querySelector("div.nav-folder-children");
        if (title && children) {
          // TODO: Fix incompatibility with folder note plugin.
          // As is, it will create new notes for some reason.
          title.click();
        }
        break;
      }
    }
  }

  private getNextOpenFolder(
    rootElement: HTMLElement | Document
  ): HTMLDivElement | null {
    return rootElement.querySelector(
      "div.nav-folder:not(.is-collapsed):not(.mod-root)"
    ) as HTMLDivElement;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

// TODO: Split this into its own file.
class CollapseAllSettingsTab extends PluginSettingTab {
  plugin: CollapseAllPlugin;

  constructor(app: App, plugin: CollapseAllPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // TODO: Setting the depth doesn't actually work.
  display(): void {
    let { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Max Depth")
      .setDesc(
        "Collapsing is done recursively. If you have an excessive amount of child folders, set this value. -1 is unlimited."
      )
      .addText((text) => {
        text.setValue("-1").onChange(async (value) => {
          const depth = parseInt(value, 10);
          this.plugin.settings.maxDepth = depth ? depth : -1;
          await this.plugin.saveSettings();
        });
      });
  }
}
