import udp, { RemoteInfo, Socket } from "dgram";

let server : Socket;

const listeners : ((msg: Buffer, info: RemoteInfo) => void)[] = [];
const messages: { msg: Buffer; info: RemoteInfo }[] = [];

const createServer = (port: number, address: string) => {
  if(server) server.close();

  server = udp.createSocket("udp4");

  server.on("message", (msg, info) => {
    messages.push({ msg, info });
    listeners.forEach(listener => listener(msg, info))
  });

  server.bind(port, address);
};

createServer(2223, "localhost");

export default {
  bind(port: number, address: string): void {
    createServer(port, address);
  },
  send(msg: string, address: string, port: number): void {
    server.send(Buffer.from(msg), port, address);
    return;
  },
  getMessages(): { msg: Buffer; info: RemoteInfo }[] {
    return messages;
  },
  addEventListener(callback: (msg: Buffer, info: RemoteInfo) => void): void {
    listeners.push(callback);
  },
};