const webpackModules = window.dtapi.webpackModules;
const patch = window.dtapi.patch;

export const unpatch = async function () {
  unPatchNotifications();
}

export const init = async function () {
  // Get the Discord notification module
  const notificationModule = webpackModules.findByProps("showNotification");

  // Modify the showNotification function in the module
  // unPatchNotifications() will remove this modification
  window.dtapi.patches.unPatchNotifications = patch(notificationModule, "showNotification", (args) => {
    // If Tauri doesn't have the permission to show notifications, request it
    window.__TAURI__.notification.requestPermission();

    // TODO: The icon doesn't work
    // Show a new Tauri notification with:
    // - args[0]: Icon
    // - args[1]: Title
    // - args[2]: Body
    window.Notification(args[1], {
      icon: args[0],
      body: args[2]
    });
  });

  console.log("[DISCORD-TAURI] ImplementNotifications loaded.");
}
