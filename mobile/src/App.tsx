import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { store } from "./store";
import RootNavigator from "./navigation/RootNavigator";
import { AppNoticeHost } from "./components/common/AppNoticeHost";
import { GlobalAlertHost } from "./components/common/GlobalAlertHost";
import { installAlertOverride } from "./utils/alertBridge";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    installAlertOverride();
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          <AppNoticeHost />
          <GlobalAlertHost />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}