export declare const SECOND = 1000;
export declare const MINUTE: number;
export declare const HOUR: number;
export declare function sleep(ms: number): Promise<unknown>;
export declare function untilEquals(value: any, fun: () => boolean, timeout?: number): Promise<boolean>;
export declare function untilTrue(fun: () => boolean, timeout?: number): Promise<boolean>;
export declare function untilNotNull(fun: () => any, timeout?: number): Promise<boolean>;
