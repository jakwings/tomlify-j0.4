// Type definitions for tomlify-j0.4 2.1
// Project: https://github.com/jakwings/tomlify-j0.4

/*~ Note that ES6 modules cannot directly export callable functions.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

export = tomlify;

declare function tomlify(value: any, replacer?: Replacer, space?: string | number): string;

declare namespace tomlify {
    function toToml(value: any, replacer?: Replacer, space?: string | number): string;

    function toValue(value: any, replacer?: Replacer, space?: string | number): string;

    function toKey(path: string | Array<string | number>, alternative?: boolean): string;
}

type Replacer = (this: Context, key: string | number, value: any) => any;

interface Context {
    /**
     * The key path to current value
     */
    path: Array<string | number>;

    /**
     * The direct parent object
     */
    table: any;
}
