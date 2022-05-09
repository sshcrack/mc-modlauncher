import { ModsSearchSortField, SortOder } from '../enums';

interface ModOptionsNoLoader {
    classId?: number,
    categoryId?: number,
    gameVersion?: string,
    searchFilter?: string,
    sortField: ModsSearchSortField,
    sortOrder: SortOder,
    modLoaderType?: string,
    slug?: string,
    index?: number,
    pageSize?: number
}

export type ModOptions = ModOptionsNoLoader & {
    modLoaderType: string,
    gameVersion: string
}