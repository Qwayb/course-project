import MainScreen from "@/views/MainScreen.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Logout from "@/views/Logout.vue";
import Profile from "@/views/Profile.vue";
import Clothes from "@/views/Clothes.vue";
import ClothesAdd from "@/views/ClothesAdd.vue";
import Outfits from "@/views/Outfits.vue";
import OutfitsAdd from "@/views/OutfitsAdd.vue";

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
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: {
            title: 'Profile'
        }
    },
    {
        path: '/clothes',
        name: 'Clothes',
        component: Clothes,
        meta: {
            title: 'Clothes'
        }
    },
    {
        path: '/clothesAdd',
        name: 'ClothesAdd',
        component: ClothesAdd,
        meta: {
            title: 'ClothesAdd'
        }
    },
    {
        path: '/outfits',
        name: 'Outfits',
        component: Outfits,
        meta: {
            title: 'Outfits'
        }
    },
    {
        path: '/outfitsAdd',
        name: 'OutfitsAdd',
        component: OutfitsAdd,
        meta: {
            title: 'OutfitsAdd'
        }
    },
];

export default routes;