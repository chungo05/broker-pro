// Factor base por cobertura
export const COVERAGE_FACTOR: Record<string, number> = {
    rc:          0.55,
    basica:      0.75,
    amplia:      1.00,
    amplia_plus: 1.18,
  }
  
  // Factor por año del auto
  export function yearFactor(year: number): number {
    const age = new Date().getFullYear() - year
    if (age <= 1)  return 1.05
    if (age <= 3)  return 1.00
    if (age <= 6)  return 0.92
    if (age <= 10) return 0.85
    return 0.75
  }
  
  // Valor base por marca (simplificado)
  export const BRAND_BASE: Record<string, number> = {
    nissan:    8_500,
    vw:        9_200,
    chevrolet: 8_800,
    toyota:    10_500,
    honda:     10_200,
    mazda:     10_800,
    kia:       9_000,
    ford:      9_600,
    seat:      8_900,
  }