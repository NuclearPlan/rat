import { BSON, ObjectId } from "bson";
import { TLSSocket } from "tls";

import { ClientUpdateType } from "../../../shared/src/messages/client";
import ClientMessage from "../../../shared/src/messages/client";
import Message from "../../../shared/src/messages/index";
import PingMessage from "../../../shared/src/messages/ping";
import { ClientProperties, Monitor } from "../../../shared/src/system";
import ControlSocketServer from "../controlSocketServer";
import { handle } from "./packets";

class Client implements ClientProperties {

    public flag: string;
    public country: string;
    public ping: number;
    public username: string;
    public hostname: string;
    public monitors: Monitor[];

    private readonly _id = new ObjectId();
    private pingTime: number;

    constructor(private readonly socket: TLSSocket) {
        this.loop();
    }

    public get id() {
        return this._id.toHexString();
    }

    public get host() {
        return this.socket.remoteAddress;
    }

    public sendPing() {
        this.send(new PingMessage());
        this.pingTime = new Date().getTime();
    }

    public pong() {
        ControlSocketServer.broadcast(new ClientMessage({
            type: ClientUpdateType.UPDATE,
            id: this.id,
            ping: new Date().getTime() - this.pingTime
        }), true);
    }

    public send(m: Message) {
        const header = new Buffer(2);
        header.writeInt16LE(m._type, 0);
        this.socket.write(header);

        const data = new BSON().serialize(m.data);

        const len = new Buffer(4);
        len.writeInt32LE(data.length, 0);
        this.socket.write(len);

        this.socket.write(data);
    }

    /**
     * Read n bytes from the socket and resolve when complete
     * @param n
     */
    private async read(n: number) {
        return new Promise<Buffer>((resolve, reject) => {
            const buffer = this.socket.read(n);
            if (buffer === null) {
                this.socket.once("readable", () => this.read(n).then(resolve).catch(reject));
                return;
            }

            resolve(buffer);
        });
    }

    private async loop() {
        while (true) {
            let buffer = await this.read(2);
            const header = buffer.readInt16LE(0);

            buffer = await this.read(4);
            const size = buffer.readInt32LE(0);

            buffer = await this.read(size);
            const data = new BSON().deserialize(buffer);

            handle(this, {
                _type: header,
                ...data
            });
        }
    }
}

export default Client;
