import { Alert, AlertButton, AlertOptions } from "react-native";

export type AlertPayload = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
};

let alertListener: ((payload: AlertPayload) => void) | null = null;
let isInstalled = false;

export function setAlertListener(listener: ((payload: AlertPayload) => void) | null) {
  alertListener = listener;
}

export function installAlertOverride() {
  if (isInstalled) return;
  isInstalled = true;

  const original = Alert.alert.bind(Alert);

  Alert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) => {
    if (!alertListener) {
      return original(title, message, buttons, options);
    }
    alertListener({ title, message, buttons, options });
  };
}

