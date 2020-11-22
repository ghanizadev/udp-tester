import udp from "dgram";
import net from "net";

export default {
    async isFree (port = 80, host = "localhost") : Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!net.isIPv4(host) && host !== "localhost") {
                return reject("invalid host.");
            }

            if(port < 0 || port > 65535){
                return reject(`port ${port} is out of range [0, 65535].`);
            }

            const server = udp.createSocket("udp4");

            server.on("error", () => {
                reject(`port ${port} is busy.`);
            });

            server.on("listening", () => {
                server.close();
                server.unref();
            });

            server.on("close", () => {
                return resolve(true);
            })

            server.bind(port, host);
        })
    }
}
