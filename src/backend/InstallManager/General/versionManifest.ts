export interface VersionManifest {
    arguments: Arguments;
    assetIndex: AssetIndex;
    assets: string;
    complianceLevel: number;
    downloads: VersionManifestDownloads;
    id: string;
    javaVersion: JavaVersion;
    libraries: Library[];
    logging: Logging;
    mainClass: string;
    minimumLauncherVersion: number;
    releaseTime: string;
    time: string;
    type: string;
}

export interface Arguments {
    game: Array<GameClass | string>;
    jvm: Array<JVMClass | string>;
}

export interface GameClass {
    rules: GameRule[];
    value: string[] | string;
}

export interface GameRule {
    action: Action;
    features: Features;
}

export enum Action {
    Allow = "allow",
    Disallow = "disallow",
}

export interface Features {
    is_demo_user?: boolean;
    has_custom_resolution?: boolean;
}

export interface JVMClass {
    rules: JVMRule[];
    value: string[] | string;
}

export interface JVMRule {
    action: Action;
    os: PurpleOS;
}

export interface PurpleOS {
    name?: string;
    version?: string;
    arch?: string;
}

export interface AssetIndex {
    id: string;
    sha1: string;
    size: number;
    totalSize?: number;
    url: string;
}

export interface VersionManifestDownloads {
    client: ClientMappingsClass;
    client_mappings: ClientMappingsClass;
    server: ClientMappingsClass;
    server_mappings: ClientMappingsClass;
}

export interface ClientMappingsClass {
    sha1: string;
    size: number;
    url: string;
    path?: string;
}

export interface JavaVersion {
    component: string;
    majorVersion: number;
}

export interface Library {
    downloads: LibraryDownloads;
    name: string;
    rules?: LibraryRule[];
    natives?: Natives;
    extract?: Extract;
}

export interface LibraryDownloads {
    artifact: ClientMappingsClass;
    classifiers?: Classifiers;
}

export interface Classifiers {
    javadoc?: ClientMappingsClass;
    "natives-linux"?: ClientMappingsClass;
    "natives-macos"?: ClientMappingsClass;
    "natives-windows"?: ClientMappingsClass;
    sources?: ClientMappingsClass;
    "natives-osx"?: ClientMappingsClass;
}

export interface Extract {
    exclude: string[];
}

export interface Natives {
    osx?: string;
    linux?: string;
    windows?: string;
}

export interface LibraryRule {
    action: Action;
    os?: FluffyOS;
}

export interface FluffyOS {
    name: Name;
}

export enum Name {
    Osx = "osx",
}

export interface Logging {
    client: LoggingClient;
}

export interface LoggingClient {
    argument: string;
    file: AssetIndex;
    type: string;
}
