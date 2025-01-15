# Racetrack Info-Screens

## Project Overview
The **Racetrack Info-Screens** project is designed to manage races and provide real-time information to employees, race drivers, and spectators at Beachside Racetrack. The system automates race control and ensures that all necessary information is available exactly when needed. The application utilizes **Node.js** and **Socket.IO** to power real-time functionalities, with interfaces tailored for specific user roles.

---

## Features
### Key Functionalities
- **Real-time race updates**: All displays and interfaces update in real-time using Socket.IO.
- **Configurable races**: Receptionists can add, edit, and delete race sessions and drivers.
- **Lap tracking**: Lap times and fastest laps are updated dynamically.
- **Race mode controls**: Safety Officials can control race modes with immediate effect on displays.
- **Access control**: Interfaces are protected with role-specific access keys.
- **Mobile and tablet compatibility**: Interfaces are designed for specific devices, such as tablets for Lap-Line Observers.
- **Public displays**: Large displays for spectators showing leaderboards, race statuses, and driver assignments.

### Interfaces and Routes
| Interface        | Persona           | Route               |
| ---------------- | ----------------- | ------------------- |
| Front Desk       | Receptionist      | `/front-desk`       |
| Race Control     | Safety Official   | `/race-control`     |
| Lap-line Tracker | Lap-line Observer | `/lap-line-tracker` |
| Leader Board     | Guest             | `/leader-board`     |
| Next Race        | Race Driver       | `/next-race`        |
| Race Countdown   | Race Driver       | `/race-countdown`   |
| Race Flag        | Race Driver       | `/race-flags`       |

---

## Installation and Setup

### Prerequisites
1. **Node.js** and **npm** installed.
2. Environment variables for interface access keys:
    - `receptionist_key`
    - `observer_key`
    - `safety_key`

### Steps to Start the Server
Required node versin v20.3.1
    ```bash
    npm install -g node@v20.3.1
    ```
    
Required npm versin 9.6.7
    ```bash
    $ npm install -g npm@9.6.7
    ```

1. Clone the repository:
   ```bash
   git clone https://gitea.kood.tech/kaidokurm/racetrack.git
   cd racetrack
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set the required environment variables:
   ```bash
   export receptionist_key=your_receptionist_key
   export observer_key=your_observer_key
   export safety_key=your_safety_key
   ```
4. Start the server in production mode:
   ```bash
   npm start
   ```
5. For development mode (1-minute race sessions):
   ```bash
   npm run dev
   ```

---

## User Guide

### Receptionist Interface (`/front-desk`)
- **Configure Races**:
    - Add a new race session.
    - Add, edit, or remove drivers for upcoming sessions.
    - Assign drivers to cars manually (extra feature).
    - Delete sessions.

### Safety Official Interface (`/race-control`)
- **Start Races**:
    - Begin a race session.
    - Change race modes using four buttons: Safe, Hazard, Danger, and Finish.
    - End the race session when all cars return to the pit lane.
- **Race Controls**:
    - Controls disappear after a race is finished, replaced by an option to end the session.

### Lap-Line Tracker (`/lap-line-tracker`)
- **Lap Recording**:
    - Use large buttons to record laps for each car.
    - Buttons are disabled when the race ends.
    - Designed for tablet usage in landscape or portrait mode.

### Leader Board (`/leader-board`)
- Displays:
    - Fastest lap times.
    - Current laps for each car.
    - Timer showing remaining race time.
    - Flag color for the current race mode.

### Next Race Display (`/next-race`)
- **Driver Information**:
    - Shows driver names and assigned cars for the next race.
    - Updates to the subsequent race when the current race starts.

### Race Flag Display (`/race-flags`)
- **Safety Flags**:
    - Displays the current race mode as flags (e.g., Green, Yellow, Red, or Chequered).

---

## Security
- Each interface requires an **access key** to function.
- Environment variables must be set before starting the server.
- Incorrect keys prompt an error message and a 500ms delay before retry.

---

## Developer Notes
- **Real-time communication**: Powered by Socket.IO, all updates happen instantly without polling.
- **Environment variable validation**: The server will not start if access keys are missing.
- **Development mode**: Runs shorter (1-minute) race sessions for testing.

---

## Future Enhancements
1. **Data Persistence**: Save state to resume races after server restarts.
2. **Enhanced Driver Assignment**: Allow Receptionists to assign drivers to specific cars.
3. **Custom Features**: Additional features can be toggled using feature flags.

---

## Useful Resources
- [Socket.IO Documentation](https://socket.io/)
- [Node.js Documentation](https://nodejs.org/)

---

Enjoy managing your races with **Racetrack Info-Screens**!'''