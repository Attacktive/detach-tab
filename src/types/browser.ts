import type FirefoxBrowser from 'webextension-polyfill';
import type { Tabs } from 'webextension-polyfill';

export type FirefoxApi = typeof FirefoxBrowser;

declare const browser: FirefoxApi;

export type TabInfo = chrome.tabs.Tab | Tabs.Tab;

export interface DetachInfo {
	oldWindowId: number;
	oldPosition: number;
}

export interface UndoState {
	windowId: number;
	position: number;
	tabId: number;
}

export type BrowserApi = typeof chrome | FirefoxApi;

export const getBrowserApi = (): BrowserApi => {
	if (isFirefox()) {
		return browser;
	}

	if (isChrome()) {
		return chrome;
	}

	throw new Error('The current browser is neither Firefox nor Google Chrome or its derivative.');
};

export const isFirefox = () => typeof browser !== 'undefined';

export const isChrome = () => typeof chrome !== 'undefined';
