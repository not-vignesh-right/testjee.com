import { createRouter, createWebHistory } from 'vue-router'

const secretPath = '/admin-secure-panel-7x9q'

const routes = [
    {
        path: secretPath,
        name: 'Dashboard',
        component: () => import('../pages/DashboardPage.vue')
    },
    {
        path: secretPath + '/students/:id',
        name: 'StudentDetail',
        component: () => import('../pages/StudentDetailPage.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: 'https://testjee.com' // Send unauthorized visitors away
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
