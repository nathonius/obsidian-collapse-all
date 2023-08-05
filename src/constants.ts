import { Settings } from './interfaces';

export const DEFAULT_SETTINGS: Settings = {
  commands: {
    Global: false,
    FileExplorer: true,
    TagPane: true
  }
};

export enum ProviderType {
  FileExplorer = 'FileExplorer',
  TagPane = 'TagPane',
  Global = 'Global'
}
