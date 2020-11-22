import udp, { RemoteInfo, Socket } from "dgram";
import findPort from "portfinder";
import checkPort from "../helpers/checkPort";

let server: Socket;
let client: Socket;

const sentMessages: { message: Buffer; address: string; port: number }[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listeners: [string, (...args: any[]) => void][] = [];
const messages: { msg: Buffer; info: RemoteInfo }[] = [];

const invoke = (event: string, ...args: any[]) => {
  listeners.forEach((listener) => {
    const [e, callback] = listener;
    if (event === e) callback(...args);
  });
};

const sendMessage = async (message: string, port: number, address: string) =>
  new Promise((resolve, reject) => {    
    if (!message)
      return invoke(
        "alert",
        "error",
        "it is not possible to send empty packages"
      );

    client = udp.createSocket("udp4");

    client.on("listening", () => {
      client.send(Buffer.from(message), port, address, (error, bytes) => {
          if(error) invoke("alert", "error", error.message);

          sentMessages.push({
            message: Buffer.from(message),
            address,
            port,
          });
    
          client.close();
          client.unref();
          client = null;
    
          invoke("sent-message", message, address, port);
          return resolve();
      });
    });

    findPort.getPort((err, port) => {
      if (err) {
        return reject(err);
      }
      client.bind(port, "localhost");
    });
  });

const createServer = async (
  port: number,
  address: string
): Promise<boolean> => {
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
    sendMessage(msg, port, address);
  },
  getMessages(): { msg: Buffer; info: RemoteInfo }[] {
    return messages;
  },
  addEventListener(
    event: string,
    callback: (...args: any[]) => void
  ): void {
    listeners.push([event, callback]);
  },
};
