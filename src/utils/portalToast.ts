import { message } from "antd";

let toastCounter = 0;

function nextToastKey(action: string) {
  toastCounter += 1;

  return `${action}-${toastCounter}`;
}

export function showRequestToast(action: string, loadingMessage: string) {
  const key = nextToastKey(action);

  message.loading({
    content: loadingMessage,
    duration: 0,
    key,
  });

  return {
    error(content: string) {
      message.error({
        content,
        duration: 4,
        key,
      });
    },
    success(content: string) {
      message.success({
        content,
        duration: 3,
        key,
      });
    },
  };
}
