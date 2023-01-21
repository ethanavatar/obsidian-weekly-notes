import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import moment from 'moment';

// Remember to rename these classes and interfaces!

enum DayOfWeek {
	Monday = 'Monday',
	Tuesday = 'Tuesday',
	Wednesday = 'Wednesday',
	Thursday = 'Thursday',
	Friday = 'Friday',
	Saturday = 'Saturday',
	Sunday = 'Sunday'
}

interface ISettings {
	date_format: string;
	new_file_location: string;
	monday_template_location: string;
	tuesday_template_location: string;
	wednesday_template_location: string;
	thursday_template_location: string;
	friday_template_location: string;
	saturday_template_location: string;
	sunday_template_location: string;
	open_daily_note_on_startup: boolean;
}

const DEFAULT_SETTINGS: ISettings = {
	date_format: 'YY-MM-DD',
	new_file_location: '',
	monday_template_location: '',
	tuesday_template_location: '',
	wednesday_template_location: '',
	thursday_template_location: '',
	friday_template_location: '',
	saturday_template_location: '',
	sunday_template_location: '',
	open_daily_note_on_startup: false
}

export default class WeeklyNotesPlugin extends Plugin {
	settings: ISettings;

	createNote(name: string, template: TFile | null = null) {

		if (template === null) {
			new Notice(`Template file not found`);
			return;
		}

		this.app.vault.create(name, '')
			.then((file: TFile) => {
				this.app.workspace.getLeaf().openFile(file);
				new Notice(`Created '${name}'`)

				this.app.vault.read(template)
					.then((content: string) => {
						this.app.vault.modify(file, content);
						new Notice(`Added template to '${name}'`);
					})
					.catch((err: Error) => new Notice(`Could not read template '${template.path}'`));
			})
			.catch((err: Error) => {
				// if the file already exists
				if (err.message === 'File already exists.') {
					// get the file
					const file = this.app.vault.getAbstractFileByPath(name);

					// open the file
					this.app.workspace.getLeaf().openFile(file as TFile)
						.then(() => new Notice(`Opened '${name}'`))
						.catch((err: Error) => new Notice(`Could not open file '${name}'`));

					return;
				}

				new Notice(`Error: ${err.message}`);
			})
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('calendar', 'Open Weekly Note', (evt: MouseEvent) => {
			// Called when the user clicks the icon.

			let currentDay: DayOfWeek = moment().format('dddd') as DayOfWeek;

			let template: TFile | null = null;
			switch (currentDay) {
			case DayOfWeek.Monday:
				template = this.app.vault.getAbstractFileByPath(this.settings.monday_template_location) as TFile;
				break;
			case DayOfWeek.Tuesday:
				template = this.app.vault.getAbstractFileByPath(this.settings.tuesday_template_location) as TFile;
				break;
			case DayOfWeek.Wednesday:
				template = this.app.vault.getAbstractFileByPath(this.settings.wednesday_template_location) as TFile;
				break;
			case DayOfWeek.Thursday:
				template = this.app.vault.getAbstractFileByPath(this.settings.thursday_template_location) as TFile;
				break;
			case DayOfWeek.Friday:
				template = this.app.vault.getAbstractFileByPath(this.settings.friday_template_location) as TFile;
				break;
			case DayOfWeek.Saturday:
				template = this.app.vault.getAbstractFileByPath(this.settings.saturday_template_location) as TFile;
				break;
			case DayOfWeek.Sunday:
				template = this.app.vault.getAbstractFileByPath(this.settings.sunday_template_location) as TFile;
				break;
			}

			let date: string = moment().format(this.settings.date_format);
			let location: string = this.settings.new_file_location;
			
			this.createNote(`${location}/${date}.md`, template);
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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

class SettingTab extends PluginSettingTab {
	plugin: WeeklyNotesPlugin;

	constructor(app: App, plugin: WeeklyNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Weekly Notes Plugin'});

		new Setting(containerEl)
			.setName('Date Format')
			.addMomentFormat((text) => text
				.setPlaceholder('YYYY-MM-DD')
				.setValue(this.plugin.settings.date_format)
				.onChange(async (value) => {
					this.plugin.settings.date_format = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('New file location')
			.setDesc('The location where the new file will be created')
			.addText(text => text
				.setValue(this.plugin.settings.new_file_location)
				.onChange(async (value) => {
					this.plugin.settings.new_file_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Monday template location')
			.addText(text => text
				.setValue(this.plugin.settings.monday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.monday_template_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Tuesday template location')
			.addText(text => text
				.setValue(this.plugin.settings.tuesday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.tuesday_template_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Wednesday template location')
			.addText(text => text
				.setValue(this.plugin.settings.wednesday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.wednesday_template_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Thursday template location')
			.addText(text => text
				.setValue(this.plugin.settings.thursday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.thursday_template_location = value;
					await this.plugin.saveSettings();
				}
			));
				
		new Setting(containerEl)
			.setName('Friday template location')
			.addText(text => text
				.setValue(this.plugin.settings.friday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.friday_template_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Saturday template location')
			.addText(text => text
				.setValue(this.plugin.settings.saturday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.saturday_template_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Sunday template location')
			.addText(text => text
				.setValue(this.plugin.settings.sunday_template_location)
				.onChange(async (value) => {
					this.plugin.settings.sunday_template_location = value;
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName('Open daily note on startup')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.open_daily_note_on_startup)
				.onChange(async (value) => {
					this.plugin.settings.open_daily_note_on_startup = value;
					await this.plugin.saveSettings();
				}
			));
	}
}
