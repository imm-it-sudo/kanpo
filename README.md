# Gemini OCR Data Extractor

An application to upload an image, use Gemini API for OCR based on a custom prompt to extract structured data, and save the results locally. Users can download the collected data as a CSV file.

## How to Run Locally

This project is a web application that runs entirely in your browser. To run it on your own computer (as a "local web server"), you'll need to follow these steps.

### Prerequisites

You must have [Node.js](https://nodejs.org/) (version 18 or higher) installed on your computer. This will also install `npm`, which is used to manage the project's dependencies.

### Step 1: Get the Code

First, you need to download the code. You can either:
- **Download a ZIP file:** On the GitHub page for this project, click the green "Code" button and select "Download ZIP". Unzip the file to a folder on your computer.
- **Clone with Git:** If you have Git installed, run the following command in your terminal:
  ```bash
  git clone [URL_OF_THE_GITHUB_REPOSITORY]
  cd [NAME_OF_THE_REPOSITORY]
  ```

### Step 2: Install Dependencies

Once you have the code, open a terminal or command prompt, navigate into the project's folder, and run this command:

```bash
npm install
```

This will download all the necessary libraries (like React) that the project needs to run.

### Step 3: Run the Development Server

To start the application, run the following command:

```bash
npm run dev
```

This command starts a local web server. Your terminal will show a message with a local URL, usually `http://localhost:5173`. Open this URL in your web browser to use the application.

The app will automatically reload if you make any changes to the code.

---

### (Optional) Building for Production Hosting

If you want to create a static version of the site that can be hosted on any web server (like your Synology NAS Web Station), you can "build" the project.

1.  Run the build command:
    ```bash
    npm run build
    ```
2.  This will create a new folder called `dist` in your project directory.
3.  You can then take all the files inside the `dist` folder and upload them to your web server's root directory. The main file your server should serve is `index.html` from within that folder.

This is the best way to host the application for others to use from a single, central server.