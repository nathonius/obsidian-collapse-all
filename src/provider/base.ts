import { Command, Plugin, WorkspaceLeaf } from 'obsidian';
import { COLLAPSE_ALL_ICON, EXPAND_ALL_ICON } from 'src/constants';

export abstract class ProviderBase {
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
   * Collapse command config
   */
  abstract readonly collapseCommand: Command;

  /**
   * Expand command config
   */
  abstract readonly expandCommand: Command;

  constructor(protected plugin: Plugin) {}

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
  public collapseAll(leaf?: WorkspaceLeaf): void {
    const leaves = leaf ? [leaf] : this.leaves;
    leaves.forEach((leaf) => {
      this.collapseOrExpandAll(leaf, true);
      this.updateButtonIcon(leaf, undefined, true);
    });
  }

  /**
   * Expand all collapsed items in the given leaf or all leaves
   */
  public expandAll(leaf?: WorkspaceLeaf): void {
    const leaves = leaf ? [leaf] : this.leaves;
    leaves.forEach((leaf) => {
      this.collapseOrExpandAll(leaf, false);
      this.updateButtonIcon(leaf, undefined, false);
    });
  }

  /**
   * Adds collapse buttons to all leaves.
   */
  public addCollapseButtons(): void {
    this.leaves.forEach((leaf) => {
      const container = leaf.view.containerEl as HTMLDivElement;
      const navContainer = container.querySelector(
        'div.nav-buttons-container'
      ) as HTMLDivElement;
      if (!navContainer) {
        return null;
      }

      const existingButton = this.getCollapseButton(leaf);
      if (existingButton) {
        return;
      }

      const newIcon = document.createElement('div');
      this.updateButtonIcon(leaf, newIcon);
      newIcon.className = `${this.collapseButtonClass} collapse-all-plugin-button`;
      this.plugin.registerDomEvent(newIcon, 'click', () => {
        this.onButtonClick(leaf);
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
    });
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
      const button = this.getCollapseButton(leaf);
      if (button) {
        button.remove();
      }
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
  private getCollapseButton(leaf: WorkspaceLeaf): HTMLDivElement | null {
    return leaf.view.containerEl.querySelector('.collapse-all-plugin-button');
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
      button = this.getCollapseButton(leaf);
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
  private onButtonClick(leaf: WorkspaceLeaf): void {
    if (leaf) {
      if (this.allCollapsed(leaf)) {
        this.expandAll(leaf);
      } else {
        this.collapseAll(leaf);
      }
    }
  }
}
