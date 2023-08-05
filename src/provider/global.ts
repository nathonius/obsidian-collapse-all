import { WorkspaceLeaf } from 'obsidian';
import { ProviderType } from '../constants';
import { ProviderBase } from './base';

export class GlobalProvider extends ProviderBase {
  public readonly providerType: ProviderType = ProviderType.Global;
  public readonly displayName = 'All supported explorers (global)';
  protected readonly leafType = '';
  protected readonly toggleCommandName =
    'Toggle collapse state in all supported explorers';
  protected readonly collapseCommandName =
    'Collapse open items in all supported explorers';
  protected readonly expandCommandName =
    'Expand closed items in all supported explorers';

  private get providers() {
    return this.plugin.allProviders.filter(
      (p) => p.providerType !== ProviderType.Global
    );
  }

  public override allCollapsed(): boolean {
    return this.providers.every((p) => p.allCollapsed());
  }

  public override toggleCollapse(_: WorkspaceLeaf | null = null): void {
    for (const provider of this.providers) {
      provider.toggleCollapse();
    }
  }

  public override collapseAll(_: WorkspaceLeaf | null = null): void {
    for (const provider of this.providers) {
      provider.collapseAll();
    }
  }

  public override expandAll(_: WorkspaceLeaf | null = null): void {
    for (const provider of this.providers) {
      provider.expandAll();
    }
  }
}
