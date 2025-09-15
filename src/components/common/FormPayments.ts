import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Form } from "./Form";

export class FormPayments extends Form<{payment: string, address: string}> {
    protected _addressInput: HTMLInputElement;
    protected _paymentButtons: NodeListOf<HTMLButtonElement>;
    protected _submitButton: HTMLButtonElement;
    protected _selectedPayment = '';

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this.events = events;
        
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this._paymentButtons = this.container.querySelectorAll('button[name="card"], button[name="cash"]');
        this._submitButton = this.container.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        this._addressInput.addEventListener('input', () => {
            this.onInputChange('address', this._addressInput.value);
        });
        
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectPayment(button.name);
                this.onInputChange('payment', button.name);
            });
        });
    }

    selectPayment(method: string): void {
        this._paymentButtons.forEach(btn => {
            btn.classList.remove('button_alt-active');
        });
        
        const selectedButton = this.container.querySelector(`button[name="${method}"]`);
        if (selectedButton) {
            selectedButton.classList.add('button_alt-active');
            this._selectedPayment = method;
            this.onInputChange('payment', method);
        }
    }

    
    setSubmitButtonState(isValid: boolean): void {
        if (this._submitButton) {
            this._submitButton.disabled = !isValid;
        }
    }

    isActive(): boolean {
        return this.container.isConnected && this.container.offsetParent !== null;
    }

    setValues(payment: string, address: string): void {
        if (payment) {
            this.selectPayment(payment);
        }
        this._addressInput.value = address;
        this.onInputChange('address', address);
    }

    clear(): void {
        this.container.reset();
        this._paymentButtons.forEach(btn => {
            btn.classList.remove('button_alt-active');
        });
        this._selectedPayment = '';
    }
}