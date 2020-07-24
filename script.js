let notified;

function getTaskInfo(projectId, taskId) {
	return fetch(`https://app.activecollab.com/182296/api/v1/projects/${projectId}/tasks/${taskId}`)
		.then(response => response.json());
}

function notify(taskName) {
	const notification = new Notification('ПРЕВЫШЕНА ОЦЕНКА', {
		body: taskName, 
		dir: 'auto', 
		icon: '//assets.activecollab.com/feather/6.2.174/assets/system/images/layout/favicon/android-icon-192x192.png'
	});
	const audio = new Audio('https://dexin.dev/sms-alert-3-daniel_simon.mp3');
	audio.play();
	notified = taskName;
}

function findActiveTrack(stopwatches){
	return stopwatches.find(function(element){
		return element.started_on !== null;
	});
}

function checkFail() {
	fetch('https://app.activecollab.com/182296/api/v1/stopwatches')
	.then(response => response.json())
	.then((response) => {
		const track = findActiveTrack(response.stopwatches);
		if(typeof findActiveTrack === 'undefined') return false;
		const elapsed = ((track.elapsed + Math.round(Date.now()/1000) - track.started_on)/60/60).toFixed(2);
			
		getTaskInfo(track.project_id, track.parent_id).then((response) => {
			const estimate = response.single.estimate;
			if(elapsed > estimate) {
				if(notified != response.single.name) notify(response.single.name);
			}
		});
	});	
}

Notification.requestPermission(function(permission){
	setInterval(checkFail, 10000);
});
