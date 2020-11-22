import udp, { RemoteInfo, Socket } from "dgram";
import findPort from "portfinder";
import checkPort from "./helpers/checkPort";

let server: Socket;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listeners: [string, (...args: any[]) => void][] = [];
const messages: { msg: Buffer; info: RemoteInfo }[] = [];

const invoke = (event: string, ...args: any[]) => {
  listeners.forEach((listener) => {
    const [e, callback] = listener;
    if (event === e) callback(...args);
  });
};

const createServer = async (port: number, address: string) : Promise<boolean> => {
  return new Promise((resolve, reject) => {
    checkPort
    .isFree(port, address)
    .then(() => {
      
      if (server) {
        server.close();
        server.unref();
        server = null;
      }

      server = udp.createSocket("udp4");

      server.on("message", (msg, info) => {
        messages.push({ msg, info });
        invoke("message", msg, info);
      });

      server.bind(port, address, () => {
        invoke("alert", "success", `server started at ${address}:${port}`);
        resolve(true);
      });
    })
    .catch((e) => {
      invoke("alert", "warning", e);
      reject(e);
    });

  });
};

findPort.getPort({ startPort: 3000, stopPort: 9000 }, (err, port) => {
  if (err) return console.log(err);

  createServer(port, "localhost");
});

export default {
  async bind(port: number, address: string): Promise<boolean> {
    return createServer(port, address);
  },
  unbind(): void {
    server.close();
    server.unref();
    server = null;
  },
  send(msg: string, address: string, port: number): void {
    server.send(Buffer.from(msg), port, address);
    return;
  },
  getMessages(): { msg: Buffer; info: RemoteInfo }[] {
    return messages;
  },
  addEventListener(
    event: string,
    callback: (msg: Buffer, info: RemoteInfo) => void
  ): void {
    listeners.push([event, callback]);
  },
};
