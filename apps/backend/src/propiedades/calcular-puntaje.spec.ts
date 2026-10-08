import { calcularPuntaje } from './calcular-puntaje';
import { CreatePropiedadDto } from './dto/propiedades.dto';

describe('calcularPuntaje', () => {
  const propiedadMinima: CreatePropiedadDto = {
    titulo: 'Casa',
    descripcion: 'Casa en venta',
    precio: 100000,
    ciudad: 'Medellin',
    barrio: 'Poblado',
    direccion: 'Calle 10 # 20-30',
    estrato: 4,
    tipo: 'Casa',
    habitaciones: 3,
    banos: 2,
    area: 120,
    antiguedad: 5,
  };

  it('debe calcular puntaje base para una propiedad con datos mínimos válidos', () => {
    const puntaje = calcularPuntaje(propiedadMinima);
    expect(puntaje).toBeGreaterThan(0);
    expect(puntaje).toBeLessThanOrEqual(100);
  });

  it('debe otorgar puntaje por fotografías subidas hasta el tope máximo', () => {
    const conFotos: CreatePropiedadDto = {
      ...propiedadMinima,
      fotografias: ['f1.jpg', 'f2.jpg', 'f3.jpg', 'f4.jpg', 'f5.jpg'],
    };
    const puntajeSinFotos = calcularPuntaje(propiedadMinima);
    const puntajeConFotos = calcularPuntaje(conFotos);

    expect(puntajeConFotos).toBeGreaterThan(puntajeSinFotos);
    expect(puntajeConFotos - puntajeSinFotos).toBe(15);
  });

  it('debe validar coordenadas válidas en hemisferio occidental (longitud negativa de Colombia)', () => {
    const conCoordsColombia: CreatePropiedadDto = {
      ...propiedadMinima,
      ubicacionLat: 6.2442,
      ubicacionLong: -75.5812, // Medellín (longitud negativa)
    };
    const puntajeBase = calcularPuntaje(propiedadMinima);
    const puntajeConCoords = calcularPuntaje(conCoordsColombia);

    expect(puntajeConCoords).toBe(puntajeBase + 6);
  });

  it('no debe otorgar puntos por coordenadas en 0 o nulas', () => {
    const sinCoords: CreatePropiedadDto = {
      ...propiedadMinima,
      ubicacionLat: 0,
      ubicacionLong: 0,
    };
    expect(calcularPuntaje(sinCoords)).toBe(calcularPuntaje(propiedadMinima));
  });

  it('debe otorgar puntos adicionales por video y parqueaderos', () => {
    const completa: CreatePropiedadDto = {
      ...propiedadMinima,
      video: 'https://youtube.com/watch?v=123',
      parqueaderos: 2,
    };
    const puntajeBase = calcularPuntaje(propiedadMinima);
    const puntajeCompleta = calcularPuntaje(completa);

    expect(puntajeCompleta).toBe(puntajeBase + 4);
  });

  it('nunca debe superar 100 puntos y debe calcular un puntaje alto para propiedades completas', () => {
    const superPropiedad: CreatePropiedadDto = {
      titulo:
        'Hermosa casa campestre de lujo con acabados de primera y excelente vista',
      descripcion: 'A'.repeat(500),
      precio: 500000000,
      ciudad: 'Medellin',
      barrio: 'El Poblado',
      direccion: 'Carrera 43A # 1-50',
      estrato: 6,
      tipo: 'Casa Campestre',
      habitaciones: 5,
      banos: 4,
      parqueaderos: 3,
      area: 350,
      antiguedad: 50,
      fotografias: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
      video: 'https://youtube.com/watch?v=abc',
      ubicacionLat: 6.2088,
      ubicacionLong: -75.5678,
    };

    const puntaje = calcularPuntaje(superPropiedad);
    expect(puntaje).toBeGreaterThanOrEqual(90);
    expect(puntaje).toBeLessThanOrEqual(100);
  });
});
