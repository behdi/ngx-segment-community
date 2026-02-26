import { Injectable } from '@angular/core';

/** A service that hashes values. */
@Injectable({
  providedIn: 'root',
})
export class Hasher {
  /**
   * Dummy hash function.
   *
   * It goes without saying that in a real world, you'd use a real, cryptographically safe
   * hash function.
   *
   * @param value - the value to hash.
   */
  hash(value: string | undefined | null): string {
    if (!value) return '';

    return `[HASHED]_${btoa(value)}`;
  }
}
