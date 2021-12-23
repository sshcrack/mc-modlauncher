import { app, autoUpdater, dialog } from 'electron'
import { Logger } from '../interfaces/logger'

const logger = Logger.get("Main", "Updater")

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

export function addReloader() {
    if(app.isPackaged)
        return


    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('electron-reloader')(module)
    } catch (_) { /**/ }
}