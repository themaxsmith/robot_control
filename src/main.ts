import { RobotControl } from './robotControl';

async function main() {
    const robot = new RobotControl('/dev/ttyUSB0'); // Adjust the port name as needed

    try {
        await robot.getStatus();
        console.log('Initial position:', robot.getPosition());

        await robot.sendCommand(235, 0, 234, 3.14, 0.25);
        console.log('New position:', robot.getPosition());

        await robot.getStatus();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
