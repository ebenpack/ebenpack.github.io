/**
 * Compose functions a and b
 * @param  {Function} a Outer function
 * @param  {Function} b Inner function
 * @return {Function}   Composed function
 */
export default (
    a: (input: any) => any,
    b: (input: any) => any
): ((c: any) => any) => c => a(b(c));
