export interface LauncherMeta {
    latest:   Latest;
    versions: Version[];
}

export interface Latest {
    release:  string;
    snapshot: string;
}

export interface Version {
    id:          string;
    type:        Type;
    url:         string;
    time:        string;
    releaseTime: string;
}

export enum Type {
    OldAlpha = "old_alpha",
    OldBeta = "old_beta",
    Release = "release",
    Snapshot = "snapshot",
}
