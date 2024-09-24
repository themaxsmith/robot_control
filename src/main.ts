import { RobotControl } from './robotControl';

async function main() {
    const robot = new RobotControl('/dev/ttyUSB0'); // Adjust the port name as needed

    try {
        const initialStatus = await robot.getStatus();
        console.log('Initial status:', initialStatus);
        console.log('Initial position:', robot.getPosition());
        console.log('Initial torque values:', robot.getTorqueValues());

        // Move relative to current position
        await robot.moveRelative(10, 20, 30, 0.25);
        console.log('New position after relative move:', robot.getPosition());

        // Open the clamp
        await robot.openClamp();
        console.log('Clamp opened');

        // Move to a specific position
        await robot.sendCommand(235, 0, 234, 1, 0.25);
        console.log('New position after absolute move:', robot.getPosition());

        // Close the clamp
        await robot.closeClamp();
        console.log('Clamp closed');

        const newStatus = await robot.getStatus();
        console.log('Final status:', newStatus);
        console.log('Final position:', robot.getPosition());
        console.log('Final torque values:', robot.getTorqueValues());
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
