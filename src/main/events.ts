import { store } from '../preferences/renderer';
import { spawn } from "child_process";
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from "fs";
import * as path from 'path';
import { v5 as uuid } from "uuid";
import { Globals } from '../Globals';
import { MainGlobals } from '../Globals/mainGlobals';
import { getLauncherDir, getLauncherExe } from '../InstallManager/processors/launcher/file';
import { getInstanceDestination } from '../InstallManager/processors/modpack/file';
import { LauncherProfiles, Profile } from '../interfaces/launcher';
import { Logger } from '../interfaces/logger';
import { Modpack } from '../interfaces/modpack';
import { cleanupCorrupted, getInstalled } from '../preload/instance';
const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

const genUUID = (str: string) => uuid(str, MY_NAMESPACE)
const logger = Logger.get("Events")

export function setupEvents() {

    ipcMain.on("get_installed", e => {
        e.returnValue = getInstalled();
    })

    ipcMain.on("uninstall_prompt", e => {
        const window = BrowserWindow.getFocusedWindow()

        const index = dialog.showMessageBoxSync(window, {
            message: "Are you sure you want to uninstall this modpack? This will delete all files, settings, options and controls",
            buttons: ["Yes", "No"],
            type: "warning"
        })

        e.returnValue = index === 0;
    })

    ipcMain.on("launch_mc", async (e, id, { name, ...config }: Modpack) => {

        const launcherDir = getLauncherDir();
        const gameDir = getInstanceDestination(id)
        const lastVersion = Globals.getLastVersion({ name, ...config })

        const profilesPath = path.join(launcherDir, "launcher_profiles.json");

        const profiles: LauncherProfiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"))
        const setUUID = genUUID(id);

        const mem = store.get("memory")
        const memOption = `-Xmx${mem ?? "2G"}`

        const defaultOptions = `${memOption} -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M`
        logger.debug("Launching with options", defaultOptions)

        const profile: Profile = {
            created: new Date().toISOString(),
            gameDir: gameDir,
            javaArgs: defaultOptions,
            icon: "Furnace",
            lastUsed: new Date().toISOString(),
            lastVersionId: lastVersion.forge_version,
            name,
            type: "custom"
        }

        profiles.profiles[setUUID] = profile;

        logger.debug("Trying to launch mc in dir", gameDir, "with version", lastVersion, "and launcher dir", launcherDir)
        logger.silly("Launcher profiles", profiles)

        fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2))
        spawn(getLauncherExe(), ["--workDir", launcherDir])
        e.reply("launched_mc_success")
    })

    ipcMain.on("clean_corrupted", e => {
        cleanupCorrupted()
        e.returnValue = true
    })

    ipcMain.on("open_folder", async e => {
        const installDir = MainGlobals.getInstallDir();

        logger.debug("Opening install dir", installDir)
        await shell.openPath(installDir)

        e.reply("open_folder_success")
    })
}