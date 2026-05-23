import { generateOtpCode } from '../otp-code-generator'

describe('otp-code-generator tests', () => {
  it('should be able to test the generation of otp code', () => {
    const code = generateOtpCode()

    expect(code).toHaveLength(6)
    code.split('').forEach((t) => expect(Number(t)).toBeLessThan(10))
  })
})
