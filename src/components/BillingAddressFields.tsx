import type { ClientBillingAddress } from "../services/portalApi";

type BillingAddressFieldsProps = {
  idPrefix: string;
  onChange: (field: keyof ClientBillingAddress, value: string) => void;
  values: ClientBillingAddress;
};

function BillingAddressFields({ idPrefix, onChange, values }: BillingAddressFieldsProps) {
  return (
    <fieldset className="billing-address-fields">
      <legend>Billing address</legend>
      <p className="billing-address-fields__hint">
        Used as the "Bill To" on this client's quotes and invoices. Separate from project or site addresses.
      </p>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${idPrefix}BillingAddress`}>Street address</label>
          <input
            autoComplete="street-address"
            id={`${idPrefix}BillingAddress`}
            onChange={(event) => onChange("billingAddress", event.target.value)}
            placeholder="123 Main St, Suite 100"
            type="text"
            value={values.billingAddress}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${idPrefix}BillingCity`}>City</label>
          <input
            autoComplete="address-level2"
            id={`${idPrefix}BillingCity`}
            onChange={(event) => onChange("billingCity", event.target.value)}
            placeholder="Louisville"
            type="text"
            value={values.billingCity}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${idPrefix}BillingState`}>State / province</label>
          <input
            autoComplete="address-level1"
            id={`${idPrefix}BillingState`}
            onChange={(event) => onChange("billingState", event.target.value)}
            placeholder="KY"
            type="text"
            value={values.billingState}
          />
        </div>
        <div className="form-group">
          <label htmlFor={`${idPrefix}BillingZip`}>ZIP / postal code</label>
          <input
            autoComplete="postal-code"
            id={`${idPrefix}BillingZip`}
            onChange={(event) => onChange("billingZip", event.target.value)}
            placeholder="40202"
            type="text"
            value={values.billingZip}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${idPrefix}BillingCountry`}>Country</label>
          <input
            autoComplete="country-name"
            id={`${idPrefix}BillingCountry`}
            onChange={(event) => onChange("billingCountry", event.target.value)}
            placeholder="United States"
            type="text"
            value={values.billingCountry}
          />
        </div>
      </div>
    </fieldset>
  );
}

export default BillingAddressFields;
