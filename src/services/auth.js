const users = require('./user')
const crypto = require('./crypto')
const tokenService = require('./token')
const otplib = require('otplib')
const qrcode = require('qrcode')

// illustration purposes only
// for production-ready code, use error codes/types and a catalog (maps codes -> responses)

/* eslint-disable prefer-promise-reject-errors */
const authFailed = () => Promise.reject({
  status: 401,
  code: 'UNAUTHENTICATED',
  message: 'Failed to authenticate',
})

const authenticate = async ({ email, password, twoFactorToken }) => {
  const user = await users.findByEmail(email)
  if (!user) {
    return authFailed()
  }
  const isMatch = await crypto.compare(password, user.password)
  if (!isMatch) {
    return authFailed()
  }

  if(user.twoFaEnabled && !twoFactorToken) {
    return { twoFactorEnabled: true }
  }

  if(user.twoFaEnabled) {
    const isTwoFactorTokenValid = otplib.authenticator.verify({
      token: twoFactorToken,
      secret: user.twoFaSecret
    })

    if(!isTwoFactorTokenValid) {
      return authFailed()
    }
  }

  const { token: refreshToken, expiresAt: refreshTokenExpiration } = await tokenService.createRefreshToken(user.id)
  return {
    refreshToken,
    refreshTokenExpiration,
    accessToken: tokenService.sign({ id: user.id, role: user.role }),
  }
}

const refreshToken = async ({ token }) => {
  const refreshTokenObject = await tokenService.getRefreshToken(token)

  if (refreshTokenObject &&
    refreshTokenObject.valid &&
    refreshTokenObject.expiresAt >= Date.now()
  ) {
    await tokenService.invalidateRefreshToken(token)

    const user = await users.findById(refreshTokenObject.user_id)
    const { token: refreshToken, expiresAt: refreshTokenExpiration } = await tokenService.createRefreshToken(user.id)
    return {
      refreshToken,
      refreshTokenExpiration,
      accessToken: tokenService.sign({ id: user.id, role: user.role }),
    }
  }
  return authFailed()
}

const logout = async ({ token, allDevices }) => {
  if (allDevices) {
    return tokenService.invalidateAllUserRefreshTokens(token)
  }
  return tokenService.invalidateRefreshToken(token)
}

const generateQrCode = async userId => {
  const secret = otplib.authenticator.generateSecret()

  await users.addTwoFASecret(userId, secret)

  const otpAuth = otplib.authenticator.keyuri(userId, process.env.APP_NAME, secret)

  return qrcode.toDataURL(otpAuth)
}

const activateTwoFactor = async (userId, token) => {
  const { twoFaSecret: secret } = await users.findById(userId)

  if(otplib.authenticator.verify({token, secret})) {
    await users.activateTwoFactor(userId)
    return true
  } else {
    return Promise.reject('Wrong token')
  }
}

module.exports = {
  authenticate,
  refreshToken,
  logout,
  generateQrCode,
  activateTwoFactor,
}
