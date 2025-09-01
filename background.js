let responseData = '';

function listener(details) {
	const filter = browser.webRequest.filterResponseData(details.requestId);
	const decoder = new TextDecoder('utf-8');
	// const encoder = new TextEncoder();

	filter.ondata = (event) => {
		const chunk = decoder.decode(event.data, { stream: true });
		responseData += chunk;
		filter.write(event.data);
	};

	filter.onstop = () => {
		try {
			const jsonData = JSON.parse(responseData);
			browser.storage.local.set({ jobDetails: jsonData });
		} catch (e) {
			console.error('Failed to parse JSON:', e);
		}
		responseData = '';
		filter.disconnect();
	};

	return {};
}

browser.webRequest.onBeforeRequest.addListener(
	listener,
	{
		urls: ['https://simplyprint.io/api/*/jobs/GetDetails*'],
		types: ['xmlhttprequest'],
	},
	['blocking'],
);

// Update icon based on current tab URL
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.url || changeInfo.status === 'complete') {
		updateIcon(tabId, tab.url);
	}
});

browser.tabs.onActivated.addListener((activeInfo) => {
	browser.tabs.get(activeInfo.tabId, (tab) => {
		updateIcon(activeInfo.tabId, tab.url);
	});
});

function updateIcon(tabId, url) {
	if (url && url.includes('simplyprint.io/panel/jobs/')) {
		browser.browserAction.setIcon({
			path: 'printer-color.svg',
			tabId: tabId,
		});
	} else {
		browser.browserAction.setIcon({
			path: 'printer-duotone.svg',
			tabId: tabId,
		});
	}
}
