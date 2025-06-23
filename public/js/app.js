const { createApp, ref } = Vue;

createApp({
    components: {
        Login,
        MainLayout,
        Dashboard,
        Users,
        MyDocuments,
        Documents
    },
    setup() {
        const user = ref(null);

        function onLoginSuccess(loggedUser) {
            user.value = loggedUser;
        }

        const logout = () => {
            user.value = null;
            localStorage.removeItem("user");
        };

        /* Verificar si hay un usuario guardado al cargar la aplicación */
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            user.value = JSON.parse(storedUser);
        }

        return {
            user,
            onLoginSuccess,
            logout
        };
    },
    template: /*HTML*/ `
        <transition name="v" mode="out-in">
            <Login v-if="!user" :on-login-success="onLoginSuccess"/>
            <MainLayout v-else :user="user" :on-logout="logout"/>
        </transition>
    `
}).mount("#app");