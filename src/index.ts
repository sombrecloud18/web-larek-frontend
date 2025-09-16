import { EventEmitter, IEvents } from './components/base/events';
import { LarekApi } from './components/LarekApi';
import { OrderData } from './components/OrderData';
import { ProductData } from './components/ProductData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Product } from './components/common/Product';
import './scss/styles.scss';
import { FormErrors, ILarekApi, IOrderResult, IProduct, TBasketItem, TOrderContactsInfo, TOrderPaymentInfo } from './types';
import { API_URL, settings } from './utils/constants';
import { AppEvents } from './types';
import { Basket } from './components/common/Basket';
import { FormPayments } from './components/common/FormPayments';
import { FormContacts } from './components/common/FormContacts';
import { SuccessOrder } from './components/common/SuccessOrder';
import { ProductPreview } from './components/common/ProductPreview';
import { BasketItem } from './components/common/BasketItem';

const events: IEvents = new EventEmitter();
const orderData = new OrderData(events);
const productData = new ProductData(events);

// Инициализация страницы
const pageContainer = document.querySelector('.page') as HTMLElement;
const page = new Page(pageContainer, events);

// Инициализация модального окна
const modalContainer = document.getElementById('modal-container') as HTMLElement;
const modal = new Modal(modalContainer, events);

// Инициализация корзины
const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
const basketContainer = basketTemplate.content.cloneNode(true) as DocumentFragment;
const basketElement = basketContainer.firstElementChild as HTMLElement;
const basket = new Basket(basketElement, events);
basket.setOrderButtonState(orderData.basket.length > 0);

// Инициализация форм (создаются один раз)
const paymentForm = new FormPayments(
    document.getElementById('order') as HTMLTemplateElement,
    events
);
const contactsForm = new FormContacts(
    document.getElementById('contacts') as HTMLTemplateElement, 
    events
);
const successOrder = new SuccessOrder(
    document.getElementById('success') as HTMLTemplateElement,
    events
);

// Инициализация API
const api: ILarekApi = new LarekApi(API_URL, settings);

// Рендер содержимого корзины
function renderBasketList(items: TBasketItem[]): string {
    if (items.length === 0) {
        return '<p style="color: grey">Корзина пуста</p>';
    }
    
    const template = document.getElementById('card-basket') as HTMLTemplateElement;
    if (!template) return '';
    
    let html = '';
    
    items.forEach((item, index) => {
        const basketItemElement = template.content.cloneNode(true) as DocumentFragment;
        const basketItemContainer = basketItemElement.firstElementChild as HTMLElement;
        
        const basketItem = new BasketItem(basketItemContainer);
        basketItem.render({...item, index});
        
        html += basketItemContainer.outerHTML;
    });
    
    return html;
}

// Обработчик для создания карточек продуктов
events.on(AppEvents.PRODUCTS_CHANGED, (products: IProduct[]) => {
    const cardElements = products.map(product => {
        const template = document.getElementById('card-catalog') as HTMLTemplateElement;
        if (!template) return null;
        const card = new ProductPreview(template, events);
        return card.render(product);
    }).filter(Boolean) as HTMLElement[];
    page.catalog = cardElements;
});

// Обработчик открытия детального просмотра товара
events.on(AppEvents.PRODUCT_OPEN, (product: IProduct) => {
    const template = document.getElementById('card-preview') as HTMLTemplateElement;
    if (template) {
        const productView = new Product(template, events, (id: string) => orderData.isProductInBasket(id));
        const productElement = productView.render(product);
        modal.setContent(productElement);
        modal.open();
    }
});

// Обработчик открытия корзины - ТОЛЬКО ОТОБРАЖЕНИЕ
events.on(AppEvents.BASKET_OPEN, () => {
    if (!basketTemplate) return;
     events.emit(AppEvents.BASKET_CHANGED, orderData.basket);
    modal.setContent(basket.render());
    modal.open();
});

// Обработчик изменения корзины - ОБНОВЛЕНИЕ ДАННЫХ
events.on(AppEvents.BASKET_CHANGED, (items: TBasketItem[]) => {
    const total = orderData.getTotal();
    const basketListHTML = renderBasketList(items);
    page.updateBasketCounter(items.length);
    basket.setOrderButtonState(items.length > 0);
    basket.setBasketList(basketListHTML);
    basket.updateTotal(total);
    if (modal.isOpen() && items.length === 0) {
        modal.close();
    }
});

// Обработчик обновления общей суммы
events.on(AppEvents.TOTAL_UPDATED, (total: number) => {
    if (basket) {
        basket.updateTotal(total);
    }
});

