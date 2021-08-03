import { Plugin, TFolder, WorkspaceLeaf } from 'obsidian';
import { COLLAPSE_ALL_ICON, EXPAND_ALL_ICON } from './constants';
import { LeafType } from './enums';
import { FileExplorerItem, TagPaneItem } from './interfaces';

export class CollapseAllPlugin extends Plugin {
  async onload(): Promise<void> {
    // Initialize
    this.app.workspace.onLayoutReady(() => {
      // Add to file explorers
      const fileExplorers = this.getFileExplorers();
      fileExplorers.forEach((exp) => {
        this.addCollapseButton(exp, LeafType.FileExplorer);
      });

      // Add to tag panes
      const tagPanes = this.getTagPanes();
      tagPanes.forEach((pane) => {
        this.addCollapseButton(pane, LeafType.TagPane);
      });
    });

    // Leaves that get opened later on
    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        const fileExplorers = this.getFileExplorers();
        fileExplorers.forEach((exp) => {
          this.addCollapseButton(exp, LeafType.FileExplorer);
        });
        const tagPanes = this.getTagPanes();
        tagPanes.forEach((pane) => {
          this.addCollapseButton(pane, LeafType.TagPane);
        });
      })
    );

    // Update icon when files are opened
    this.registerEvent(
      this.app.workspace.on('file-open', () => {
        const fileExplorers = this.getFileExplorers();
        fileExplorers.forEach((exp) => {
          this.updateButtonIcon(exp, LeafType.FileExplorer);
        });
        const tagPanes = this.getTagPanes();
        tagPanes.forEach((pane) => {
          this.updateButtonIcon(pane, LeafType.TagPane);
        });
      })
    );

    // Add collapse command to palette
    this.addCommand({
      id: 'collapse-all-collapse',
      name: 'Collapse all open folders in all file explorers',
      icon: 'double-up-arrow-glyph',
      callback: () => {
        const explorers = this.getFileExplorers();
        if (explorers) {
          explorers.forEach((exp) => {
            this.collapseAll(exp, LeafType.FileExplorer);
          });
        }
      }
    });

    // Add expand command to palette
    this.addCommand({
      id: 'collapse-all-expand',
      name: 'Expand closed folders in all file explorers',
      icon: 'double-down-arrow-glyph',
      callback: () => {
        const explorers = this.getFileExplorers();
        if (explorers) {
          explorers.forEach((exp) => {
            this.expandAll(exp, LeafType.FileExplorer);
          });
        }
      }
    });
  }

  onunload(): void {
    // Remove all collapse buttons
    const fileExplorers = this.getFileExplorers();
    fileExplorers.forEach((exp) => {
      this.removeCollapseButton(exp);
    });
    const tagPanes = this.getTagPanes();
    tagPanes.forEach((pane) => {
      this.removeCollapseButton(pane);
    });
  }

  /**
   * Adds the collapse button to a leaf.
   * Returns the newly created button element or the old one if already there.
   */
  private addCollapseButton(leaf: WorkspaceLeaf, leafType: LeafType): void {
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
    this.updateButtonIcon(leaf, leafType, newIcon);
    newIcon.className = 'nav-action-button collapse-all-plugin-button';
    this.registerDomEvent(newIcon, 'click', () => {
      this.onButtonClick(leaf, leafType);
    });
    navContainer.appendChild(newIcon);

    // Register click handler on explorer to toggle button icon
    const handler = () => {
      this.updateButtonIcon(leaf, leafType, newIcon);
    };
    leaf.view.containerEl.on('click', '.nav-folder-title', handler);
    this.register(() => {
      leaf.view.containerEl.off('click', '.nav-folder-title', handler);
    });
  }

  /**
   * Remove the collapse button from a given file explorer leaf.
   */
  private removeCollapseButton(leaf: WorkspaceLeaf): void {
    const button = this.getCollapseButton(leaf);
    if (button) {
      button.remove();
    }
  }

  /**
   * Collapses or expands all folders in the given file explorer
   */
  private onButtonClick(leaf: WorkspaceLeaf, leafType: LeafType): void {
    if (leaf) {
      const items =
        leafType === LeafType.FileExplorer
          ? this.getExplorerItems(leaf)
          : this.getTagItems(leaf);
      const allCollapsed =
        leafType === LeafType.FileExplorer
          ? this.foldersAreCollapsed(items as FileExplorerItem[])
          : this.tagsAreCollapsed(items as TagPaneItem[]);
      if (allCollapsed) {
        this.expandAll(leaf, leafType);
      } else {
        this.collapseAll(leaf, leafType);
      }
    }
  }

  /**
   * Collapse all open folders in the given file explorer
   */
  private collapseAll(leaf: WorkspaceLeaf, leafType: LeafType): void {
    this.collapseOrExpandAll(leaf, leafType, true);
    this.updateButtonIcon(leaf, leafType, undefined, true);
  }

  /**
   * Expand all collapsed folders in the given file explorer
   */
  private expandAll(leaf: WorkspaceLeaf, leafType: LeafType): void {
    this.collapseOrExpandAll(leaf, leafType, false);
    this.updateButtonIcon(leaf, leafType, undefined, false);
  }

  /**
   * Collapse or expand all folders for the given file explorer
   */
  private collapseOrExpandAll(
    leaf: WorkspaceLeaf,
    leafType: LeafType,
    collapsed: boolean
  ): void {
    if (leaf && leafType === LeafType.FileExplorer) {
      const items = this.getExplorerItems(leaf);
      items.forEach((item) => {
        if (this.explorerItemIsFolder(item) && item.collapsed !== collapsed) {
          item.setCollapsed(collapsed);
        }
      });
    } else if (leaf && leafType === LeafType.TagPane) {
      const collapseTags = (tagItems: TagPaneItem[]) => {
        tagItems.forEach((i) => {
          if (this.tagPaneItemHasChildren(i)) {
            collapseTags(i.children);
          }
          i.setCollapsed(collapsed);
        });
      };
      const items = this.getTagItems(leaf);
      collapseTags(items);
    }
  }

  /**
   * Update icon for given explorer/button to collapse/expand all.
   * Providing the forceAllCollapsed parameter will skip checking and assume that state
   */
  private updateButtonIcon(
    leaf: WorkspaceLeaf,
    leafType: LeafType,
    button?: HTMLElement,
    forceAllCollapsed?: boolean
  ): void {
    if (!button) {
      button = this.getCollapseButton(leaf);
    }
    if (button && forceAllCollapsed === undefined) {
      const items =
        leafType === LeafType.FileExplorer
          ? this.getExplorerItems(leaf)
          : this.getTagItems(leaf);
      const allCollapsed =
        leafType === LeafType.FileExplorer
          ? this.foldersAreCollapsed(items as FileExplorerItem[])
          : this.tagsAreCollapsed(items as TagPaneItem[]);
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
   * Returns all loaded file explorer leaves
   */
  private getFileExplorers(): WorkspaceLeaf[] {
    return this.app.workspace.getLeavesOfType('file-explorer');
  }

  /**
   * Returns all loaded tag pane leaves
   */
  private getTagPanes(): WorkspaceLeaf[] {
    return this.app.workspace.getLeavesOfType('tag');
  }

  /**
   * Get the collapse button for a given file explorer, if it exists
   */
  private getCollapseButton(leaf: WorkspaceLeaf): HTMLDivElement | null {
    return leaf.view.containerEl.querySelector('.collapse-all-plugin-button');
  }

  /**
   * Get all `fileItems` on explorer view. This property is not documented.
   */
  private getExplorerItems(leaf: WorkspaceLeaf): FileExplorerItem[] {
    return Object.values((leaf.view as any).fileItems) as FileExplorerItem[];
  }

  /**
   * Get the root tag pane items from the tag pane view. This property is not documented.
   */
  private getTagItems(tagPane: WorkspaceLeaf): TagPaneItem[] {
    return (tagPane.view as any).root.children;
  }

  /**
   * Ensures given explorer item is a folder and not the root or a note
   */
  private explorerItemIsFolder(item: FileExplorerItem): boolean {
    return (
      item.file instanceof TFolder &&
      item.file.path !== '/' &&
      item.collapsed !== undefined
    );
  }

  /**
   * Returns true if this item has children
   */
  private tagPaneItemHasChildren(item: TagPaneItem): boolean {
    return item.children && item.children.length > 0;
  }

  /**
   * Returns true if every folder in the given items (files and folders) is collapsed
   */
  private foldersAreCollapsed(items: FileExplorerItem[]): boolean {
    return items.every(
      (i) => !this.explorerItemIsFolder(i) || i.collapsed === true
    );
  }

  /**
   * Given the root tags, checks all children to confirm they are closed. Note that this is recursive.
   */
  private tagsAreCollapsed(items: TagPaneItem[]): boolean {
    return items.every(
      (i) =>
        !this.tagPaneItemHasChildren(i) ||
        (i.collapsed === true && this.tagsAreCollapsed(i.children))
    );
  }
}
