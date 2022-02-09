export interface ModpackInfo {
    name: string,
    mcVersion: string,
    description: string,
    author: string,
    versions: Version[],
    cover: string
}

export interface Version {
    id: string,
    file: string,
    forge: string,
    forge_version: string
}