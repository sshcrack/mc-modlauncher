export interface ModpackInfo {
    name: string,
    mcVersion: string,
    description: string,
    author: string,
    versions: Version[],
    cover: string,
    updateRequired: boolean | undefined
}

export interface Version {
    mcVersion?: string,
    id: string,
    file: string,
    forge: string,
    forge_version: string,
    required_installer_version?: string
}