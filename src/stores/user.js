import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const isAuthenticated = ref(!!localStorage.getItem('authToken'))
    const currentUser = ref(JSON.parse(localStorage.getItem('user')) || null)

    function login(token, user) {
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
        isAuthenticated.value = true
        currentUser.value = user
    }

    function logout() {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        isAuthenticated.value = false
        currentUser.value = null
    }

    return { isAuthenticated, currentUser, login, logout }
})
