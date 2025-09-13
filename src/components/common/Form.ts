import { IForm } from "../../types"
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils"
import { Component } from "../base/components"

export class Form<T> extends Component<IForm> {
    submit: HTMLButtonElement;
    errors: HTMLElement;
    container: HTMLFormElement;
    events: IEvents;
    
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container);
        this.submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this.errors = ensureElement<HTMLElement>('.form__errors', this.container);
        this.events = events;

        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onInputChange(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string) {
        this.events.emit(`${this.container.name}.${String(field)}:change`, {
            field,
            value
        });
    }

    protected reset() {
        this.container.reset();
    }
}