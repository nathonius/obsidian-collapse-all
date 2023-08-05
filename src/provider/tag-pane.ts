import { CollapseAllPlugin } from '../plugin';
import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class TagPaneProvider extends ProviderBase {
  providerType: ProviderType = ProviderType.TagPane;
  displayName = 'Tag pane';
  protected leafType = 'tag';
  protected readonly collapseCommandName =
    'Collapse open tags in all tag explorers';
  protected readonly expandCommandName =
    'Expand closed tags in all tag explorers';
  protected readonly toggleCommandName = 'Toggle collapse in all tag explorers';

  constructor(plugin: CollapseAllPlugin) {
    super(plugin);
  }
}
