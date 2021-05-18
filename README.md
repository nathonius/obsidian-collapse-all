## Collapse All

When your Obsidian file explorer is overloaded with open folders, close them all with a single click or command.

### Usage

To use, either click the new button at the top of the file explorer pane or run the "Collapse all open folders" command.

### Configuration

There are two settings for this plugin:

**Max Depth**  
If you have a very high level of nesting, closing all of your open folders could be problematic - the plugin uses a recursive strategy to close folders. Limiting the recursion depth means that deeply nested folders might not get closed, but will prevent any potential nesting issues. A value of `-1` means no maximum, a value of `0` will prevent any folders from being closed, and a value of `1` will close only top level folders. Defaults to `-1`.

**Speed**  
Because this plugin uses the UI to close the folders rather than an API, there is a small delay between closing each folder. Depending on lots of factors like the number of items in your folders and how fast your computer renders the change, you might need to slow down the plugin. Setting this to `1`, the slowest available speed, will mean a half second between closing each folder. Defaults to the maximum speed of `10`.

### Known Issues

1. If you find that some folders are not getting properly closed, try lowering the speed a step.
2. There is a minor incompatibility with the [Folder Note Plugin](https://github.com/xpgo/obsidian-folder-note-plugin) that might cause empty, untitled notes to be created in the root of your vault. If this happens, try lowering the speed a step.
