import { ClimateScienceService } from "./climate-science.service";

/**
 * Interface that controls how list data are to be fetched.
 */
export interface ListConfig {
    /** The REST API. */
    api : ClimateScienceService;
    /** API error handler. */
    onError : (err : any) => void;
    /** The filter string. */
    filter : string;
    /** The sort specification, format: 'COLUMN {ASC|DESC}'. */
    sort : string;
    /** The start index. */
    start : number;
    /** The number of items to retrieve. */
    count : number;
}