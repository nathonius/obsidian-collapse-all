import { Command, WorkspaceLeaf } from 'obsidian';
import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class TagPaneProvider extends ProviderBase {
  providerType: ProviderType = ProviderType.TagPane;
  displayName = 'Tag pane';
  protected leafType = 'tag';
  protected readonly collapseCommandName = 'Not available';
  protected readonly expandCommandName = 'Not available';
  protected readonly toggleCommandName = 'Toggle collapse in all tag explorers';

  protected override get commands(): Command[] {
    return [this.toggleCommand];
  }

  public override toggleCollapse(singleLeaf?: WorkspaceLeaf): void {
    const leaves = singleLeaf ? [singleLeaf] : this.leaves;
    for (const leaf of leaves) {
      if (!leaf.view.collapseOrExpandAllEl) {
        console.error(`No collapse element found on ${this.leafType} view.`);
        return;
      }
      leaf.view.collapseOrExpandAllEl.click();
    }
  }

  public override collapseAll(_?: WorkspaceLeaf | null): void {
    // Not available
  }

  public override expandAll(_?: WorkspaceLeaf | null): void {
    // Not available
  }
}
