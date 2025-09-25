"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWorkerPath = resolveWorkerPath;
exports.createWorker = createWorker;
exports.createWorkerWithCleanup = createWorkerWithCleanup;
exports.verifyWorkersBuilt = verifyWorkersBuilt;
exports.getAvailableWorkers = getAvailableWorkers;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_worker_threads_1 = require("node:worker_threads");
/**
 * Resolves the path to a compiled worker file
 * This ensures we always point to a stable filesystem path, not .next paths
 */
function resolveWorkerPath(workerName) {
    // const isDev = process.env.NODE_ENV !== 'production'; // Not currently used
    // In both dev and prod, use the compiled worker from dist-workers
    const workerPath = node_path_1.default.join(process.cwd(), 'dist-workers', `${workerName}.js`);
    // Verify the worker file exists
    if (!node_fs_1.default.existsSync(workerPath)) {
        throw new Error(`Worker file not found: ${workerPath}. Make sure to run 'npm run build:workers' first.`);
    }
    return workerPath;
}
/**
 * Creates a worker with proper path resolution
 * This prevents the MODULE_NOT_FOUND error from .next paths
 */
function createWorker(workerName, workerData) {
    const workerPath = resolveWorkerPath(workerName);
    console.log(`Creating worker from: ${workerPath}`);
    return new node_worker_threads_1.Worker(workerPath, {
        workerData,
        // Add any additional worker options here
    });
}
/**
 * Creates a worker with error handling and cleanup
 */
function createWorkerWithCleanup(workerName, workerData, onMessage, onError) {
    const worker = createWorker(workerName, workerData);
    if (onMessage) {
        worker.on('message', onMessage);
    }
    if (onError) {
        worker.on('error', onError);
    }
    // Handle worker exit
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker ${workerName} stopped with exit code ${code}`);
        }
    });
    return worker;
}
/**
 * Utility to check if workers are properly built
 */
function verifyWorkersBuilt() {
    const distWorkersDir = node_path_1.default.join(process.cwd(), 'dist-workers');
    if (!node_fs_1.default.existsSync(distWorkersDir)) {
        console.error('dist-workers directory not found. Run "npm run build:workers" first.');
        return false;
    }
    return true;
}
/**
 * Get list of available compiled workers
 */
function getAvailableWorkers() {
    const distWorkersDir = node_path_1.default.join(process.cwd(), 'dist-workers');
    if (!node_fs_1.default.existsSync(distWorkersDir)) {
        return [];
    }
    return node_fs_1.default.readdirSync(distWorkersDir)
        .filter(file => file.endsWith('.js'))
        .map(file => file.replace('.js', ''));
}
//# sourceMappingURL=worker-utils.js.map