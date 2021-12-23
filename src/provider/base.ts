import { Command, WorkspaceLeaf } from 'obsidian';
import { COLLAPSE_ALL_ICON, EXPAND_ALL_ICON, ProviderType } from '../constants';
import { CollapseAllPlugin } from '../plugin';

export abstract class ProviderBase {
  /**
   * ProviderType, used for configuration
   */
  abstract readonly providerType: ProviderType;

  /**
   * Used when adding UI
   */
  abstract readonly displayName: string;

  /**
   * Class that should be added to the collapse button.
   * Likely 'nav-action-button'.
   */
  protected abstract readonly collapseButtonClass: string;

  /**
   * Class to target for updating the button on click inside the leaf.
   * This should be whatever is clicked to expand/collapse items normally.
   */
  protected abstract readonly collapseClickTarget: string;

  /**
   * The leaf type for getLeavesOfType
   */
  protected abstract readonly leafType: string;

  /**
   * Name for the collapse command
   */
  protected abstract readonly collapseCommandName: string;

  /**
   * Name for the expand command
   */
  protected abstract readonly expandCommandName: string;

  constructor(protected plugin: CollapseAllPlugin) {}

  /**
   * Collapse command config
   */
  get collapseCommand(): Command {
    return {
      id: `collapse-all-collapse-${this.leafType}`,
      name: this.collapseCommandName,
      icon: 'double-up-arrow-glyph',
      callback: () => {
        this.collapseAll();
      }
    };
  }

  /**
   * Expand command config
   */
  get expandCommand(): Command {
    return {
      id: `collapse-all-expand-${this.leafType}`,
      name: this.expandCommandName,
      icon: 'double-down-arrow-glyph',
      callback: () => {
        this.expandAll();
      }
    };
  }

  /**
   * Collapse or expand all items for the given leaf
   */
  protected abstract collapseOrExpandAll(
    leaf: WorkspaceLeaf,
    collapsed: boolean
  ): void;

  /**
   * Returns true if every item in the given leaf is collapsed
   */
  protected abstract allCollapsed(leaf: WorkspaceLeaf): boolean;

  /**
   * Collapse all open items in the given leaf or all leaves
   */
  public collapseAll(updateIcon = true, singleLeaf?: WorkspaceLeaf): void {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    leaves.forEach((leaf) => {
      this.collapseOrExpandAll(leaf, true);
      if (updateIcon) {
        this.updateButtonIcon(leaf, undefined, true);
      }
    });
  }

  /**
   * Expand all collapsed items in the given leaf or all leaves
   */
  public expandAll(updateIcon = true, singleLeaf?: WorkspaceLeaf): void {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    leaves.forEach((leaf) => {
      this.collapseOrExpandAll(leaf, false);
      if (updateIcon) {
        this.updateButtonIcon(leaf, undefined, false);
      }
    });
  }

  /**
   * Adds collapse buttons to all leaves.
   */
  public addButtons(): void {
    this.leaves.forEach((leaf) => {
      const container = leaf.view.containerEl as HTMLDivElement;
      const navContainer = container.querySelector('div.nav-buttons-container');
      if (!navContainer) {
        return null;
      }

      if (!this.plugin.settings.splitButtons) {
        this.addSingleButton(leaf, navContainer);
      } else {
        this.addSplitButtons(leaf, navContainer);
      }
    });
  }

  private addSingleButton(leaf: WorkspaceLeaf, navContainer: Element): void {
    const existingButton = this.getCollapseButtons(leaf)[0];
    if (existingButton) {
      return;
    }

    const newIcon = document.createElement('div');
    this.updateButtonIcon(leaf, newIcon);
    newIcon.className = `${this.collapseButtonClass} collapse-all-plugin-button`;
    this.plugin.registerDomEvent(newIcon, 'click', () => {
      this.onSingleButtonClick(leaf);
    });
    navContainer.appendChild(newIcon);

    // Register click handler on leaf to toggle button icon
    const handler = () => {
      this.updateButtonIcon(leaf, newIcon);
    };
    leaf.view.containerEl.on('click', this.collapseClickTarget, handler);
    this.plugin.register(() => {
      leaf.view.containerEl.off('click', this.collapseClickTarget, handler);
    });
  }

  private addSplitButtons(leaf: WorkspaceLeaf, navContainer: Element): void {
    const existingButtons = this.getCollapseButtons(leaf);
    if (existingButtons.length == 2) {
      return;
    }

    // Add collapse button
    const collapseButton = document.createElement('div');
    this.updateButtonIcon(leaf, collapseButton, false);
    collapseButton.className = `${this.collapseButtonClass} collapse-all-plugin-button`;
    this.plugin.registerDomEvent(collapseButton, 'click', () => {
      this.collapseAll(false, leaf);
    });
    navContainer.appendChild(collapseButton);

    // Add expand button
    const expandButton = document.createElement('div');
    this.updateButtonIcon(leaf, expandButton, true);
    expandButton.className = `${this.collapseButtonClass} collapse-all-plugin-button`;
    this.plugin.registerDomEvent(expandButton, 'click', () => {
      this.expandAll(false, leaf);
    });
    navContainer.appendChild(expandButton);
  }

  /**
   * Refresh icons for all leaves to the correct state.
   */
  public updateButtonIcons(): void {
    this.leaves.forEach((leaf) => {
      this.updateButtonIcon(leaf);
    });
  }

  /**
   * Remove the collapse button from all leaves.
   */
  public removeCollapseButtons(): void {
    this.leaves.forEach((leaf) => {
      const buttons = this.getCollapseButtons(leaf);
      buttons.forEach((button) => {
        button.remove();
      });
    });
  }

  /**
   * Returns all loaded leaves of the class leafType
   */
  private get leaves(): WorkspaceLeaf[] {
    return this.plugin.app.workspace.getLeavesOfType(this.leafType);
  }

  /**
   * Get the collapse button for a given leaf, if it exists
   */
  private getCollapseButtons(leaf: WorkspaceLeaf): NodeListOf<HTMLDivElement> {
    return leaf.view.containerEl.querySelectorAll(
      '.collapse-all-plugin-button'
    );
  }

  /**
   * Update icon for given leaf/button to collapse/expand all.
   * Providing the forceAllCollapsed parameter will skip checking and assume that state
   */
  private updateButtonIcon(
    leaf: WorkspaceLeaf,
    button?: HTMLElement,
    forceAllCollapsed?: boolean
  ): void {
    if (!button) {
      button = this.getCollapseButtons(leaf)[0] || null;
    }
    if (button && forceAllCollapsed === undefined) {
      const allCollapsed = this.allCollapsed(leaf);
      button.innerHTML = allCollapsed ? EXPAND_ALL_ICON : COLLAPSE_ALL_ICON;
      button.setAttribute(
        'aria-label',
        allCollapsed ? 'Expand all' : 'Collapse all'
      );
    } else if (button) {
      button.innerHTML = forceAllCollapsed
        ? EXPAND_ALL_ICON
        : COLLAPSE_ALL_ICON;
      button.setAttribute(
        'aria-label',
        forceAllCollapsed ? 'Expand all' : 'Collapse all'
      );
    }
  }

  /**
   * Collapses or expands all items in the given leaf
   */
  private onSingleButtonClick(leaf: WorkspaceLeaf): void {
    if (leaf) {
      if (this.allCollapsed(leaf)) {
        this.expandAll(true, leaf);
      } else {
        this.collapseAll(true, leaf);
      }
    }
  }
}
