import { jwtDecode } from "jwt-decode"

export const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token)
    return decoded
  } catch (error) {
    console.log("Invalid token", error)
    return null
  }
}