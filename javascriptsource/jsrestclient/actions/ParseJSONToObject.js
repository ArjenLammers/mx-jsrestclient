// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
import { Big } from "big.js";

// BEGIN EXTRA CODE
// END EXTRA CODE

/**
 * Parses a JSON structure to Mendix objects (using implicit mapping, so it assumes the same structure).
 * Note: use with care when using online mode, this generates a lot of calls from client to runtime.
 * @param {string} data - JSON data
 * @param {string} expectedEntity - The entity that is assumed to be the root object of the JSON structure.
 * @returns {Promise.<MxObject>}
 */
export async function ParseJSONToObject(data, expectedEntity) {
	// BEGIN USER CODE
	let resultObj = await createMxObject(expectedEntity);
	let parsed = JSON.parse(data);
	await processJSON(parsed, resultObj);

	return resultObj;

	function createMxObject(entity) {
		return new Promise(function(resolve, reject) {
			mx.data.create({
				entity: entity,
				callback: function(mxObject) {
					resolve(mxObject);
				},
				error: function(e) {
					reject(null);
					throw "Error while creating " + entity;
				}
			});
		});
	}

	async function parseNestedObject(data, mxObject, ref) {
		console.debug("Processing reference " + ref.ref + " for " + mxObject.getEntity());

		let targetEntity = (ref.parent === mxObject.getEntity()) ? ref.child : ref.parent;
		let targetObject = await createMxObject(targetEntity);
		await processJSON(data, targetObject);

		if (mxObject.has(ref.ref)) {
			mxObject.addReference(ref.ref, targetObject.getGuid());
		}
		if (targetObject.has(ref.ref)) {
			targetObject.addReference(ref.ref, mxObject.getGuid());
		}
	}

	async function processJSON(data, mxObject) {
		for (let property in data) {
			switch (typeof data[property]) {
				case "number":
					let nr = new Big(data[property]);
					mxObject.set(property, nr.round(8));
					break;
				case "string":
				case "boolean":
					if (mxObject.has(property)) {
						if (mxObject.isDate(property)) {
							// accept both String as Number format to be datetimes
							if (typeof data[property] === "string") {
								mxObject.set(property, Date.parse(data[property]));
							} else {
								mxObject.set(property, data[property]);
							}
						} else {
							mxObject.set(property, data[property]);
						}
					} else {
						console.warn("Property " + property + " could not be found on " + mxObject.getEntity());
					}
					
					break;
				case "object":
					if (data[property] == null) continue;

					let ref = getNonFQReference(mxObject, property);

					if (ref == null) {
						console.warn("Expected reference " + property + " on " + mxObject.getEntity() + " but none found");
						continue;
					}

					if (Array.isArray(data[property])) {
						for (let i = 0; i < data[property].length; i++) {
							await parseNestedObject(data[property][i], mxObject, ref);
						}
					} else {
						if (mx.meta.getEntity(ref.parent).isObjectReference(ref.ref)) {
							await parseNestedObject(data[property], mxObject, ref)
						}
					}
					break;
			}
		}

	}

	/**
	 * Returns the reference + referring object based on the mxObject.
	 * This covers mxObject referring to another object (1-1), but also other objects referring to mxObject (1-*)
	 */
	function getNonFQReference(mxObject, reference) {
		let result = null;

		// check if a reference on the object itself can be found.
		let refs = mxObject.getReferenceAttributes();
		for (let i = 0; i < refs.length; i++) {
			let nonFQref = refs[i].substring(refs[i].indexOf('.') + 1);

			if (nonFQref === reference) {
				if (result != null) {
					throw "Found duplicate reference " + reference + " on entity " + mxObject.getEntity();
				}
				result = {
					ref: refs[i],
					parent: mxObject.getEntity(),
					child: mxObject.getSelectorEntity(refs[i])
				};
			}
		}
		if (result != null) {
			return result;
		}

		// check if there're other entities having a reference to this object.
		let entities = Object.keys(mx.meta.getMap());
		for (let i = 0; i < entities.length; i++) {
			let entity = mx.meta.getEntity(entities[i]);
			let references = entity.getReferenceAttributes();
			for (let j = 0; j < references.length; j++) {
				if (entity.getSelectorEntity(references[j]) === mxObject.getEntity()) {
					let nonFQref = references[j].substring(references[j].indexOf('.') + 1);
					if (nonFQref === reference) {
						result = {
							ref: references[j],
							parent: entity.getEntity(),
							child: mxObject.getEntity()
						};
					}
				}
			}
		}
		return result;
	}
	// END USER CODE
}
