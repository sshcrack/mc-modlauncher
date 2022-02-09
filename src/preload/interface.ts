import { Progress } from '../backend/InstallManager/event/interface';

export type onUpdate = (progress: Progress) => unknown;
export type onSuccess = () => unknown;
export type onError = (err: string | Error) => unknown;

export interface ModpackOrganizer {
    [key: string]: {
        type: ModpackTypes,
        currently: Progress,
        listeners: {
            update: onUpdate[]
            success: onSuccess[]
            error: onError[]
        }
    }
}

export interface Listeners {
    update: onUpdate
}

export enum ModpackTypes {
    INSTALLING,
    REMOVING
}