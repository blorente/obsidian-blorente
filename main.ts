import { App, TFile, MarkdownView, Hotkey, Plugin, PluginSettingTab, Setting, Editor } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  diaryLocation: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  diaryLocation: 'Diary',
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'blorente-open-yesterday-note',
      name: 'Open Yesterday\'s Note',
      callback: () => {
        const today = new Date();
        const yesterday = new Date(today.setDate(today.getDate() - 1));
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        const fileName = this.settings.diaryLocation + "/" + yesterdayStr + ".md";
        this.openFile(fileName);
      }
    });

    this.addCommand({
      id: 'blorente-create-task',
      name: 'Create Task',
      editorCallback: (editor: Editor, _: MarkdownView) => {
        const curLine = editor.getLine(editor.getCursor().line).trimStart()
        if (curLine.contains("- [ ]")) {
          return
        }
        let taskStr = "- [ ] "
        if (curLine.startsWith("-")) {
          taskStr = " [ ] "
        } else if (curLine.startsWith("- ")) {
          taskStr = "[ ] "
        }
        editor.replaceRange(taskStr, editor.getCursor());
        const newPos = editor.getCursor()
        newPos.ch += taskStr.length
        editor.setCursor(newPos)
      },
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
