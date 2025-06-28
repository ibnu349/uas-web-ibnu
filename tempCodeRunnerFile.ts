import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
// --- PERBAIKAN IMPORT VALIDATOR ---
// Pastikan nama file Anda app/validators/AuthValidator.ts
import { registerValidator, loginValidator } from '#validators/auth' // Jika AuthValidator.ts, maka impornya begini. Perhatikan underscores (_)

export default class AuthController {
  // Menampilkan halaman login
  async showLogin({ inertia }: HttpContext) {
    return inertia.render('Auth/Login')
  }

  // Memproses login
  async login({ request, auth, response, session }: HttpContext) {
    const { email, password, rememberMe } = await request.validateUsing(loginValidator)

    try {
      // --- PERBAIKAN PANGGILAN AUTH: Panggil attempt langsung dari 'auth' ---
      // auth.use('web').attempt(email, password, rememberMe)
      await auth.use('web').attempt(email, password, rememberMe)
      session.flash('success', 'Berhasil login!')
      return response.redirect().toPath('/')
    } catch (error) {
      session.flash('errors', { message: 'Email atau password salah.' })
      return response.redirect().back()
    }
  }

  // Menampilkan halaman register
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('Auth/Register')
  }

  // Memproses register
  async register({ request, auth, response, session }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(registerValidator)

    try {
      const user = await User.create({ fullName, email, password })
      // --- PERBAIKAN PANGGILAN AUTH: Panggil login langsung dari 'auth' ---
      // await auth.login(user)
      await auth.use('web').login(user)
      session.flash('success', 'Pendaftaran berhasil! Anda sekarang login.')
      return response.redirect().toPath('/')
    } catch (error) {
      if (
        error.code === '23505' ||
        (error.message && error.message.includes('duplicate key value violates unique constraint'))
      ) {
        session.flash('errors', { message: 'Email sudah terdaftar.' })
      } else {
        session.flash('errors', { message: 'Gagal mendaftar. Terjadi kesalahan.' })
      }
      return response.redirect().back()
    }
  }

  // Logout
  async logout({ auth, response }: HttpContext) {
    // --- PERBAIKAN PANGGILAN AUTH: Panggil logout langsung dari 'auth' ---
    await auth.use('web').logout()
    return response.redirect().toPath('/')
  }
}
