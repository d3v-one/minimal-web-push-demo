
const applicationServerKey = "BIm2PpzmeMy3pe_VkzyP8Yq-iqG8ay0qLBGcJZNXnq5lOKu1fAyY9xQ2PK2KQjzWulmKu8IzBLmut276h4tIw5k";

var json_subscription = null;
var btn_subscribe;
var btn_unsubscribe;
var btn_push;
var info_subscription;


function update_subscription_info(json) {
	json_subscription = json;
	if (json == null) {
		info_subscription.value = "";
		btn_subscribe.disabled = false;
		btn_unsubscribe.disabled = true;
		btn_push.disabled = true;
	} else {
		info_subscription.value = "const pushSubscription = " + json;
		btn_subscribe.disabled = true;
		btn_unsubscribe.disabled = false;
		btn_push.disabled = false;
	}
}


function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


function pushMessage() 
{
	const text = document.querySelector("#push_text").value;
	const push_result = document.querySelector("#push_result");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
			console.log(this.status);
			if (this.status == 200) {
				push_result.value = this.responseText;
			} else {
				push_result.value = "HTTP Error "+this.status;
			}
    }
  };
	xhttp.open("POST", "/apps/pwa/push/push.php");
	xhttp.setRequestHeader("Content-type", "application/json");
	var obj = JSON.parse(json_subscription);
	obj.msg = document.querySelector("#push_text").value;
	var json = JSON.stringify(obj);
	console.log(json);
	push_result.value = "";
  xhttp.send(json);
}


function getPushPermission() 
{
	navigator.serviceWorker.getRegistration().then(registration => {
		registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlB64ToUint8Array(applicationServerKey)
		}).then(subscription => {
			const json = JSON.stringify(subscription.toJSON(), null, 2);
			console.log(json);
			update_subscription_info(json);
		},
		error => {
			console.log("error getting push permission", error);
			update_subscription_info(null);
		});
	});
}


function unsubscribePush() 
{
	navigator.serviceWorker.ready.then(registration => {
		registration.pushManager.getSubscription().then(subscription => {
			if (subscription === undefined || subscription == null) {
				console.log("unsubscribe: no subscription found");
			} else {
				subscription.unsubscribe().then(successful => {
					console.log("unsubscribe successful");
				}).catch(e => {
					console.log("unsubscribe error", e);
				})
			}
			update_subscription_info(null);
		});
	});
}


function checkPushPermission() 
{
	navigator.serviceWorker.ready.then(registration => {
		registration.pushManager.getSubscription().then(subscription => {
			if (subscription === undefined || subscription == null) {
				console.log("no valid subscription");
				update_subscription_info(null);
			} else {
				const json = JSON.stringify(subscription.toJSON(), null, 2);
				console.log("subscription", json);
				update_subscription_info(json);
			}
		});
	});
}


window.addEventListener("load", event => {
	btn_subscribe = document.querySelector("#btn_subscribe");
	btn_subscribe.addEventListener("click", getPushPermission);
	btn_unsubscribe = document.querySelector("#btn_unsubscribe");
	btn_unsubscribe.addEventListener("click", unsubscribePush);
	btn_push = document.querySelector("#btn_push");
	btn_push.addEventListener("click", pushMessage);
	info_subscription = document.querySelector("#info_subscription");

	if ('serviceWorker' in navigator && 'Notification' in window) {
		navigator.serviceWorker.register('sw.js').then(() => { 
			console.log("service worker registered"); 
			checkPushPermission();
		});
	}
});


