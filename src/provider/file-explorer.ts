import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class FileExplorerProvider extends ProviderBase {
  providerType: ProviderType = ProviderType.FileExplorer;
  displayName = 'File explorer';
  protected leafType = 'file-explorer';
  protected readonly collapseCommandName =
    'Collapse open folders in all file explorers';
  protected readonly expandCommandName =
    'Expand closed folders in all file explorers';
  protected readonly toggleCommandName =
    'Toggle collapse in all file explorers';
}
