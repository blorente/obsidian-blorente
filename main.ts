import { App, TFile, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  diaryLocation: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  diaryLocation: 'Diary'
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'yesterday-open-yesterday-note',
      name: 'Open Note',
      callback: () => {
        let today = new Date();
        let yesterday = new Date(today.setDate(today.getDate() - 1));
        let yesterdayStr = yesterday.toISOString().split("T")[0];
        let fileName = this.settings.diaryLocation + "/" + yesterdayStr + ".md";
        this.openFile(fileName);
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  // Copied over from:
  //    Ref: https://github.com/SimplGy/obsidian-open-file-by-magic-date/blob/b01ddd1622bca34ed1e38b9a581d93136b5f81ae/src/main.ts#L103-L136k
  openFile(fileName: string) {
    let found = false;
    this.app.workspace.iterateAllLeaves(leaf => {
      const file: TFile = (leaf.view as any).file;
      if (file?.path === fileName) {
        this.app.workspace.revealLeaf(leaf);
        if (leaf.view instanceof MarkdownView) {
          leaf.view.editor.focus();
        }
        found = true;

        return;
      }
    });

    if (!found) {
      this.app.workspace.openLinkText(fileName, "", true);
    }
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}


class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for the Yesterday plugin.' });

    new Setting(containerEl)
      .setName('Diaries folder')
      .setDesc('Folder where you keep your diaries in the vault.')
      .addText(text => text
        .setPlaceholder('Diary')
        .setValue(this.plugin.settings.diaryLocation)
        .onChange(async (value) => {
          this.plugin.settings.diaryLocation = value;
          await this.plugin.saveSettings();
        }));
  }
}
