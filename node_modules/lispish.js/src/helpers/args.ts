/**
 * Given an array-like, returns a real array.
 * @param  {Array-like} args
 * @return {Arrau}
 */
export default (args: any[]): any[] => Array.prototype.slice.call(args);
