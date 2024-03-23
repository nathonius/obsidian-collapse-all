import { Command, WorkspaceLeaf } from 'obsidian';
import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class SearchProvider extends ProviderBase {
  public readonly providerType = ProviderType.Search;
  public readonly displayName = 'Search';
  protected readonly leafType = 'search';
  protected readonly collapseCommandName = 'Collapse all in search views';
  protected readonly expandCommandName = 'Expand all in search views';
  protected readonly toggleCommandName = 'Not available';

  protected override get commands(): Command[] {
    return [this.collapseCommand, this.expandCommand];
  }

  public override toggleCollapse(): void {
    // Not available
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
      // Not availabble
    } else {
      if (!leaf.view.setCollapseAll) {
        console.error(`No collapse function found on ${this.leafType} view.`);
        return;
      }
      leaf.view.setCollapseAll(collapsed);
    }
  }
}
