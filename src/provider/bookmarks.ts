import { Command, WorkspaceLeaf } from 'obsidian';
import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class BookmarksProvider extends ProviderBase {
  public readonly providerType = ProviderType.Bookmarks;
  public readonly displayName = 'Bookmarks';
  protected readonly leafType = 'bookmarks';
  protected readonly toggleCommandName = 'Toggle collapse in bookmarks view';
  protected readonly collapseCommandName = 'Not available';
  protected readonly expandCommandName = 'Not available';

  protected override get commands(): Command[] {
    return [this.toggleCommand];
  }

  protected override collapseOrExpandAll(leaf: WorkspaceLeaf): void {
    leaf.view.collapseOrExpandAllEl?.click();
  }
}
