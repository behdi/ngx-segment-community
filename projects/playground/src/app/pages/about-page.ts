import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { SegmentService } from 'ngx-segment-community';
import type { SupportedCurrency } from '../services';
import { StoreState } from '../services';

interface Currency {
  label: string;
  value: SupportedCurrency;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
}

const AVAILABLE_CURRENCIES: Currency[] = [
  { label: 'USD', value: 'USD' },
  {
    label: 'EUR',
    value: 'EUR',
  },
  { label: 'GBP', value: 'GBP' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: crypto.randomUUID(),
    title: 'Mechanical keyboard',
    description: 'An amazing mechanical keyboard with a perfect "thock" sound!',
    price: 150,
  },
  {
    id: crypto.randomUUID(),
    title: 'Coffee',
    description: 'A refreshing cup of mud!',
    price: 5,
  },
  {
    id: crypto.randomUUID(),
    title: 'Rush Album',
    description:
      'A good old classic Rush album to accompany you on those restless nights.',
    price: 65,
  },
];

/** Component responsible for rendering the about page. */
@Component({
  selector: 'app-about-page',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatInput,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatError,
  ],
  template: `
    <div class="container">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Select your preferred currency: </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-button-toggle-group
            [ngModel]="currentCurrency()"
            (ngModelChange)="changeCurrency($event)"
            name="currency"
            aria-label="Preferred currency"
          >
            @for (currency of currencies; track currency.value) {
              <mat-button-toggle [value]="currency.value">{{
                currency.label
              }}</mat-button-toggle>
            }
          </mat-button-toggle-group>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Products </mat-card-title>
        </mat-card-header>

        <mat-card-content class="product-grid">
          @for (product of products; track product.id) {
            <mat-card appearance="outlined">
              <mat-card-header>
                <mat-card-title> {{ product.title }} </mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <p>
                  {{ product.description }}
                </p>
                <p>Price: {{ product.price }}</p>
              </mat-card-content>

              <mat-card-actions>
                <button matButton (click)="onAddToCart(product)">
                  Add to cart
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title> Checkout </mat-card-title>
        </mat-card-header>

        <form [formGroup]="form" (ngSubmit)="onCheckout()">
          <mat-card-content class="form-inputs">
            <mat-form-field appearance="outline">
              <mat-label>First name</mat-label>

              <input
                matInput
                type="text"
                id="first-name"
                name="first-name"
                autocomplete="given-name"
                formControlName="firstName"
              />

              <mat-error>First name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last name</mat-label>

              <input
                matInput
                type="text"
                id="last-name"
                name="last-name"
                autocomplete="family-name"
                formControlName="lastName"
              />

              <mat-error>Last name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>E-Mail</mat-label>

              <input
                matInput
                type="email"
                id="email"
                name="email"
                autocomplete="email"
                formControlName="email"
              />

              <mat-error>Please enter a valid email</mat-error>
            </mat-form-field>
          </mat-card-content>

          <mat-card-actions>
            <button type="submit" matButton>Checkout</button>
          </mat-card-actions>
        </form>
      </mat-card>
    </div>
  `,
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  private readonly _fb = inject(NonNullableFormBuilder);
  private readonly _segment = inject(SegmentService);
  private readonly _store = inject(StoreState);

  protected readonly currencies: Currency[] = AVAILABLE_CURRENCIES;
  protected readonly products: Product[] = MOCK_PRODUCTS;
  protected readonly currentCurrency = this._store.selectedCurrency;

  protected readonly form = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  protected changeCurrency(selectedCurrency: SupportedCurrency): void {
    this._store.setSelectedCurrency(selectedCurrency);
  }

  protected onAddToCart(product: Product): void {
    void this._segment.track('Product Added', {
      product_id: product.id,
      name: product.title,
      price: product.price,
    });
  }

  protected onCheckout(): void {
    if (this.form.invalid) return;
    const { firstName, lastName, email } = this.form.value;

    void this._segment.track('Product purchased', {
      first_name: firstName,
      last_name: lastName,
      email,
      cart_total: 220, // dummy data just for testing stuff
    });
  }
}
