import { Command, WorkspaceLeaf } from 'obsidian';
import { ProviderType } from '../constants';
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
   * The leaf type for getLeavesOfType
   */
  protected abstract readonly leafType: string;

  /**
   * Name for the toggle command
   */
  protected abstract readonly toggleCommandName: string;

  /**
   * Name for the collapse command
   */
  protected abstract readonly collapseCommandName: string;

  /**
   * Name for the expand command
   */
  protected abstract readonly expandCommandName: string;

  private registered = false;

  constructor(protected plugin: CollapseAllPlugin) {}

  /**
   * Collapse command config
   */
  protected get collapseCommand(): Command {
    return {
      id: `collapse-${this.leafType}`,
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
  protected get expandCommand(): Command {
    return {
      id: `expand-${this.leafType}`,
      name: this.expandCommandName,
      icon: 'double-down-arrow-glyph',
      callback: () => {
        this.expandAll();
      }
    };
  }

  /**
   * Toggle command config
   */
  protected get toggleCommand(): Command {
    return {
      id: `toggle-${this.leafType}`,
      name: this.toggleCommandName,
      icon: 'double-down-arrow-glyph',
      callback: () => {
        this.toggleCollapse();
      }
    };
  }

  protected get commands(): Command[] {
    return [this.collapseCommand, this.expandCommand, this.toggleCommand];
  }

  public register(): void {
    if (this.registered) {
      return;
    }
    for (const command of this.commands) {
      this.plugin.addCommand(command);
    }
    this.registered = true;
  }

  /**
   * Collapse or expand all items for the given leaf
   * @argument collapsed if not provided, will toggle the state
   */
  protected collapseOrExpandAll(
    leaf: WorkspaceLeaf,
    collapsed?: boolean
  ): void {
    if (collapsed === undefined) {
      if (!leaf.view.tree?.toggleCollapseAll) {
        console.error(
          `No toggle collapse function found on ${this.leafType} view.`
        );
        return;
      }
      leaf.view.tree?.toggleCollapseAll();
    } else {
      if (!leaf.view.tree?.setCollapseAll) {
        console.error(`No collapse function found on ${this.leafType} view.`);
        return;
      }
      leaf.view.tree.setCollapseAll(collapsed);
    }
  }

  /**
   * Returns true if every item in the given leaf is collapsed
   */
  public allCollapsed(singleLeaf: WorkspaceLeaf | null = null): boolean {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    let collapsed = true;
    for (const leaf of leaves) {
      if (leaf.view.tree?.isAllCollapsed === undefined) {
        console.error('No collapsed state found on view.');
        collapsed = false;
      }
    }
    return collapsed;
  }

  public toggleCollapse(singleLeaf: WorkspaceLeaf | null = null): void {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    for (const leaf of leaves) {
      this.collapseOrExpandAll(leaf);
    }
  }

  /**
   * Collapse all open items in the given leaf or all leaves
   */
  public collapseAll(singleLeaf: WorkspaceLeaf | null = null): void {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    for (const leaf of leaves) {
      this.collapseOrExpandAll(leaf, true);
    }
  }

  /**
   * Expand all collapsed items in the given leaf or all leaves
   */
  public expandAll(singleLeaf: WorkspaceLeaf | null = null): void {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    for (const leaf of leaves) {
      this.collapseOrExpandAll(leaf, false);
    }
  }

  /**
   * Returns all loaded leaves of the class leafType
   */
  protected get leaves(): WorkspaceLeaf[] {
    return this.plugin.app.workspace.getLeavesOfType(this.leafType);
  }
}
