// FormContacts.ts
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Form } from "./Form";

export class FormContacts extends Form<{ email: string, phone: string }> {
    protected _phoneInput: HTMLInputElement;
    protected _emailInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;

    constructor(template: HTMLTemplateElement, events: IEvents) {
        const formElement = template.content.querySelector('form')?.cloneNode(true) as HTMLFormElement;
        if (!formElement) throw new Error('Form element not found in contacts template');
        super(formElement, events);

        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
    }

    setSubmitButtonState(isValid: boolean): void {
        this._submitButton.disabled = !isValid;
    }

    isActive(): boolean {
        return this.container.isConnected && this.container.offsetParent !== null;
    }

    setValues(email: string, phone: string): void {
        this._emailInput.value = email;
        this._phoneInput.value = phone;
    }

    clear(): void {
        this.container.reset();
    }
}