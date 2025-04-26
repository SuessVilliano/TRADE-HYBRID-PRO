// This is a polyfill for the 'buffer' module that's causing issues in the browser
// We're creating a minimal implementation that works for our needs

// Create a function that returns a proper Uint8Array
export function bufferFrom(data: string | Array<number> | Uint8Array, encoding?: string): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return new Uint8Array(data);
  }
  
  // If it's a string, convert to UTF-8 encoded byte array
  const encoder = new TextEncoder();
  return encoder.encode(data);
}

// For compatibility with code that might use Buffer directly
export const Buffer = {
  from: bufferFrom
};