# Testing Guide

This document provides instructions on how to set up and run the tests for the Prompt Obfuscator application.

## Prerequisites

Before you can run the tests, you need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your system.

## Setup

1.  **Rename the Babel Configuration File**:

    The testing environment requires a Babel configuration file. The project includes a template file named `babel.config.js.remove`. You need to rename it to `babel.config.js`.

    You can do this from your terminal:

    ```bash
    mv babel.config.js.remove babel.config.js
    ```

2.  **Install Dependencies**:

    If you haven't already, you need to install the project's dependencies, including the ones required for testing.

    ```bash
    npm install
    ```

    This will install all dependencies listed in `package.json`, including Jest and other testing libraries.

## Running Tests

Once you have completed the setup steps, you can run the tests using the following command:

```bash
npm test
```

This command will execute Jest, which will find and run all the test files in the project (files ending with `.test.tsx` or `.spec.ts`).

## Testing Frameworks and Libraries

This project uses the following tools for testing:

*   **[Jest](https://jestjs.io/)**: A delightful JavaScript Testing Framework with a focus on simplicity.
*   **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**: A library for testing React components in a way that resembles how users interact with them.
*   **[Babel](https://babeljs.io/)**: A JavaScript compiler that allows us to use the latest JavaScript features and JSX in our tests.

If you encounter any issues, please ensure that you have correctly followed all the steps in the setup section. 