export const generateOtpCode = (): string => {
  const nums: number[] = []

  for (let i = 0; i < 6; i++) {
    const num: number = Math.floor(Math.random() * 10)
    nums.push(num)
  }

  return nums.join('')
}
