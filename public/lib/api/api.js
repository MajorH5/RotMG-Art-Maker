import { Constants } from "../utils/constants.js";

export const API = (function (){
    return class API {
        static async get (endpoint) {
            const response = fetch(Constants.ORIGIN + endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.then(res => res.json());
        }

        static async post (endpoint, data) {
            const response = fetch(Constants.ORIGIN + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return response.then(res => res.json());
        }
    }
})();