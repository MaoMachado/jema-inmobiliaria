import { Plan } from '../generated/prisma';

export interface BeneficiosPlan {
  precio: number;
  propiedades: number;
  chatDiario: number;
  fotos: number;
  destacada: boolean;
  analytics: boolean;
}

export interface PlanActual {
  plan: Plan;
  propiedadesLimite: number;
  chatIaLimite: number;
  beneficios: BeneficiosPlan;
}

export const PLANES: Record<Plan, BeneficiosPlan> = {
  GRATIS: {
    precio: 0,
    propiedades: 5,
    chatDiario: 10,
    fotos: 5,
    destacada: false,
    analytics: false,
  },

  BASICO: {
    precio: 15000,
    propiedades: 15,
    chatDiario: 20,
    fotos: 10,
    destacada: false,
    analytics: true,
  },

  PREMIUM: {
    precio: 30000,
    propiedades: 30,
    chatDiario: 30,
    fotos: 20,
    destacada: true,
    analytics: true,
  },
};
