import { contextBridge } from 'electron';
import log from "electron-log";
import { cache } from './cache';
import { system } from './system';
import { folder } from './folder';
import { launcher } from './launcher';
import { lock } from './lock';
import { modpack } from './modpack';
import { preferences } from './preferences';

log.transports.file.maxSize = 1024 * 1024 * 20
window.log = log;

export const API = {
    modpack,
    preferences,
    system,
    cache,
    folder,
    launcher,
    lock
}

contextBridge.exposeInMainWorld(
    "api",
    API
)

contextBridge.exposeInMainWorld(
    "log",
    log
)
