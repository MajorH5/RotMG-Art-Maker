export const Action = (function () {
    return class Action {
        constructor (tag, data) {
            this.tag = tag;
            this.data = [data];
        }

        insert (data) {
            this.data.push(data);
        }

        getTag () {
            return this.tag;
        }

        getData () {
            return this.data;
        }
    }
})();