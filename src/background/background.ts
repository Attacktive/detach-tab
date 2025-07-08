import { DetachInfo, getBrowserApi, TabInfo, UndoState, isFirefox } from '../types/browser';

const api = getBrowserApi();

interface GlobalState {
	undoState?: UndoState;
}

const globalState: GlobalState = {
	undoState: undefined
};

function handleDetached(tabId: number, { oldWindowId, oldPosition }: DetachInfo) {
	globalState.undoState = {
		windowId: oldWindowId,
		position: oldPosition,
		tabId
	};
}

async function getCurrentWindowTabs() {
	return api.tabs.query({ currentWindow: true });
}

async function getActiveTab() {
	const tabs = await getCurrentWindowTabs();

	return tabs.find(({ active }) => active);
}

async function detachActiveTab() {
	const windowInfo = await api.windows.getCurrent({ populate: true });
	if (!windowInfo.tabs || windowInfo.tabs.length < 2) {
		return;
	}

	const activeTab = await getActiveTab();
	if (activeTab) {
		await api.windows.create({ tabId: activeTab.id });
	} else {
		console.warn('No active tab is found.');
	}
}

async function reattachLastTab() {
	if (!globalState.undoState) {
		return;
	}

	try {
		const allWindows = await api.windows.getAll({ populate: true });

		const targetTab: TabInfo | undefined = allWindows
			.map(({ tabs }) => tabs)
			.filter(Boolean)
			.flatMap(tabs => tabs as TabInfo[])
			.find((tab: TabInfo) => tab.id === globalState.undoState!.tabId);

		if (!targetTab) {
			console.warn('No detached tab is found.');
			return;
		}

		const targetWindow = allWindows.find(window => window.id === globalState.undoState!.windowId);
		if (!targetWindow) {
			console.warn('Failed to find the window the tab to reattach.');
			return;
		}

		await api.tabs.move(
			[globalState.undoState.tabId],
			{
				windowId: globalState.undoState.windowId,
				index: globalState.undoState.position
			}
		);

		await api.windows.update(globalState.undoState.windowId, { focused: true });

		if (isFirefox()) {
			await (api as typeof browser).tabs.update(globalState.undoState.tabId, { active: true });
		} else {
			await (api as typeof chrome).tabs.update(globalState.undoState.tabId, { active: true });
		}
	} catch (error) {
		console.error('Failed to reattach tab, but still clearing the detaching history.', error);
		throw error;
	} finally {
		globalState.undoState = undefined;
	}
}

async function handleCommand(command: string) {
	switch (command) {
		case 'detach-tab':
			return await detachActiveTab();
		case 'reattach-tab':
			return await reattachLastTab();
		default:
			console.warn(`Unexpected command: ${command}`);
	}
}

api.tabs.onDetached.addListener(handleDetached);
api.commands.onCommand.addListener(handleCommand);
