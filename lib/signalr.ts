import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";
import { env } from "./env";

const BASE_URL = env.API_URL?.replace("/api", "");

export const createSignalRConnection = (token: string) => {
  return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/log`, {
      accessTokenFactory: () => token,
      transport: HttpTransportType.LongPolling,
      skipNegotiation: false,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
    .configureLogging(LogLevel.Information)
    .build();
};
