import * as readline from "readline";
import { RobotControl } from "./robotControl";

async function main() {
  const robot = new RobotControl("/dev/serial0"); // Adjust the port name as needed
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Robot Control:");
  console.log("w/s: move forward/backward");
  console.log("a/d: move left/right");
  console.log("q/z: move up/down");
  console.log("e/r: open/close clamp");
  console.log("f: open clamp relative");
  console.log("g: goto (x,y,z)");
  console.log("u: get status");
  console.log("x: exit");

  try {
    await robot.getStatus();
    console.log("Initial position:", robot.getPosition());

    robot.on("status", (status) => {
      console.log("Updated status:", status);
    });

    rl.on("line", async (input) => {
      const key = input.toLowerCase();
      const moveDistance = 2; // Adjust this value as needed
      const moveSpeed = 0.25; // Adjust this value as needed

      try {
        switch (key) {
          case "w":
            await robot.moveRelative({ dy: moveDistance, spd: moveSpeed });
            break;
          case "s":
            await robot.moveRelative({ dy: -moveDistance, spd: moveSpeed });
            break;
          case "a":
            await robot.moveRelative({ dx: -moveDistance, spd: moveSpeed });
            break;
          case "d":
            await robot.moveRelative({ dx: moveDistance, spd: moveSpeed });
            break;
          case "q":
            await robot.moveRelative({ dz: moveDistance, spd: moveSpeed });
            break;
          case "z":
            await robot.moveRelative({ dz: -moveDistance, spd: moveSpeed });
            break;
          case "e":
            await robot.openClamp();
            console.log("Clamp opened");
            break;
          case "r":
            await robot.closeClamp();
            console.log("Clamp closed");
            break;
          case "f":
            rl.question("Enter relative clamp opening amount (-1 to 1): ", async (answer) => {
              const amount = parseFloat(answer);
              if (!isNaN(amount) && amount >= -1 && amount <= 1) {
                await robot.openClampRelative(amount);
                console.log(`Clamp opened relatively by ${amount}`);
              } else {
                console.log("Invalid amount. Please enter a number between -1 and 1.");
              }
            });
            break;
          case "g":
            rl.question("Enter x y z (space-separated): ", async (answer) => {
              const [x, y, z] = answer.split(" ").map(Number);
              if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                await robot.goto(x, y, z, moveSpeed);
                console.log(`Moving to (${x}, ${y}, ${z})`);
              } else {
                console.log("Invalid coordinates");
              }
            });
            break;
          case "u":
            try {
              const status = await robot.getStatus();
              console.log("Current status:", status);
            } catch (error) {
              console.error("Error getting status:", error);
            }
            break;
          case "x":
            rl.close();
            return;
          default:
            console.log("Invalid input");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });

    rl.on("close", () => {
      console.log("Exiting robot control");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error:", error);
    rl.close();
  }
}

main();
