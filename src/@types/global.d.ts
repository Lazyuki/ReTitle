// Replaced during Webpack build process
declare var BROWSER: 'chrome' | 'firefox';
declare var EXTENSION_VERSION: string;

interface Window {
  // Used for firefox only APIs
  browser: typeof browser;
}

type browser = typeof chrome;

declare namespace browser.commands {
  export type Command = chrome.commands.Command;

  export type CommandEvent = chrome.commands.CommandEvent;

  export var getAll: typeof chrome.commands.getAll;

  export var onCommand: CommandEvent;

  //Firefox only
  export function update(details: Command): Promise<void>;
}
