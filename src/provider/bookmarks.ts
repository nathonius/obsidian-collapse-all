import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class BookmarksProvider extends ProviderBase {
  public readonly providerType = ProviderType.Bookmarks;
  public readonly displayName = 'Bookmarks';
  protected readonly leafType = 'bookmarks';
  protected readonly toggleCommandName = 'Toggle collapse in bookmarks view';
  protected readonly collapseCommandName = 'Collapse all in bookmarks view';
  protected readonly expandCommandName = 'Expand all in bookmarks view';
}
