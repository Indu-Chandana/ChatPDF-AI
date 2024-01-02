import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters --  É, á, ñ, ç, ü, etc

  // Use a regular expression to match non-ASCII characters and replace them with an empty string
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, '');

  return asciiString
}