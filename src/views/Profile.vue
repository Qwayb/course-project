<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const store = useUserStore()
const router = useRouter()

// Redirect to login if not authenticated
onMounted(() => {
  if (!store.isAuthenticated) {
    router.push('/login')
  }
})

// Edit mode states
const isEditingProfile = ref(false)
const isEditingPassword = ref(false)

// Form data
const profileForm = ref({
  name: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Loading and error states
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const profileError = ref('')
const passwordError = ref('')
const profileSuccess = ref('')
const passwordSuccess = ref('')

// Initialize form data with current user data
const initializeProfileForm = () => {
  if (store.currentUser) {
    profileForm.value = {
      name: store.currentUser.name,
      email: store.currentUser.email
    }
  }
}

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateName = (name) => {
  const trimmedName = name.trim()
  return trimmedName.length >= 2 && trimmedName.length <= 50 && /^[a-zA-Zа-яА-Я\s]+$/.test(trimmedName)
}

const validatePassword = (password) => {
  // Password must be at least 8 characters, contain at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

// Computed properties for validation
const isProfileFormValid = computed(() => {
  return validateName(profileForm.value.name) &&
      validateEmail(profileForm.value.email)
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword.length > 0 &&
      validatePassword(passwordForm.value.newPassword) &&
      passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

// Validation error messages
const profileValidationErrors = computed(() => {
  const errors = []
  if (profileForm.value.name && !validateName(profileForm.value.name)) {
    errors.push('Имя должно содержать от 2 до 50 символов и только буквы')
  }
  if (profileForm.value.email && !validateEmail(profileForm.value.email)) {
    errors.push('Введите корректный email адрес')
  }
  return errors
})

const passwordValidationErrors = computed(() => {
  const errors = []
  if (passwordForm.value.newPassword && !validatePassword(passwordForm.value.newPassword)) {
    errors.push('Пароль должен содержать минимум 8 символов, включая буквы и цифры')
  }
  if (passwordForm.value.newPassword && passwordForm.value.confirmPassword &&
      passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.push('Пароли не совпадают')
  }
  return errors
})

// Start editing profile
const startEditingProfile = () => {
  initializeProfileForm()
  isEditingProfile.value = true
  profileError.value = ''
  profileSuccess.value = ''
}

// Cancel profile editing
const cancelProfileEdit = () => {
  isEditingProfile.value = false
  initializeProfileForm()
  profileError.value = ''
}

// Start editing password
const startEditingPassword = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  isEditingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
}

// Cancel password editing
const cancelPasswordEdit = () => {
  isEditingPassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordError.value = ''
}

// Update profile information
const updateProfile = async () => {
  if (!isProfileFormValid.value) {
    profileError.value = 'Пожалуйста, исправьте ошибки в форме'
    return
  }

  isUpdatingProfile.value = true
  profileError.value = ''
  profileSuccess.value = ''

  try {
    const response = await fetch(`https://87bb0d4c94472c27.mokky.dev/users/${store.currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: profileForm.value.name.trim(),
        email: profileForm.value.email.trim()
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle specific error messages from API
      let errorMessage = 'Ошибка при обновлении профиля'
      if (errorData.message) {
        switch (errorData.message) {
          case 'EMAIL_ALREADY_EXISTS':
            errorMessage = 'Пользователь с таким email уже существует'
            break
          case 'INVALID_DATA':
            errorMessage = 'Некорректные данные'
            break
          case 'RESOURCE_NOT_AUTHORIZED':
            errorMessage = 'Недостаточно прав для выполнения операции'
            break
          default:
            errorMessage = errorData.message
        }
      } else if (response.status === 400) {
        errorMessage = 'Некорректные данные'
      } else if (response.status === 401) {
        errorMessage = 'Ошибка авторизации'
      } else if (response.status === 409) {
        errorMessage = 'Пользователь с таким email уже существует'
      }

      throw new Error(errorMessage)
    }

    const updatedUser = await response.json()

    // Update the store with new user data
    store.updateUser(updatedUser)

    profileSuccess.value = 'Профиль успешно обновлен!'
    isEditingProfile.value = false

    console.log('Профиль обновлен:', updatedUser)

  } catch (err) {
    console.error('Ошибка при обновлении профиля:', err)
    profileError.value = err.message
  } finally {
    isUpdatingProfile.value = false
  }
}

// Update password
const updatePassword = async () => {
  if (!isPasswordFormValid.value) {
    passwordError.value = 'Пожалуйста, исправьте ошибки в форме'
    return
  }

  isUpdatingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    // First verify current password by attempting login
    const verifyResponse = await fetch('https://87bb0d4c94472c27.mokky.dev/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: store.currentUser.email,
        password: passwordForm.value.currentPassword
      })
    })

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}))
      let errorMessage = 'Неверный текущий пароль'

      if (errorData.message) {
        switch (errorData.message) {
          case 'INVALID_CREDENTIALS':
          case 'INVALID_PASSWORD':
            errorMessage = 'Неверный текущий пароль'
            break
          case 'USER_NOT_FOUND':
            errorMessage = 'Пользователь не найден'
            break
          default:
            errorMessage = 'Ошибка проверки пароля'
        }
      }

      throw new Error(errorMessage)
    }

    // Update password
    const updateResponse = await fetch(`https://87bb0d4c94472c27.mokky.dev/users/${store.currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        password: passwordForm.value.newPassword
      })
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))

      let errorMessage = 'Ошибка при обновлении пароля'
      if (errorData.message) {
        switch (errorData.message) {
          case 'INVALID_DATA':
            errorMessage = 'Некорректный пароль'
            break
          case 'RESOURCE_NOT_AUTHORIZED':
            errorMessage = 'Недостаточно прав для выполнения операции'
            break
          default:
            errorMessage = errorData.message
        }
      } else if (updateResponse.status === 400) {
        errorMessage = 'Некорректный пароль'
      } else if (updateResponse.status === 401) {
        errorMessage = 'Ошибка авторизации'
      }

      throw new Error(errorMessage)
    }

    passwordSuccess.value = 'Пароль успешно изменен!'
    isEditingPassword.value = false

    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    console.log('Пароль обновлен')

  } catch (err) {
    console.error('Ошибка при обновлении пароля:', err)
    passwordError.value = err.message
  } finally {
    isUpdatingPassword.value = false
  }
}

