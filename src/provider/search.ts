import { Command } from 'obsidian';
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
}
