export const OPEN = 'open';
export const REOPEN = 'reopen'; // cannot be set, but useful to track open + updatedAt !== createdAt
export const DONE = 'done';
export const CLOSED = 'closed';

export default [
  OPEN,
  DONE,
  CLOSED,
];