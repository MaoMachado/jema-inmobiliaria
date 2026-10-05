import {
  canonEsperado,
  probabilidadOcupacional,
  probabilidadVenta,
  rentabilidadAnual,
  tiempoEstimadoDias,
  tiempoEstimadoOcupacion,
} from './calcular-probabilidad';
import { CreatePropiedadDto } from './dto/propiedades.dto';

describe('calcular-probabilidad', () => {
  const propiedad: CreatePropiedadDto = {
    titulo: 'Apartamento Poblado',
    descripcion: 'Apartamento espacioso',
    precio: 300000000,
    ciudad: 'Medellin',
    barrio: 'El Poblado',
    direccion: 'Calle 10',
    estrato: 5,
    tipo: 'Apartamento',
    habitaciones: 3,
    banos: 2,
    area: 90,
    antiguedad: 3,
    puntaje: 85,
  };

  const similares: CreatePropiedadDto[] = [
    {
      ...propiedad,
      precio: 290000000,
      area: 88,
      habitaciones: 3,
    },
    {
      ...propiedad,
      precio: 310000000,
      area: 92,
      habitaciones: 3,
    },
  ];

  describe('probabilidadOcupacional', () => {
    it('debe retornar el puntaje de la propiedad si no hay similares', () => {
      const prob = probabilidadOcupacional(propiedad, []);
      expect(prob).toBe(85);
    });

    it('debe calcular probabilidad ocupacional cuando hay propiedades similares', () => {
      const prob = probabilidadOcupacional(propiedad, similares);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(100);
    });
  });

  describe('probabilidadVenta', () => {
    it('debe retornar el puntaje si no hay similares', () => {
      const prob = probabilidadVenta(propiedad, []);
      expect(prob).toBe(85);
    });

    it('debe calcular probabilidad de venta basada en precio de mercado', () => {
      const prob = probabilidadVenta(propiedad, similares);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(100);
    });
  });

  describe('tiempoEstimadoDias', () => {
    it('debe calcular tiempo estimado en días mayor a 0', () => {
      const dias = tiempoEstimadoDias(propiedad, similares);
      expect(dias).toBeGreaterThan(0);
      expect(dias).toBeLessThanOrEqual(90);
    });
  });

  describe('canonEsperado y rentabilidadAnual', () => {
    it('debe calcular canon esperado multiplicando por la comisión mensual estándar', () => {
      const canon = canonEsperado(propiedad);
      expect(canon).toBe(300000000 * 0.006);
    });

    it('debe calcular rentabilidad anual porcentual correcta', () => {
      const rentabilidad = rentabilidadAnual(propiedad);
      expect(rentabilidad).toBeCloseTo(7.2, 1);
    });
  });

  describe('tiempoEstimadoOcupacion', () => {
    it('debe estimar días de ocupación entre 3 y 60 días', () => {
      const dias = tiempoEstimadoOcupacion(propiedad, similares);
      expect(dias).toBeGreaterThanOrEqual(3);
      expect(dias).toBeLessThanOrEqual(60);
    });
  });
});