// Обработчик добавления товара в корзину
events.on(AppEvents.PRODUCT_ADD, (basketItem: TBasketItem) => {
    try {
        orderData.addProduct(basketItem);
        modal.close();
    } catch (error) {
        console.error('Ошибка добавления товара в корзину:', error);
    }
});

// Обработчик удаления товара из корзины
events.on(AppEvents.PRODUCT_REMOVE, (productId: string) => {
    orderData.deleteProduct(productId);
});

// Обработчик изменения ошибок формы
events.on(AppEvents.FORM_ERRORS_CHANGED, (errors: FormErrors) => {
    const modalContent = modal.getContent();
    if (modalContent && paymentForm && paymentForm.isActive()) {
        paymentForm.showErrors(errors);
    }
    if (modalContent && contactsForm && contactsForm.isActive()) {
        contactsForm.showErrors(errors);
    }
});

// Обработчик изменения способа оплаты
events.on(AppEvents.ORDER_PAYMENT_CHANGE, (data: { field: string, value: string }) => {
    orderData.setOrderField(data.field as keyof TOrderPaymentInfo, data.value);
    orderData.validateOrder();
});

// Обработчик изменения адреса
events.on(AppEvents.ORDER_ADDRESS_CHANGE, (data: { field: string, value: string }) => {
    orderData.setOrderField(data.field as keyof TOrderPaymentInfo, data.value);
     orderData.validateOrder();
});

// Обработчик изменения валидности формы оплаты
events.on(AppEvents.ORDER_VALIDITY_CHANGED, (isValid: boolean) => {
    if (paymentForm && paymentForm.isActive()) {
        paymentForm.setSubmitButtonState(isValid);
    }
});

// Обработчик отправки формы оплаты
events.on(AppEvents.ORDER_SUBMIT, () => {
    contactsForm.setValues(orderData.contactsInfo.email, orderData.contactsInfo.phone);
    contactsForm.setSubmitButtonState(orderData.isContactsFormValid);
    modal.setContent(contactsForm.container);
});

// Обработчик изменения email
events.on(AppEvents.CONTACTS_EMAIL_CHANGE, (data: { field: string, value: string }) => {
    orderData.setContactsField(data.field as keyof TOrderContactsInfo, data.value);
    orderData.validateContacts();
});

// Обработчик изменения телефона
events.on(AppEvents.CONTACTS_PHONE_CHANGE, (data: { field: string, value: string }) => {
    orderData.setContactsField(data.field as keyof TOrderContactsInfo, data.value);
    orderData.validateContacts();
});

// Обработчик изменения валидности формы контактов
events.on(AppEvents.CONTACTS_VALIDITY_CHANGED, (isValid: boolean) => {
    if (contactsForm && contactsForm.isActive()) {
        contactsForm.setSubmitButtonState(isValid);
    }
});

// Обработчик отправки формы контактов
events.on(AppEvents.CONTACTS_SUBMIT, () => {
        const order = orderData.createOrderObject();
        
        api.createOrder(order)
            .then((result: IOrderResult) => {
                events.emit(AppEvents.ORDER_SUCCESS, result);
            })
            .catch(error => {
                console.error('Ошибка оформления заказа:', error);
            });
});

// Обработчик успешного заказа
events.on(AppEvents.ORDER_SUCCESS, (result: IOrderResult) => {
    orderData.clearBasket();
    orderData.clearDataForms();
    successOrder.total = result.total;
    modal.setContent(successOrder.render(result));
    modal.open();
});

// Обработчик закрытия окна успеха
events.on(AppEvents.SUCCESS_CLOSE, () => {
    modal.close();
    paymentForm.clear();
    contactsForm.clear()
});

// Обработчик отправки корзины
events.on(AppEvents.BASKET_SUBMIT, () => {
    if (orderData.basket.length === 0) return;
    orderData.validateOrder();
    paymentForm.setValues(orderData.paymentInfo.payment, orderData.paymentInfo.address);
    paymentForm.setSubmitButtonState(orderData.isOrderFormValid);
    modal.setContent(paymentForm.container);
    modal.open();
});

// Обработчик открытия модального окна
events.on(AppEvents.MODAL_OPEN, () => {
    page.setLocked(true);
});

// Обработчик закрытия модального окна
events.on(AppEvents.MODAL_CLOSE, () => {
    page.setLocked(false);
});

// Загрузка товаров
api.getProductList()
    .then((items) => {
        productData.setProductList(items);
    })
    .catch((err) => {
        console.error('Ошибка загрузки товаров:', err);
    });