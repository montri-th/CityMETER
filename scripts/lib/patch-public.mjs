/** Literal patch guards for the immutable public hydration baseline. */
export function replaceOnce(source, needle, replacement) {
  if (source.split(needle).length !== 2)
    throw new Error(`Expected one patch boundary: ${needle}`);
  return source.replace(needle, () => replacement);
}
