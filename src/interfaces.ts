import { ProviderType } from './constants';

export interface Settings {
  commands: Record<ProviderType, boolean>;
}
