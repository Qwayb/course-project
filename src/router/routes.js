import MainScreen from "@/views/MainScreen.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Logout from "@/views/Logout.vue";

const routes = [
    {
        path: '/',
        name: 'Main',
        component: MainScreen,
        meta: {
            title: 'project'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            title: 'Login'
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            title: 'Register'
        }
    },
    {
        path: '/logout',
        name: 'Logout',
        component: Logout,
        meta: {
            title: 'Logout'
        }
    },
];

export default routes;
