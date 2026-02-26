import { inject } from '@angular/core';
import type { SegmentSourceMiddlewareFn } from 'ngx-segment-community';
import { Hasher } from '../services';

/**
 * A simple source middleware that checks for PII and hashes them
 * with a mock hash function.
 */
export const PIIHasherMiddleware: SegmentSourceMiddlewareFn = () => {
  const hasher = inject(Hasher);

  return ({ payload, next }) => {
    if (!payload.obj.properties) {
      next(payload);
      return;
    }

    // eslint-disable-next-line prefer-destructuring
    const email: unknown = payload.obj.properties['email'];
    const firstName: unknown = payload.obj.properties['first_name'];
    const lastName: unknown = payload.obj.properties['last_name'];

    if (typeof email === 'string') {
      payload.obj.properties['email'] = hasher.hash(email);
    }

    if (typeof firstName === 'string') {
      payload.obj.properties['first_name'] = hasher.hash(firstName);
    }

    if (typeof lastName === 'string') {
      payload.obj.properties['last_name'] = hasher.hash(lastName);
    }

    next(payload);
  };
};
