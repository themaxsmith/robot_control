import { SerialPort } from 'serialport';

interface RobotStatus {
    T: number;
    x: number;
    y: number;
    z: number;
    b: number;
    s: number;
    e: number;
    t: number;
    torB: number;
    torS: number;
    torE: number;
    torH: number;
}

export class RobotControl {
    private x: number;
    private y: number;
    private z: number;
    private t: number;
    private b: number;
    private s: number;
    private e: number;
    private torB: number;
    private torS: number;
    private torE: number;
    private torH: number;
    private serialPort: SerialPort;

    constructor(portName: string) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.t = 0;
        this.b = 0;
        this.s = 0;
        this.e = 0;
        this.torB = 0;
        this.torS = 0;
        this.torE = 0;
        this.torH = 0;
        this.serialPort = new SerialPort({ path: portName, baudRate: 9600 });
    }

    async getStatus(): Promise<RobotStatus> {
        const statusCommand = JSON.stringify({ T: 105 });
        return new Promise((resolve, reject) => {
            this.serialPort.write(statusCommand, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.serialPort.once('data', (data) => {
                        try {
                            const status: RobotStatus = JSON.parse(data.toString());
                            this.updateStatus(status);
                            console.log('Status:', status);
                            resolve(status);
                        } catch (parseError) {
                            reject(parseError);
                        }
                    });
                }
            });
        });
    }

    private updateStatus(status: RobotStatus): void {
        this.x = status.x;
        this.y = status.y;
        this.z = status.z;
        this.t = status.t;
        this.b = status.b;
        this.s = status.s;
        this.e = status.e;
        this.torB = status.torB;
        this.torS = status.torS;
        this.torE = status.torE;
        this.torH = status.torH;
    }

    async sendCommand(x: number, y: number, z: number, t: number, spd: number): Promise<void> {
        this.x = x;
        this.y = y;
        this.z = z;
        this.t = t;
        const command = JSON.stringify({ T: 104, x, y, z, t, spd });
        return new Promise((resolve, reject) => {
            this.serialPort.write(command, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    getPosition(): { x: number; y: number; z: number; t: number; b: number; s: number; e: number } {
        return { x: this.x, y: this.y, z: this.z, t: this.t, b: this.b, s: this.s, e: this.e };
    }

    getTorqueValues(): { torB: number; torS: number; torE: number; torH: number } {
        return { torB: this.torB, torS: this.torS, torE: this.torE, torH: this.torH };
    }

    async moveRelative(dx: number, dy: number, dz: number, spd: number): Promise<void> {
        const newX = this.x + dx;
        const newY = this.y + dy;
        const newZ = this.z + dz;
        await this.sendCommand(newX, newY, newZ, this.t, spd);
    }

    async openClamp(): Promise<void> {
        const command = JSON.stringify({ T: 106, V: 1 });
        return new Promise((resolve, reject) => {
            this.serialPort.write(command, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async closeClamp(): Promise<void> {
        const command = JSON.stringify({ T: 106, V: 0 });
        return new Promise((resolve, reject) => {
            this.serialPort.write(command, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
