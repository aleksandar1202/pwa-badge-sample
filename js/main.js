let deferredPrompt;
let modalOpen = false;
const modal = document.getElementById('modal');
const buttonOk = document.getElementById('ok');
const buttonCancel = document.getElementById('cancel');

window.addEventListener('focus', function() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log("app installed");
    getMessgaes();
  } else {
    console.log("app is not installed");
  }
});

window.addEventListener('load', function() {
  getMessgaes();
  await Notification.requestPermission();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}

function getMessgaes() {
  $.ajax({
    url: 'https://www.48v.me/~badgetest/cgi-bin/get_pwa_messages.py',
    method: 'get',
    success: (response) => {
      setBadge(0);

      viewMessage(response.data);
    },
    error: (e) => {
      console.log("Get messages error", e);
    }
  })
}

function viewMessage(data) {
  if (data.length != 0) {
    localStorage.setItem('pwa-message', data);
  } else {
    data = localStorage.getItem('pwa-message')
  }

  let str = "";

  for (const item of data) {
    if (item.flag == "1") {
      str += "<p><b>" + item.message + "</b></p>";
    } else {
      str += "<p>" + item.message + "</p>";
    }
  }
  
  if (str == "") str = "No message";
  
  const messageArea = document.getElementById("message");
  messageArea.innerHTML=str;
  messageArea.scrollTop = messageArea.scrollHeight;
}

function sendMessage() {
  $.ajax({
    url: 'https://www.48v.me/~badgetest/cgi-bin/add_pwa_message.py',
    method: 'post',
    data: { message: "This is a sample message" },
    success: (response) => {},
    error: (e) => {
      console.log("Add message error", e)
    }
  })
}

setInterval(sendMessage, 60000);

// Function App Badge
function setBadge(badgeCount) {
  if (navigator.setAppBadge) {
    navigator.setAppBadge(badgeCount);
  } else if (navigator.setExperimentalAppBadge) {
    navigator.setExperimentalAppBadge(badgeCount);
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.set(badgeCount);
  } else {
    console.log("App badge is unsupported.");
  }
}

function showInstallWindow() {
  if (modalOpen) return;
  modal.style.display = 'block';
  modalOpen = true;  
}

function hideInstallWindow() {
  modal.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  setTimeout(showInstallWindow, 3000);
});

buttonOk.addEventListener('click', async () => {  
  hideInstallWindow();
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

buttonCancel.addEventListener('click', async () => {
  hideInstallWindow();
});

window.addEventListener('click', function(event) {
  if (event.target == modal) {
    hideInstallWindow();
  }
});

window.addEventListener('appinstalled', () => {
  console.log("app already install");
  deferredPrompt = null;
});