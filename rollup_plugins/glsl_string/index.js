import { createFilter } from 'rollup-pluginutils';

/**
 * A simple Rollup plugin that converts text files into exported strings, suitable
 * for import into other modules.   Designed specificaly for GLSL files.
 * 
 * @param {*} opts filter options
 */
export default function string(opts = {}) {
  if (!opts.include) {
    throw Error("include option should be specified");
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" }
        };
      }
    }
  };
}
