import { SerialPort } from 'serialport';

export class RobotControl {
    private x: number;
    private y: number;
    private z: number;
    private t: number;
    private serialPort: SerialPort;

    constructor(portName: string) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.t = 0;
        this.serialPort = new SerialPort({ path: portName, baudRate: 9600 });
    }

    async getStatus(): Promise<void> {
        const statusCommand = JSON.stringify({ T: 105 });
        return new Promise((resolve, reject) => {
            this.serialPort.write(statusCommand, (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.serialPort.once('data', (data) => {
                        console.log('Status:', data.toString());
                        resolve();
                    });
                }
            });
        });
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

    getPosition(): { x: number; y: number; z: number; t: number } {
        return { x: this.x, y: this.y, z: this.z, t: this.t };
    }
}
