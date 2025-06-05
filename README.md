# ChatFPTU

A multi-platform project for FPT University, including data processing utilities, Android app, and educational resources.

## Project Structure

```
.
├── app.py                  # Main Python application
├── Dockerfile              # Docker configuration
├── requirements.txt        # Python dependencies
├── paper.tex               # LaTeX paper
├── android/ChatFPTU/       # Expo React Native mobile app
├── data/                   # Data files (images, markdown, etc.)
├── dify/                   # Dify configuration files
└── utils/                  # Data processing notebooks
```

## Getting Started

### Python Utilities

1. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
2. Run the main app:
    ```sh
    python app.py
    ```

### Android App

1. Install dependencies:
    ```sh
    cd android/ChatFPTU
    npm install
    ```
2. Start the Expo app:
    ```sh
    npx expo start
    ```

## Data

- `data/` contains crawled data, images, markdown, and processed files for FPTU resources.

## Utilities

- Jupyter notebooks for data processing are in `utils/`.

## License

MIT License (add your license here)