// Clear success messages after timeout
const clearMessages = () => {
  setTimeout(() => {
    profileSuccess.value = ''
    passwordSuccess.value = ''
  }, 5000)
}

// Watch for success messages and clear them
const watchSuccess = () => {
  if (profileSuccess.value || passwordSuccess.value) {
    clearMessages()
  }
}

// Initialize on component mount
onMounted(() => {
  initializeProfileForm()
})
</script>

<template>
  <div v-if="!store.isAuthenticated" class="not-authenticated">
    <h2>Доступ запрещен</h2>
    <p>Вы должны быть авторизованы для просмотра профиля</p>
    <router-link to="/login" class="button">Войти</router-link>
  </div>

  <div v-else class="profile-container">
    <div class="profile-header">
      <h2>Профиль пользователя</h2>
    </div>

    <!-- Profile Information Section -->
    <div class="profile-section defShadow">
      <div class="section-header">
        <h3>Основная информация</h3>
        <button
            v-if="!isEditingProfile"
            @click="startEditingProfile"
            class="button edit-button"
        >
          Редактировать
        </button>
      </div>

      <!-- View Mode -->
      <div v-if="!isEditingProfile" class="profile-display">
        <div class="info-item">
          <span class="info-label">Имя:</span>
          <span class="info-value">{{ store.currentUser.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ store.currentUser.email }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ID:</span>
          <span class="info-value">{{ store.currentUser.id }}</span>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else class="profile-edit">
        <form @submit.prevent="updateProfile" class="edit-form">
          <div class="form-group">
            <label for="name">Имя:</label>
            <input
                id="name"
                v-model="profileForm.name"
                type="text"
                placeholder="Введите ваше имя"
                class="input"
                :class="{ 'input-error': profileForm.name && !validateName(profileForm.name) }"
                required
                :disabled="isUpdatingProfile"
            />
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input
                id="email"
                v-model="profileForm.email"
                type="email"
                placeholder="Введите ваш email"
                class="input"
                :class="{ 'input-error': profileForm.email && !validateEmail(profileForm.email) }"
                required
                :disabled="isUpdatingProfile"
            />
          </div>

          <!-- Validation errors -->
          <div v-if="profileValidationErrors.length > 0" class="validation-errors">
            <div v-for="error in profileValidationErrors" :key="error" class="validation-error">
              {{ error }}
            </div>
          </div>

          <div class="form-actions">
            <button
                type="submit"
                :disabled="!isProfileFormValid || isUpdatingProfile"
                class="button save-button"
            >
              {{ isUpdatingProfile ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button
                type="button"
                @click="cancelProfileEdit"
                :disabled="isUpdatingProfile"
                class="button cancel-button"
            >
              Отменить
            </button>
          </div>

          <div v-if="profileError" class="error-message">{{ profileError }}</div>
          <div v-if="profileSuccess" class="success-message">{{ profileSuccess }}</div>
        </form>
      </div>
    </div>

    <!-- Password Section -->
    <div class="profile-section defShadow">
      <div class="section-header">
        <h3>Безопасность</h3>
        <button
            v-if="!isEditingPassword"
            @click="startEditingPassword"
            class="button edit-button"
        >
          Изменить пароль
        </button>
      </div>

      <!-- View Mode -->
      <div v-if="!isEditingPassword" class="password-display">
        <div class="info-item">
          <span class="info-label">Пароль:</span>
          <span class="info-value">••••••••</span>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else class="password-edit">
        <form @submit.prevent="updatePassword" class="edit-form">
          <div class="form-group">
            <label for="currentPassword">Текущий пароль:</label>
            <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Введите текущий пароль"
                class="input"
                required
                :disabled="isUpdatingPassword"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">Новый пароль:</label>
            <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Введите новый пароль (минимум 8 символов)"
                class="input"
                :class="{ 'input-error': passwordForm.newPassword && !validatePassword(passwordForm.newPassword) }"
                required
                :disabled="isUpdatingPassword"
            />
            <div class="password-requirements">
              Пароль должен содержать минимум 8 символов, включая буквы и цифры
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтвердите пароль:</label>
            <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Повторите новый пароль"
                class="input"
                :class="{ 'input-error': passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword }"
                required
                :disabled="isUpdatingPassword"
            />
          </div>

          <!-- Validation errors -->
          <div v-if="passwordValidationErrors.length > 0" class="validation-errors">
            <div v-for="error in passwordValidationErrors" :key="error" class="validation-error">
              {{ error }}
            </div>
          </div>

          <div class="form-actions">
            <button
                type="submit"
                :disabled="!isPasswordFormValid || isUpdatingPassword"
                class="button save-button"
            >
              {{ isUpdatingPassword ? 'Обновление...' : 'Обновить пароль' }}
            </button>
            <button
                type="button"
                @click="cancelPasswordEdit"
                :disabled="isUpdatingPassword"
                class="button cancel-button"
            >
              Отменить
            </button>
          </div>

          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="success-message">{{ passwordSuccess }}</div>
        </form>
      </div>
    </div>

    <!-- Logout Section -->
    <div class="profile-section logout-section">
      <router-link class="button logout-button" to="/logout">Выйти</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-authenticated {
  text-align: center;
  padding: 2rem;
}

.not-authenticated h2 {
  color: #c30000;
  margin-bottom: 1rem;
}

.not-authenticated p {
  margin-bottom: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h2 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 0;
}

.profile-section {
  background: #ECF0F3;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  transition: all 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #D1D9E6;
}

.section-header h3 {
  color: #333;
  font-size: 1.3rem;
  margin: 0;
}

.edit-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.profile-display,
.password-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #D1D9E6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #666;
  font-size: 1rem;
}

.info-value {
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.password-hint {
  color: #888;
  font-size: 0.9rem;
  font-style: italic;
  margin: 10px 0 0 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc;
}

.cancel-button {
  background: #f0f0f0;
  color: #666;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.cancel-button:hover:not(:disabled) {
  background: #e0e0e0;
}

.validation-errors {
  margin-top: -10px;
  margin-bottom: 10px;
}

.validation-error {
  color: #c30000;
  font-size: 0.85rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.validation-error:before {
  content: "⚠";
  font-size: 0.9rem;
}

.input-error {
  border: 2px solid #ff4444 !important;
  box-shadow: inset 4px 4px 11px rgba(255, 68, 68, 0.2) !important;
}

.input-error:focus {
  box-shadow: inset 4px 4px 11px rgba(255, 68, 68, 0.3) !important;
}

.password-requirements {
  font-size: 0.8rem;
  color: #888;
  margin-top: 5px;
  font-style: italic;
}

.error-message {
  color: #c30000;
  background: #fff0f0;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #f0c0c0;
  font-size: 0.9rem;
}

.success-message {
  color: #2d5a27;
  background: #f0fff0;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #c0f0c0;
  font-size: 0.9rem;
}

.logout-section {
  text-align: center;
  background: transparent;
  box-shadow: none;
  padding: 20px;
}

.logout-button {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  font-weight: bold;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }

  .profile-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .form-actions {
    flex-direction: column;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 10px;
  }

  .profile-section {
    padding: 15px;
  }

  .profile-header h2 {
    font-size: 1.5rem;
  }

  .section-header h3 {
    font-size: 1.1rem;
  }
}
</style>