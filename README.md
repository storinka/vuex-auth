# Storinka Vuex Auth

A Vuex module and Vue Router middleware for authorization.

## Installation

```shell
yarn add @storinka/vuex-auth
```

## Usage

```javascript
// store/index.js

import { createStore } from "vuex";
import { createAuthStoreModule } from "@storinka/vuex-auth";

export default createStore({
    modules: {
        auth: createAuthStoreModule({
            login: credentials => fetch("auth/login", credentials),
            register: data => fetch("auth/register", data),
            getMe: () => fetch("auth/me"),
            logout: () => fetch("auth/logout"),

            tokenKey: "auth_token",
        }),
    }
});
```

```javascript
// App.vue

import { initAuth, setupRouterGuard } from "@storinka/vuex-auth";

export default {
    beforeCreate() {
        initAuth(this.$router, this.$store);
        setupRouterGuard(this.$router, this.$store);
    }
}
```

```javascript
// main.js
import store from "./store";

axios.interceptors.request.use(request => {
    request.headers["Authorization"] = `Bearer ${store.state.auth.token}`;

    return request;
});

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            store.commit("auth/logout");
        }

        throw error;
    },
);
```
