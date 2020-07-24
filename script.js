(() => {
  function getWorkspaceId() {
    const result = location.href.match(/\.com\/(\d+)\//, '');
    return result ? result[1] : result;
  }

  let apiUrl = `https://app.activecollab.com/${getWorkspaceId()}/api/v1/`;

  async function api(path) {
    const response = await fetch(apiUrl + path);
    return await response.json();
  }

  async function getActiveStopWatches() {
    const { stopwatches } = await api('stopwatches');
    return stopwatches;
  }

  async function getActiveTrack() {
    const stopwatches = await getActiveStopWatches();
    return stopwatches.find(element => element.started_on !== null);
  }

  async function getTask(track) {
    if (!track) return false;
    const { single } = await api(`projects/${track.project_id}/tasks/${track.parent_id}`);
    return {
      task: single,
      track: track
    };
  }

  function isOverrun(task, track) {
    const elapsed = ((track.elapsed + Math.round(Date.now() / 1000) - track.started_on) / 60 / 60).toFixed(2);
    const estimate = task.estimate;
    return elapsed > estimate;
  }

  function sendNotification(task) {
    const notification = new Notification('Estimate Overrun', {
      body: task.name,
      dir: 'auto',
      icon: '//assets.activecollab.com/feather/6.2.174/assets/system/images/layout/favicon/android-icon-192x192.png'
    });
    const audio = new Audio('https://dexin.dev/sms-alert-3-daniel_simon.mp3');
    audio.play();
  }

  function remind(data) {
    const { task, track } = data;
    if (!track) return false;
    if (isOverrun(task, track)) sendNotification(task);
  }

  function runCycle() {
    Notification.requestPermission(function (permission) {
      if (permission == 'granted') {
        getActiveTrack()
          .then(getTask)
          .then(remind);
      }
    });
  }

  setInterval(runCycle, 10000);

})();
