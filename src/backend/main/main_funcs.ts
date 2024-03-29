import { app, autoUpdater, dialog } from 'electron'
import unhandled from "electron-unhandled"
import { debugInfo, openNewGitHubIssue, setContentSecurityPolicy } from 'electron-util'
import path from "path"
import { MainLogger } from '../../interfaces/mainLogger'
import { InstallManager } from '../InstallManager'
import { getInstalled } from '../InstallManager/events'
import { launchMCAsync } from './events'

const logger = MainLogger.get("Main", "Updater")

export function addUpdater() {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('update-electron-app')({
        repo: 'sshcrack/mc-modlauncher',
        updateInterval: '10 minutes',
        logger: logger
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    autoUpdater.on('error', message => {
        logger.error("Could not check auto-updater:", message)
    })
}

export function registerUri() {
    logger.info("Registering URI sshmods://")

    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient('sshmods', process.execPath, [path.resolve(process.argv[1])])
        }
    } else {
        app.setAsDefaultProtocolClient('sshmods')
    }
}

export function registerURIOpenEvent() {
    app.on("open-url", (event, url) => {
        logger.log(event)
        logger.log("Open url horraaaay", url)
    })
}

export async function handleURIOpen(uri: string) {
    logger.log("Handling uri", uri)
    if(!uri || !uri.startsWith("sshmods://"))
        return

    const [ mode, id ] = uri.replace("sshmods://", "").split("/");
    const config = await InstallManager.getConfig(id).catch(() => undefined);
    if(!config)
        return

    const installed = await getInstalled();
    switch (mode) {
        case "play":
            if(!installed.includes(id))
                return dialog.showErrorBox("Could not launch modpack", `Modpack ${id} is not installed`)

            await launchMCAsync(id, config)
                .catch(e => {
                    logger.error(e)
                    dialog.showErrorBox("Could not launch modpack", `Modpack ${id} could not be launched. More information in console`)
                })
            break;

        default:
            break;
    }
}

export function addCrashHandler() {
    unhandled({
        showDialog: true,
        logger: (...e) => logger.error(...e),
        reportButton: error => {
            const err = error.stack
            if (err.includes("Version") && err.includes("Java"))
                openNewGitHubIssue({
                    user: "sshcrack",
                    repo: "mc-modlauncher",
                    body: `#Automated Bug Report \n ### This is a bug reported automatically by the crash handler\`\`\`\n${error.stack}\n\`\`\`\n\n---\n\n${debugInfo()}`
                })
        }
    })
}

export function setContentSecurity() {
    setContentSecurityPolicy(`
	default-src 'self' data: 'unsafe-inline' 'unsafe-eval' https://mc.sshcrack.me;
    connect-src https://mc.sshcrack.me 'self' http://localhost:3000;
`);
}