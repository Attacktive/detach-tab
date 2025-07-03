export interface DetachInfo {
	oldWindowId: number;
	oldPosition: number;
}

export interface TabInfo {
	id: number;
	index: number;
	active: boolean;
	windowId: number;
}

export interface WindowInfo {
	id: number;
	tabs: TabInfo[];
}

export interface UndoState {
	windowId: number;
	position: number;
	tabId: number;
}

interface QueryInfo {
	currentWindow?: boolean;
	active?: boolean;
}

interface MoveProperties {
	windowId: number;
	index: number;
}

interface UpdateProperties {
	active?: boolean;
	focused?: boolean;
}

interface CreateData {
	tabId?: number;
}

interface GetInfo {
	populate?: boolean;
}

interface Command {
	name: string;
	shortcut?: string;
}

interface CommandDetail {
	name: string;
	shortcut: string;
}

export interface BrowserAPI {
	tabs: {
		query: (queryInfo: QueryInfo) => Promise<TabInfo[]>;
		move: (tabIds: number | number[], moveProperties: MoveProperties) => Promise<TabInfo | TabInfo[]>;
		update: (tabId: number, updateProperties: UpdateProperties) => Promise<TabInfo>;
		onDetached: {
			addListener: (callback: (tabId: number, detachInfo: DetachInfo) => void) => void;
		};
	};

	windows: {
		create: (createData: CreateData) => Promise<WindowInfo>;
		update: (windowId: number, updateInfo: UpdateProperties) => Promise<WindowInfo>;
		getCurrent: (getInfo?: GetInfo) => Promise<WindowInfo>;
		getAll: (getInfo?: GetInfo) => Promise<WindowInfo[]>;
	};

	commands: {
		onCommand: {
			addListener: (callback: (command: string) => void) => void;
		};

		getAll: () => Promise<Command[]>;
		update: (detail: CommandDetail) => Promise<void>;
		reset: (name: string) => Promise<void>;
	};
}

declare const browser: BrowserAPI;
declare const chrome: BrowserAPI;
export const getBrowserAPI = (): BrowserAPI => {
	if (typeof browser !== 'undefined') {
		return browser;
	}

	if (typeof chrome !== 'undefined') {
		return chrome;
	}

	throw new Error('The current browser is neither Firefox nor Google Chrome or its derivative.');
};
