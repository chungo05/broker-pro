import { describe, expect, it } from 'vitest'
import { COVERAGE_FACTOR, yearFactor } from './utils'

describe('yearFactor', () => {
  it('returns expected bands for reference year 2026', () => {
    expect(yearFactor(2026)).toBe(1.05) // age 0
    expect(yearFactor(2025)).toBe(1.05) // age 1
    expect(yearFactor(2024)).toBe(1.0) // age 2
    expect(yearFactor(2021)).toBe(0.92) // age 5
    expect(yearFactor(2017)).toBe(0.85) // age 9
    expect(yearFactor(2015)).toBe(0.75) // age 11
  })
})

describe('COVERAGE_FACTOR', () => {
  it('orders from cheapest to most expensive', () => {
    expect(COVERAGE_FACTOR.rc).toBeLessThan(COVERAGE_FACTOR.basica!)
    expect(COVERAGE_FACTOR.basica).toBeLessThan(COVERAGE_FACTOR.amplia!)
    expect(COVERAGE_FACTOR.amplia).toBeLessThan(COVERAGE_FACTOR.amplia_plus!)
  })
})
