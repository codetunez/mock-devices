export class AssociativeStore<T> {

    private store: T = null;

    constructor() {
        this.initStore();
    }

    public initStore = () => {
        this.store = <T>{};
    }

    public deleteStore = () => {
        this.initStore();
    }

    public count = (): number => {
        if (this.store != null) {
            return Object.keys(this.store).length;
        } else { return 0; }
    }

    public getItem = (id: string): any => {
        return this.store[id];
    }

    public setItem = (item: T, id: string) => {
        this.store[id] = item;
    }

    public deleteItem = (id: string) => {
        delete this.store[id];
    }

    public getAllItems = (): Array<T> => {
        let arr = [];
        for (let key in this.store) {
            arr.push(this.store[key])
        }
        return arr;
    }

    public createStoreFromArray = (arr: Array<T>) => {
        this.initStore();
        for (let i = 0; i < arr.length; i++) {
            this.store[arr[i]['_id']] = arr[i];
        }
    }
}