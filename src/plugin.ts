import { Plugin, WorkspaceLeaf } from 'obsidian';
import { COLLAPSE_ALL_ICON, DEFAULT_SETTINGS } from './constants';
import { CollapseAllSettings, CollapseAllSettingsTab } from './settings';

export class CollapseAllPlugin extends Plugin {
  settings: CollapseAllSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    // TODO: Find a better event to listen for.
    // We only add the button once, but this is probably unnecessary.
    this.app.workspace.on('active-leaf-change', () => {
      const explorers = this.getFileExplorers();
      explorers.forEach((exp) => {
        this.addCollapseButton(exp);
      });
    });

    this.addCommand({
      id: 'collapse-all-collapse',
      name: 'Collapse all open folders',
      icon: 'double-up-arrow-glyph',
      callback: () => {
        this.collapseAllCommand();
      }
    });
    this.addSettingTab(new CollapseAllSettingsTab(this.app, this));
  }

  /**
   * Adds the collapse button to a file explorer leaf.
   */
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
      const exp = this.getFileExplorerElement();
      if (exp) {
        this.collapseAll(exp);
      }
    });
    navContainer.appendChild(newIcon);
  }

  /**
   * Switches to the file explorer leaf, then collapses as normal.
   */
  private async collapseAllCommand(): Promise<void> {
    const leaves = this.getFileExplorers();
    if (leaves && leaves.length > 0) {
      // Switch to file explorer
      this.app.workspace.revealLeaf(leaves[0]);
      // Wait for file explorer to be revealed
      await new Promise((r) => setTimeout(r, 50));

      const explorer = this.getFileExplorerElement();
      if (explorer) {
        this.collapseAll(explorer);
      }
    }
  }

  /**
   * Recursive root function with starting depth
   */
  private collapseAll(element: HTMLDivElement): void {
    this.collapseAllUnder(
      element,
      0,
      this.settings.maxDepth,
      (11 - this.settings.speed) * 50
    );
  }

  /**
   * Recursively, depth-first closes folders up to a given max depth.
   * Must wait some time between each close action for the UI to settle out.
   */
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
          // As is, it will create new notes for some reason if this wait time is too low.
          await new Promise((r) => setTimeout(r, waitMs));
        }
        break;
      }
    }
  }

  /**
   * Returns all loaded file explorer leaves
   */
  private getFileExplorers(): WorkspaceLeaf[] {
    return this.app.workspace.getLeavesOfType('file-explorer');
  }

  /**
   * Get the content element for the open file explorer
   */
  private getFileExplorerElement(): HTMLDivElement | null {
    return document.querySelector(
      'div.workspace-leaf-content[data-type="file-explorer"]'
    ) as HTMLDivElement | null;
  }

  /**
   * Finds an open folder element that is a child of the given root element.
   */
  private getNextOpenFolder(
    rootElement: HTMLElement | Document
  ): HTMLDivElement | null {
    return rootElement.querySelector(
      'div.nav-folder:not(.is-collapsed):not(.mod-root)'
    ) as HTMLDivElement;
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
