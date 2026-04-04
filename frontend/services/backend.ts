import Constants from "expo-constants";
import { Platform } from "react-native";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

const REQUEST_TIMEOUT_MS = 10000;

const defaultApiBaseUrl = Platform.select({
  android: "http://10.0.2.2:4000/api",
  ios: "http://localhost:4000/api",
  web: "http://localhost:4000/api",
  default: "http://localhost:4000/api",
});

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const expoHostUri =
  Constants.expoConfig?.hostUri ||
  Constants.platform?.hostUri ||
  null;
const expoHostName = expoHostUri ? expoHostUri.split(":")[0] : null;
const androidRuntimeApiBaseUrl =
  Platform.OS === "android" && expoHostName
    ? `http://${expoHostName}:4000/api`
    : null;
const webHostname =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.location.hostname || "localhost"
    : null;
const webRuntimeApiBaseUrl =
  Platform.OS === "web" && webHostname
    ? `http://${webHostname === "localhost" ? "localhost" : webHostname}:4000/api`
    : null;

export const apiBaseUrl = (
  (Platform.OS === "android" ? androidRuntimeApiBaseUrl : null) ||
  (Platform.OS === "web" ? webRuntimeApiBaseUrl : configuredApiBaseUrl) ||
  configuredApiBaseUrl ||
  defaultApiBaseUrl ||
  "http://localhost:4000/api"
).replace(/\/$/, "");

console.info(
  `[api] Using base URL: ${apiBaseUrl} (expoHostUri=${expoHostUri || "n/a"})`,
);

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const requestUrl = `${apiBaseUrl}${path}`;

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out. Check that the backend is reachable at ${apiBaseUrl}.`);
    }

    throw new Error(`Network request failed. Check that the backend is reachable at ${apiBaseUrl}.`);
  }

  clearTimeout(timeoutId);

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok) {
    throw new Error(
      responseBody?.message || `Request failed with status ${response.status}.`,
    );
  }

  return responseBody as T;
}
