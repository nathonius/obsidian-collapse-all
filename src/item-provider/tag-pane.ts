import { Plugin, WorkspaceLeaf } from 'obsidian';
import { TagPaneItem } from 'src/interfaces';
import { ItemProviderBase } from './base';

export class TagPaneProvider extends ItemProviderBase {
  protected collapseButtonClass = 'nav-action-button';
  protected collapseClickTarget = '.tag-container .tree-item';
  protected leafType = 'tag';

  constructor(plugin: Plugin) {
    super(plugin);
  }

  protected collapseOrExpandAll(leaf: WorkspaceLeaf, collapsed: boolean): void {
    const items = this.getTagItems(leaf);
    this.collapseTags(items, collapsed);
  }

  protected allCollapsed(leaf: WorkspaceLeaf): boolean {
    return this.tagsAreCollapsed(this.getTagItems(leaf));
  }

  private collapseTags(tagItems: TagPaneItem[], collapsed: boolean) {
    tagItems.forEach((i) => {
      if (this.tagPaneItemHasChildren(i)) {
        requestAnimationFrame(() => {
          this.collapseTags(i.children, collapsed);
        });
      }
      i.setCollapsed(collapsed);
    });
  }

  /**
   * Get the root tag pane items from the tag pane view. This property is not documented.
   */
  private getTagItems(tagPane: WorkspaceLeaf): TagPaneItem[] {
    return (tagPane.view as any).root.children;
  }

  /**
   * Returns true if this item has children
   */
  private tagPaneItemHasChildren(item: TagPaneItem): boolean {
    return item.children && item.children.length > 0;
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
