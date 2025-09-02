export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number | null;
  image: string;
  category: string;
}

export interface IOrder {
  payment: string;
  address: string;
  email: string;
  phone: string;
  total: number;
  items: string[];
}

export interface IOrderResult {
  id: string;
  total: number;
}

export type TProductId = Pick<IProduct, 'id'>;
export type TBasketItem = Pick<IProduct, 'id' | 'title' | 'price'>;
export type TOrderPaymentInfo = Pick<IOrder, 'payment' | 'address'>;
export type TOrderContactsInfo = Pick<IOrder, 'email' | 'phone'>;
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface ILarekApi {
  getProductList: () => Promise<IProduct[]>;
  getProduct: (id: string) => Promise<IProduct>;
  createOrder: (order: IOrder) => Promise<IOrderResult>;
}

export interface IProductData {
  productList: IProduct[];
  events: IEvents;
  setProductList: (products: IProduct[]) => void;
  getProductList: () => IProduct[];
  getProductById: (id: string) => IProduct;
}

export interface IOrderData {
  basket: TBasketItem[];
  order: IOrder;
  formErrors: FormErrors;
  events: IEvents;
  addProduct: (item: TBasketItem) => void;
  deleteProduct: (id: string) => void;
  getTotal: () => number;
  updateTotal: () => void;
  clearDataForms: () => void;
  clearBasket: () => void;
  setOrderField: (field: keyof TOrderPaymentInfo, value: string) => void;
  setContactsField: (field: keyof TOrderContactsInfo, value: string) => void;
  validateOrder: () => boolean;
  validateContacts: () => boolean;
}

export interface IComponent<T> {
  toggleClass: (element: HTMLElement, className: string, force?: boolean) => void;
  setText: (element: HTMLElement, value: string) => void;
  setDisabled: (element: HTMLElement, state: boolean) => void;
  setHidden: (element: HTMLElement) => void;
  setVisible: (element: HTMLElement) => void;
  setImage: (element: HTMLImageElement, src: string, alt: string) => void;
  render: (data?: Partial<T>) => HTMLElement;
}

export interface IEvents {
  on: <T>(event: string, callback: (data: T) => void) => void;
  emit: <T>(event: string, data?: T) => void;
  trigger: <T>(event: string, data?: T) => () => void;
}

export interface IModal {
  open: () => void;
  close: () => void;
}

export interface IForm {
  submit: HTMLButtonElement;
  errors: HTMLElement;
  onInputChange: (field: string, value: string) => void;
  reset: () => void;
}

export interface IBasket {
  basketList: HTMLElement;
  total: HTMLElement;
  orderButton: HTMLButtonElement;
  render: (items: TBasketItem[]) => void;
  updateTotal: (total: number) => void;
}

export interface IBasketItem {
  productId: string;
  count: number;
  title: HTMLElement;
  price: HTMLElement;
  deleteButton: HTMLButtonElement;
  setCount: (count: number) => void;
}

export interface IPage {
  basketCounter: HTMLElement;
  basketButton: HTMLButtonElement;
  cardCatalog: HTMLElement;
  setLocked: (state: boolean) => void;
  updateBasketCounter: (count: number) => void;
}

export interface IProductCard {
  id: string;
  category: HTMLElement;
  title: HTMLElement;
  image: HTMLImageElement;
  price: HTMLElement;
}

export interface IProductPreview extends IProductCard {
  description: HTMLElement;
  cardButton: HTMLButtonElement;
  setCardButtonText: (isInBasket: boolean) => void;
  setDisabled: (state: boolean) => void;
}

export interface ISuccessOrder {
  total: number;
  render: (data: IOrderResult) => void;
}

export enum AppEvents {
  PRODUCTS_CHANGED = 'productList:changed',
  BASKET_CHANGED = 'basket:changed',
  ORDER_CHANGED = 'order:changed',
  FORM_ERRORS_CHANGED = 'formErrors:changed',
  TOTAL_UPDATED = 'totalUpdated',
  ORDER_READY = 'order:ready',
  CONTACTS_READY = 'contacts:ready',

  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
  BASKET_OPEN = 'basket:open',
  PRODUCT_OPEN = 'product:open',
  PRODUCT_ADD = 'product:addBasket',
  PRODUCT_REMOVE = 'product:removeBasket',
  BASKET_SUBMIT = 'basket:submit',
  ORDER_SUBMIT = 'order:submit',
  CONTACTS_SUBMIT = 'contacts:submit',

  ORDER_PAYMENT_CHANGE = 'order.payment:change',
  ORDER_ADDRESS_CHANGE = 'order.address:change',
  CONTACTS_EMAIL_CHANGE = 'contacts.email:change',
  CONTACTS_PHONE_CHANGE = 'contacts.phone:change'
}

export interface EventDataProductOpen {
  id: string;
}

export interface EventDataProductBasket {
  id: string;
}

export interface EventDataFormField {
  field: string;
  value: string;
}

export interface EventDataOrderSubmit {
  payment: string;
  address: string;
}

export interface EventDataContactsSubmit {
  email: string;
  phone: string;
}