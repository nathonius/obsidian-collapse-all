import { Plugin, WorkspaceLeaf } from 'obsidian';
import { COLLAPSE_ALL_ICON, DEFAULT_SETTINGS } from './constants';
import { CollapseAllSettings, CollapseAllSettingsTab } from './settings';

export class CollapseAllPlugin extends Plugin {
  settings: CollapseAllSettings;

  async onload() {
    await this.loadSettings();

    // TODO: Find a better event to listen for.
    // We only add the button once, but this is probably unnecessary.
    this.app.workspace.on('active-leaf-change', () => {
      const explorers = this.getFileExplorers();
      explorers.forEach((exp) => {
        this.addCollapseButton(exp);
      });
    });

    this.addSettingTab(new CollapseAllSettingsTab(this.app, this));

    // TODO: Add collapse command to palette.
  }

  onunload() {
    // Cleanup
  }

  private getFileExplorers(): WorkspaceLeaf[] {
    return this.app.workspace.getLeavesOfType('file-explorer');
  }

  private addCollapseButton(explorer: WorkspaceLeaf): void {
    // TODO: containerEl is not a public property of the leaf. Is there a better way?
    const container = (explorer as any).containerEl as HTMLDivElement;
    const navContainer = container.querySelector(
      'div.nav-buttons-container'
    ) as HTMLDivElement;
    if (navContainer.querySelector('.collapse-button')) {
      return;
    }
    const newIcon = document.createElement('div');
    // TODO: Better way to get this icon?
    newIcon.innerHTML = COLLAPSE_ALL_ICON;
    newIcon.className = 'nav-action-button collapse-button';
    newIcon.setAttribute('aria-label', 'Collapse All');
    this.registerDomEvent(newIcon, 'click', () => {
      const exp = document.querySelector(
        'div.workspace-leaf-content[data-type="file-explorer"]'
      ) as HTMLDivElement | null;
      if (exp) {
        this.collapseAll(exp);
      }
    });
    navContainer.appendChild(newIcon);
  }

  private collapseAll(element: HTMLDivElement): void {
    this.collapseAllUnder(
      element,
      0,
      this.settings.maxDepth,
      (11 - this.settings.speed) * 50
    );
  }

  private async collapseAllUnder(
    currentFolder: HTMLDivElement,
    depth: number,
    maxDepth: number,
    waitMs: number
  ): Promise<void> {
    while (true) {
      // Depth first search
      const nextFolder = this.getNextOpenFolder(currentFolder);
      // Root element has children to close
      if (nextFolder !== null && (maxDepth === -1 || depth < maxDepth)) {
        await this.collapseAllUnder(nextFolder, depth + 1, maxDepth, waitMs);
      }
      // Root element has no children to close. Close root element.
      else {
        const title = currentFolder.querySelector(
          'div.nav-folder-title'
        ) as HTMLDivElement | null;
        const children = currentFolder.querySelector('div.nav-folder-children');
        if (title && children) {
          title.click();
          // TODO: Fix incompatibility with folder note plugin.
          // As is, it will create new notes for some reason.
          await new Promise((r) => setTimeout(r, waitMs));
        }
        break;
      }
    }
  }

  private getNextOpenFolder(
    rootElement: HTMLElement | Document
  ): HTMLDivElement | null {
    return rootElement.querySelector(
      'div.nav-folder:not(.is-collapsed):not(.mod-root)'
    ) as HTMLDivElement;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

export default CollapseAllPlugin;
