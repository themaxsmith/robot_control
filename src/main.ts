import { RobotControl } from './robotControl';

async function main() {
    const robot = new RobotControl('/dev/ttyUSB0'); // Adjust the port name as needed

    try {
        const initialStatus = await robot.getStatus();
        console.log('Initial status:', initialStatus);
        console.log('Initial position:', robot.getPosition());
        console.log('Initial torque values:', robot.getTorqueValues());

        await robot.sendCommand(235, 0, 234, 3.14, 0.25);
        console.log('New position after command:', robot.getPosition());

        const newStatus = await robot.getStatus();
        console.log('New status:', newStatus);
        console.log('New position:', robot.getPosition());
        console.log('New torque values:', robot.getTorqueValues());
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
