import { encode } from '@jridgewell/sourcemap-codec';
import { SourceMapGenerator } from 'source-map';

function getBtoa () {
	if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
		return (str) => window.btoa(unescape(encodeURIComponent(str)));
	} else if (typeof Buffer === 'function') {
		return (str) => Buffer.from(str, 'utf-8').toString('base64');
	} else {
		return () => {
			throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
		};
	}
}

const btoa = /*#__PURE__*/ getBtoa();

export default class SourceMap {
	constructor(properties) {
		this.version = 3;
		this.file = properties.file;
		this.sources = properties.sources;
		this.sourcesContent = properties.sourcesContent;
		this.names = properties.names;
		const origin = encode(properties.mappings);


		const smg = new SourceMapGenerator();
		
		properties.mappings.forEach((lineMapping, generatedLine) => {
			lineMapping.forEach(
				/** @param {[number,number,number,number, number|undefined]} mapping 生成的列, _, 源行, 源列 */ 
				(mapping) => {
					const [ generatedColumn, , sourceLine, sourceColumn, namesIndex ] = mapping;
					smg.addMapping({
						original: {
							line: sourceLine + 1,
							column: sourceColumn
						},
						generated: {
							line: generatedLine + 1,
							column: generatedColumn
						},
						source: 'foo.js',
						name: namesIndex === undefined ? undefined : this.names[namesIndex]
					});
				});
		});

		this.mappings = smg.toJSON().mappings;

		const debugLog = {
			before: JSON.stringify(properties.mappings),
			origin,
			new: this.mappings
		};

		console.log(debugLog);

	}

	toString() {
		return JSON.stringify(this);
	}

	toUrl() {
		return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
	}
}
