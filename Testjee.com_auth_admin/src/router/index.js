import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../pages/DashboardPage.vue')
    },
    {
        path: '/students/:id',
        name: 'StudentDetail',
        component: () => import('../pages/StudentDetailPage.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
