import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Form } from "./Form";

export class FormContacts extends Form<{email: string, phone: string}> {
    protected _phoneInput: HTMLInputElement;
    protected _emailInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this.events = events;
        
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        
        this._phoneInput.addEventListener('input', () => {
            this.onInputChange('phone', this._phoneInput.value);
        });
        
        this._emailInput.addEventListener('input', () => {
            this.onInputChange('email', this._emailInput.value);
        });

        
    }

    setValues(email: string, phone: string): void {
        this._emailInput.value = email;
        this._phoneInput.value = phone;
        this.onInputChange('email', email);
        this.onInputChange('phone', phone);
    }

    clear(): void {
        this.container.reset();
    }
}