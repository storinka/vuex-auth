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
