import { Injectable, signal } from '@angular/core';

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP';

/** The service responsible for holding the state of our super real store. */
@Injectable({
  providedIn: 'root',
})
export class StoreState {
  private readonly _selectedCurrency = signal<SupportedCurrency>('USD');

  readonly selectedCurrency = this._selectedCurrency.asReadonly();

  /**
   * Sets the given currency as the currently selected one.
   *
   * @param currency - currency that should be selected.
   */
  setSelectedCurrency(currency: SupportedCurrency) {
    this._selectedCurrency.set(currency);
  }
}
