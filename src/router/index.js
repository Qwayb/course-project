import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // Прокрутка вверх при смене маршрута
        return savedPosition || { top: 0 };
    }
});

// Обработчик изменения title страницы
router.beforeEach((to) => {
    document.title = to.meta.title || 'Мое приложение';
});

export default router;