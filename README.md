# HydroFlow - Your Personal Hydration Reminder

![HydroFlow Screenshot](https://i.ibb.co/nqCJcvZ8/Rage2bait.png)

HydroFlow is a simple, elegant, and customizable hydration reminder application built with React. It's designed to help you stay hydrated throughout the day, improving focus, energy levels, and overall health. It can be installed as a Progressive Web App (PWA) for a native app-like experience on your desktop, **directly from your browser!**

## Features

*   **Customizable Reminder Interval:** Set your preferred hydration interval in minutes (1-120).
*   **Desktop PWA Functionality:** Can be installed for a native-like experience with features like auto-startup.  **Installation is easiest directly from your browser!**
*   **Notification Sounds:** Choose from a selection of notification sounds to alert you when it's time to drink.
*   **Mute Option:** Easily mute notifications when needed.
*   **Progress Visualization:** A circular progress bar visually displays the time remaining until your next hydration break.
*   **Statistics Tracking:** Tracks the number of glasses and total milliliters of water you've consumed.
*   **Dark Mode:** Enjoy a comfortable user experience with a visually appealing dark mode.
*   **Background Mode:** Minimize to the taskbar to keep the timer running.
*   **Install Banner:** Prompts the user to install the app as a PWA for offline access and enhanced functionality.
*   **Auto-Startup Guide:** Provides instructions on how to set HydroFlow to start automatically when your computer boots up.
*   **Snooze Option:** Snooze the reminder for 5 minutes when you're not ready to drink.
*   **Clean and Minimalist UI:** Designed for ease of use and a distraction-free experience.
*   **Taskbar Badge Notifications:** (If supported) shows the current number of glasses consumed on the taskbar icon.

## Installation

You can install HydroFlow in a few ways:

1.  **Install from your Browser (Recommended):**
    *   Visit the application in your browser (e.g., `http://localhost:3000` if running locally, or your deployed URL).
    *   Look for an **Install** button or icon in your browser's address bar (often three dots/menu icon).  Click it to install HydroFlow as a Progressive Web App (PWA). This offers a native-app like experience.  The browser will handle the installation process.
    *   Alternatively, you can click on the install button inside the settings panel of the application.

2.  **Alternative Installation (for development):**
    1.  **Clone the repository:**
        ```bash
        git clone <your-repository-url>
        cd hydroflow
        ```

    2.  **Install dependencies:**
        ```bash
        npm install  # or yarn install
        ```

    3.  **Start the development server:**
        ```bash
        npm start  # or yarn start
        ```

    4.  **Access the application in your browser:** Open your browser and navigate to the URL where the development server is running (usually `http://localhost:3000`).

## Usage

1.  **Set Reminder Interval:** Adjust the "Reminder Interval" slider in the settings to your desired frequency.
2.  **Choose Notification Sound:** Select your preferred notification sound from the options in the settings.
3.  **Start the Timer:** Click the play button to start the hydration reminder.
4.  **Drink Water:** When the reminder triggers, drink a glass of water.
5.  **Record Your Drink:** Click the "I drank water" button to reset the timer and record your progress. (You can also choose to snooze the reminder for 5 minutes if needed.)
6.  **Minimize (Don't Close):** To keep the timer running in the background, minimize the application instead of closing it.

## Configuration

*   **`DEFAULT_INTERVAL` (minutes):** Located at the top of `src/App.tsx`, this constant defines the initial default reminder interval (currently 40 minutes).
*   **`SOUND_OPTIONS`:** This array in `src/App.tsx` defines the available notification sound options. You can add or modify sound options by providing a unique `id`, a human-readable `name`, and the `url` to the sound file (MP3). Make sure that if you are hosting your own sounds, you are serving them with the correct MIME type.
*   **`HYDRATION_IMAGES`:** This array in `src/App.tsx` defines the available images that appear on the hydration reminder prompt. You can add or modify images by providing the `url` to the image.
*   **Styling:** The application is styled using Tailwind CSS. You can customize the appearance by modifying the Tailwind configuration (`tailwind.config.js`) or by adding custom CSS classes in `src/App.tsx`.

## Building for Production

```bash
npm run build # or yarn build
```

This will create an optimized production build in the `build` directory. You can then deploy the contents of the `build` directory to a web server.

## Contributing

Contributions are welcome! Please feel free to submit pull requests with improvements, bug fixes, or new features.

## License

[Apache-2.0](LICENSE)

## Acknowledgements

*   [React](https://reactjs.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Lucide React](https://lucide.dev/)
*   [Motion](https://www.motionone.dev/)
*   Sounds from [Mixkit](https://mixkit.co/) and custom created.

## Future Enhancements

*   **Custom Volume Control:** Give users more control over the notification volume.
*   **Customizable Glass Size:** Allow users to set their preferred glass size (in ml).
*   **Data Persistence:** Store user settings (interval, sound choice, stats) in local storage.
*   **Advanced Scheduling:** Implement more flexible scheduling options (e.g., pause during certain hours, specific days of the week).
*   **Integration with other platforms:** Support for integrations with fitness trackers or smartwatches.

## Support

If you have any questions or encounter any issues, please open an issue on the GitHub repository.
