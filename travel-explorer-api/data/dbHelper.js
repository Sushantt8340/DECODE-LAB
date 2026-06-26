const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (filename) => path.join(DATA_DIR, filename);

/**
 * Reads a JSON file from disk. Creates it with default value if missing.
 */
const readData = (filename, defaultVal = []) => {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
        writeData(filename, defaultVal);
        return defaultVal;
    }
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error(`Error reading ${filename}:`, e);
        return defaultVal;
    }
};

/**
 * Writes data to a JSON file.
 */
const writeData = (filename, data) => {
    const filePath = getFilePath(filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filename}:`, e);
        return false;
    }
};

module.exports = {
    readData,
    writeData
};
