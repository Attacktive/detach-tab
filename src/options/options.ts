// It's dedicated to Firefox 🦊

import { getBrowserApi } from '../types/browser';

const api = getBrowserApi() as typeof browser;
const COMMAND_DETACH = 'detach-tab';
const COMMAND_REATTACH = 'reattach-tab';

const SELECTOR_SHORTCUT_DETACH = '#shortcut-detach';
const SELECTOR_SHORTCUT_REATTACH = '#shortcut-reattach';

async function updateUI() {
	const commands = await api.commands.getAll();

	for (const command of commands) {
		switch (command.name) {
			case COMMAND_DETACH: {
				const detachInput = document.querySelector<HTMLInputElement>(SELECTOR_SHORTCUT_DETACH);
				if (detachInput) {
					detachInput.value = command.shortcut ?? '';
				}
			}

				break;
			case COMMAND_REATTACH: {
				const reattachInput = document.querySelector<HTMLInputElement>(SELECTOR_SHORTCUT_REATTACH);
				if (reattachInput) {
					reattachInput.value = command.shortcut ?? '';
				}
			}

				break;
		}
	}
}

async function applyShortcut() {
	try {
		const detachInput = document.querySelector<HTMLInputElement>(SELECTOR_SHORTCUT_DETACH);
		const reattachInput = document.querySelector<HTMLInputElement>(SELECTOR_SHORTCUT_REATTACH);

		const commands = [];
		if (detachInput?.value) {
			commands.push({ name: COMMAND_DETACH, shortcut: detachInput.value });
		}

		if (reattachInput?.value) {
			commands.push({ name: COMMAND_REATTACH, shortcut: reattachInput.value });
		}

		const promises = commands.map(({ name, shortcut }) => api.commands.update({ name, shortcut }));
		await Promise.all(promises);

		showSuccessMessage('Shortcuts updated successfully!');
	} catch (error) {
		alert(error);
		console.error('Failed to apply shortcuts:', error);
		showErrorMessage('Failed to update shortcuts. Please try again.');

		throw error;
	}
}

async function resetShortcut() {
	try {
		await api.commands.reset(COMMAND_DETACH);
		await api.commands.reset(COMMAND_REATTACH);
		await updateUI();

		showSuccessMessage('Shortcuts reset to defaults!');
	} catch (error) {
		console.error('Failed to reset shortcuts:', error);
		showErrorMessage('Failed to reset shortcuts. Please try again.');

		throw error;
	}
}

function showSuccessMessage(message: string): void {
	showMessage(message, 'success');
}

function showErrorMessage(message: string): void {
	showMessage(message, 'error');
}

function showMessage(message: string, type: 'success' | 'error') {
	const messageElement = document.createElement('div');
	messageElement.textContent = message;
	messageElement.className = `message ${type}`;
	messageElement.style.backgroundColor = type === 'success'? '#4CAF50': '#f44336';

	document.body.appendChild(messageElement);
	setTimeout(
		() => {
			messageElement.style.opacity = '0';
			setTimeout(() => document.body.removeChild(messageElement), 300);
		},
		3000
	);
}

async function initialize() {
	await updateUI();

	const applyButton = document.querySelector('#apply');
	if (applyButton) {
		applyButton.addEventListener('click', applyShortcut);
	}

	const resetButton = document.querySelector('#reset');
	if (resetButton) {
		resetButton.addEventListener('click', resetShortcut);
	}

	const keyboardRulesLink = document.querySelector<HTMLAnchorElement>('#keyboard-rules-link');
	if (keyboardRulesLink) {
		keyboardRulesLink.addEventListener(
			'click',
			() => {
				window.open('https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#Key_combinations', '_blank');
			}
		);
	}

	document.addEventListener(
		'keydown',
		(event) => {
			if (event.ctrlKey) {
				switch (event.key) {
					case 'Enter':
						applyShortcut();
						break;
					case 'r':
						event.preventDefault();
						resetShortcut();
						break;
				}
			}
		}
	);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initialize);
} else {
	void initialize();
}
