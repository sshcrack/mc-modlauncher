
declare module "create-desktop-shortcuts" {
    function createShortcut(options: {
        onlyCurrentOS?: boolean,
        verbose?: boolean,
        customLogger?: (message?: string, error?: string) => void,
        windows: {
            filePath: string,
            outputPath?: string,
            name?: string,
            comment?: string,
            icon?: string,
            arguments?: string,
            windowMode?: string,
            hotkey?: stirng
        },
        linux: {
            filePath: string,
            outputPath?: string,
            name?:string,
            description?: string,
            icon?: string,
            type?: string,
            terminal?: string
            chmod?: string
            arguments?: string
        },
        osx: {
            filePath?: string,
            outputPath?: string,
            name?: string,
            overwrite?: string
        }
    })
    export = createShortcut
}