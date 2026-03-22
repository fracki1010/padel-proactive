const { addToast, ToastProvider } = require("@heroui/react");
console.log("addToast from react:", typeof addToast);
console.log("ToastProvider from react:", typeof ToastProvider);

const toast = require("@heroui/toast");
console.log("addToast from toast:", typeof toast.addToast);
console.log("ToastProvider from toast:", typeof toast.ToastProvider);
