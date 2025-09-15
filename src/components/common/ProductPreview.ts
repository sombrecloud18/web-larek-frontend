import { Component } from "../base/components";
import { IProduct } from "../../types";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { AppEvents } from "../../types";
import { CDN_URL } from "../../utils/constants";

export class ProductPreview extends Component<IProduct> {
    protected _category: HTMLElement;
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;
    protected _id: string;
    protected events: IEvents;

    constructor(template: HTMLTemplateElement, events: IEvents) {
    const container = template.content.cloneNode(true) as DocumentFragment;
    super(container.firstElementChild as HTMLElement); 
    
    this.events = events;
    this._category = ensureElement<HTMLElement>('.card__category', this.container);
    this._title = ensureElement<HTMLElement>('.card__title', this.container);
    this._image = ensureElement<HTMLImageElement>('.card__image', this.container);
    this._price = ensureElement<HTMLElement>('.card__price', this.container);
}

    render(data: IProduct): HTMLElement {
        this._id = data.id;
        
        this.setText(this._title, data.title);
        this.setText(this._price, `${data.price} синапсов`);
        this.setText(this._category, data.category);
        this.setImage(this._image, CDN_URL + data.image, data.title);

        this._category.className = 'card__category';
        this._category.classList.add(`card__category_${this.getCategoryClass(data.category)}`);
        
        this.container.addEventListener('click', () => {
            this.events.emit(AppEvents.PRODUCT_OPEN, data);
        });

        const hasPrice = data.price !== null && data.price !== undefined && data.price > 0;
        if (!hasPrice) {
            this._price.textContent = 'Бесценно';
        }

        return this.container;
    }

    private getCategoryClass(category: string): string {
        const categoryMap: Record<string, string> = {
            'софт-скил': 'soft',
            'другое': 'other',
            'дополнительное': 'additional',
            'кнопка': 'button',
            'хард-скил': 'hard'
        };
        return categoryMap[category] || 'other';
    }

    get id(): string {
        return this._id;
    }

    
    set id(value: string) {
        this._id = value;
    }
}