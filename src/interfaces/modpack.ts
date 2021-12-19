export interface Modpack {
    name: string,
    description: string,
    author: string,
    versions: Version[],
    cover: string
}

export interface Version {
    id: string,
    file: string
}