import { redirect } from 'next/navigation';
import { DEFAULT_FILE_SIZE_LIMIT } from './constants';

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: 'error' | 'success',
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

const FILE_SIZE_LIMIT = Number(
  process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || DEFAULT_FILE_SIZE_LIMIT,
);

export function checkFileSize(file: File): void {
  if (file.size > FILE_SIZE_LIMIT) {
    throw new Error(
      `File ${file.name} exceeds the size limit of ${Math.floor(
        FILE_SIZE_LIMIT / 1000000,
      )} MB.`,
    );
  }
}
