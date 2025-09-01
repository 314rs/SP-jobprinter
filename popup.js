document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('copy').addEventListener('click', copyToClipboard);

	// Check if we're on the correct page
	browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const currentUrl = tabs[0].url;
		if (currentUrl && currentUrl.includes('simplyprint.io/panel/jobs/')) {
			document.getElementById('printPage').style.display = 'block';
			document.getElementById('copy').style.display = 'inline-block';
			document.getElementById('wrongPage').style.display = 'none';
			loadJobData();
		} else {
			document.getElementById('printPage').style.display = 'none';
			document.getElementById('copy').style.display = 'none';
			document.getElementById('printPage').style.display = 'none';
			document.getElementById('wrongPage').style.display = 'block';
		}
	});
});

const file = document.getElementById('file');
const user = document.getElementById('user');
const filament = document.getElementById('filament');
const start_time = document.getElementById('start_time');
const duration = document.getElementById('duration');
const printer = document.getElementById('printer');
const color = document.getElementById('color');
const cost = document.getElementById('cost');

function loadJobData() {
	browser.storage.local.get(['jobDetails']).then((result) => {
		if (result.jobDetails) {
			const job = result.jobDetails.job;

			file.textContent = job.file;

			user.textContent = job.users.main.name;

			let gram = 0;
			for (const e in job.filament) {
				for (const item of job.filament[e].fil) {
					gram += item.gram;
				}
			}
			filament.textContent = gram + 'g';

			start_time.textContent = new Date(job.started).toLocaleString();

			cost.textContent = job.cost.total_cost + job.cost.currency;

			const seconds = job.totalPrintTime;
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			duration.textContent = `${hours}h ${minutes % 60}m ${seconds % 60}s`;

			printer.textContent = job.printer.name;

			color.textContent = job.customFields.filter((e) => e.id === 'color')[0].value.string;
		}
	});
}

function copyToClipboard() {
	const divContents = document.getElementById('printPage').innerText;
	const cleanedContents = divContents.replace(/\n\s*\n/g, '\n').trim();
	navigator.clipboard.writeText(cleanedContents);
}
