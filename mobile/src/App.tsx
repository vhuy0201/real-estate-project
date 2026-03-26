import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./store";
import RootNavigator from "./navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}