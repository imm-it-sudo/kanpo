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

## How to Deploy to GitHub Pages (for Testing & Sharing)

GitHub Pages allows you to host your web app for free, directly from your repository. This is a great way to test it live and share it with others.

### Step 1: Configure Your Project

Before you deploy for the first time, you need to tell the project your specific GitHub information.

1.  **Open `vite.config.ts`**: Change the `base` property from `'/your-repository-name/'` to match your repository's name. For example, if your repository URL is `github.com/my-user/ocr-app`, you would change it to `base: '/ocr-app/'`.
2.  **(Optional) Open `package.json`**: Change the `homepage` URL to your live GitHub Pages URL (e.g., `"https://my-user.github.io/ocr-app"`).

### Step 2: Deploy the Application

Open your terminal in the project folder and run the following command:

```bash
npm run deploy
```

This command will first build your application into a `dist` folder, and then it will push that folder's contents to a special branch in your repository called `gh-pages`.

### Step 3: Configure GitHub Repository Settings

1.  Go to your repository page on GitHub.
2.  Click on the **"Settings"** tab.
3.  In the left sidebar, click on **"Pages"**.
4.  Under the "Build and deployment" section, for the **Source**, select **"Deploy from a branch"**.
5.  In the branch dropdown that appears, select the **`gh-pages`** branch and leave the folder as `/ (root)`. Click **"Save"**.

GitHub will now publish your site. It might take a minute or two. Once it's ready, the page will refresh and show you the public URL for your live web app. You can now use this URL to test your app and share it with anyone