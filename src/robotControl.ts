import { EventEmitter } from "events";
import { SerialPort } from "serialport";

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

export class RobotControl extends EventEmitter {
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
  private dataBuffer: string;

  constructor(portName: string) {
    super();
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
    this.dataBuffer = "";
    this.serialPort = new SerialPort({ path: portName, baudRate: 115200 });
    this.startListening();
  }

  private startListening(): void {
    this.serialPort.on("data", (data: Buffer) => {
      this.dataBuffer += data.toString();
      console.log("Data buffer:", this.dataBuffer);
      let endIndex: number;
      while ((endIndex = this.dataBuffer.indexOf("}")) !== -1) {
        const jsonString = this.dataBuffer.slice(0, endIndex + 1);
        this.dataBuffer = this.dataBuffer.slice(endIndex + 1);
        try {
          const status: RobotStatus = JSON.parse(jsonString);
          this.updateStatus(status);
          this.emit("status", status);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    });
  }

  async getStatus(): Promise<RobotStatus> {
    const statusCommand = JSON.stringify({ T: 105 });
    return new Promise((resolve, reject) => {
      this.serialPort.write(statusCommand, (err) => {
        if (err) {
          reject(err);
        } else {
          const timeout = setTimeout(() => {
            reject(new Error("Status request timed out"));
          }, 5000);

          const statusHandler = (status: RobotStatus) => {
            clearTimeout(timeout);
            this.removeListener("status", statusHandler);
            resolve(status);
          };

          this.once("status", statusHandler);
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

  async sendCommand(
    x: number,
    y: number,
    z: number,
    t: number,
    spd: number
  ): Promise<void> {
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

  getPosition(): {
    x: number;
    y: number;
    z: number;
    t: number;
    b: number;
    s: number;
    e: number;
  } {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      t: this.t,
      b: this.b,
      s: this.s,
      e: this.e,
    };
  }

  getTorqueValues(): {
    torB: number;
    torS: number;
    torE: number;
    torH: number;
  } {
    return {
      torB: this.torB,
      torS: this.torS,
      torE: this.torE,
      torH: this.torH,
    };
  }

  async moveRelative(options: {
    dx?: number;
    dy?: number;
    dz?: number;
    spd: number;
  }): Promise<void> {
    const { dx = 0, dy = 0, dz = 0, spd } = options;
    const newX = this.x + dx;
    const newY = this.y + dy;
    const newZ = this.z + dz;
    await this.sendCommand(newX, newY, newZ, this.t, spd);
  }

  async openClamp(): Promise<void> {
    return this.sendCommand(this.x, this.y, this.z, 1, 0.25);
  }

  async closeClamp(): Promise<void> {
    return this.sendCommand(this.x, this.y, this.z, 0, 0.25);
  }
}
