import { spawn } from "child_process";
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from "fs";
import * as path from 'path';
import { v5 as uuid } from "uuid";
import { MainGlobals } from '../../Globals/mainGlobals';
import { LauncherProfiles, Profile } from '../../interfaces/launcher';
import { MainLogger } from '../../interfaces/mainLogger';
import { ModpackInfo } from '../../interfaces/modpack';
import { InstallManager } from '../InstallManager';
import { getInstanceVersion } from '../InstallManager/processors/interface';
import { getLauncherDir, getLauncherExe } from '../InstallManager/processors/launcher/file';
import { getInstanceDestination } from '../InstallManager/processors/modpack/file';
import { store } from '../preferences';
import { moveDirectory } from './folder';
console.log("events Import uuid")
const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

const genUUID = (str: string) => uuid(str, MY_NAMESPACE)
const logger = MainLogger.get("Events")

export function setupEvents() {
    ipcMain.on("confirm_prompt", (e, str) => {
        const window = BrowserWindow.getFocusedWindow()

        const index = dialog.showMessageBoxSync(window, {
            message: str,
            buttons: ["Yes", "No"],
            type: "warning"
        })

        e.returnValue = index === 0;
    })

    ipcMain.on("launch_mc", async (event, id, { name }: ModpackInfo) => {
        try {
            const isValid = await InstallManager.validate(id)
            if (!isValid)
                throw new Error(`Modpack installation of ${id} is invalid. Please reinstall.`)

            const launcherDir = getLauncherDir();
            const gameDir = getInstanceDestination(id)
            const version = getInstanceVersion(id)


            const profilesPath = path.join(launcherDir, "launcher_profiles.json");
            const doesExist = fs.existsSync(profilesPath)

            const profiles: LauncherProfiles = doesExist ?
                JSON.parse(fs.readFileSync(profilesPath, "utf-8"))
                : defaultProfileFile
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
                lastVersionId: version.forge_version,
                name,
                type: "custom"
            }

            profiles.profiles[setUUID] = profile;

            logger.debug("Trying to launch mc in dir", gameDir, "with version", version, "and launcher dir", launcherDir)
            logger.silly("Launcher profiles", profiles)

            fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2))
            spawn(getLauncherExe(), ["--workDir", launcherDir])
            event.reply("launched_mc_success")
        } catch (e) {
            event.reply("launched_mc_error", e?.stack ?? e)
        }
    })

    ipcMain.on("open_folder", async e => {
        const installDir = MainGlobals.getInstallDir();

        logger.debug("Opening install dir", installDir)
        await shell.openPath(installDir)

        e.reply("open_folder_success")
    })

    ipcMain.on("folder_move", async (e, id: string, src: string, dest: string) => {
        moveDirectory({
            src,
            dest,
            onUpdate: progress => e.reply("folder_move_update", id, progress)
        })
            .then(() => e.reply("folder_move_success", id))
            .catch(e => e.reply("folder_move_error", id, e))
    })
}

const defaultProfileFile = {
    profiles: {
    },
    settings: {
        crashAssistance: true,
        enableAdvanced: false,
        enableAnalytics: false,
        enableHistorical: false,
        enableReleases: true,
        enableSnapshots: false,
        keepLauncherOpen: false,
        profileSorting: "ByLastPlayed",
        showGameLog: false,
        showMenu: false,
        soundOn: false
    },
    version: 3
}