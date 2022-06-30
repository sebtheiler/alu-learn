// Taken from https://github.com/microsoft/TypeScript/issues/21732#issuecomment-663994772

/**
 * Checks if an object has a property; TS compliant
 * @param target Object to check if has property
 * @param property Property to check if the object has
 * @returns Whether or not the object has the property
 */
export default function has<P extends PropertyKey>(target: object, property: P): target is { [K in P]: unknown } {
	// The `in` operator throws a `TypeError` for non-object values.
	return property in target;
}