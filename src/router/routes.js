import MainScreen from "@/views/MainScreen.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";

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
    }

];

export default routes;
