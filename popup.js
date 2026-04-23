document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('copyButton').addEventListener('click', copyToClipboard);
	document.getElementById('printButton').addEventListener('click', printLabel);

	// Check if we're on the correct page
	browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const currentUrl = tabs[0].url;
		if (currentUrl && currentUrl.includes('simplyprint.io/panel/jobs/')) {
			document.getElementById('printPage').style.display = 'block';
			document.getElementById('copyButton').style.display = 'inline-block';
			document.getElementById('wrongPage').style.display = 'none';
			loadJobData();
		} else {
			document.getElementById('printPage').style.display = 'none';
			document.getElementById('copyButton').style.display = 'none';
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
		// console.log(result.jobDetails);
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

async function printLabel() {
	const divContents = document.getElementById('printPage').innerHTML;
	const logoSvg = await fetch(browser.runtime.getURL('printer-color.svg')).then((r) => r.text());
	const html = `
		<html>
		<head>
			<title>Print Label</title>
			<style>
				body * {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}
				body {
					font-family: Arial, sans-serif;
					// height: 2in;
					// width: 4in;
					// border: 1px solid red;
					position: relative;
				}
				#logo {
					position: absolute;
					top: 6px;
					right: 6px;
					width: 40px;
					height: 40px;
				}
				@media print {
					@page { size: 4in 2in landscape; margin: 0; }
				}
			</style>
		</head>
		<body>
			<div id="logo">${logoSvg}</div>
			${divContents}
		</body>
		</html>
	`;
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const printWindow = window.open(url);
	printWindow.addEventListener('load', () => {
		printWindow.print();
		URL.revokeObjectURL(url);
		printWindow.addEventListener('afterprint', () => printWindow.close()); // TODO: test this.
	});
}
