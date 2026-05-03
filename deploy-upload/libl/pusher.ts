import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: "2137291",
  key: "ba707a9085e391ba151b",
  secret: "cf52ff92044e670f8ec0",
  cluster: "eu",
  useTLS: true,
});