/**
 * Planes predefinidos basados en evidencia.
 *
 * Principios comunes (ver PRINCIPLES):
 *  - Frecuencia ≥ 2 veces por músculo y semana.
 *  - Volumen ~10–20 series semanales por músculo (menos al empezar o al volver).
 *  - Sobrecarga progresiva mediante doble progresión.
 *  - Trabajo a 1–3 repeticiones en reserva (RIR).
 *
 * Cada plan tiene una o más "variantes" según los días disponibles por semana.
 * Los días de una variante se recorren en rotación (A-B-A, B-A-B…), por eso una
 * plantilla de 2 días sirve para entrenar 2 o 3 veces por semana.
 *
 * Convención: en ejercicios de tiempo o cardio, las "reps" son segundos o
 * minutos; se indica en la nota.
 */

export interface PlanItem {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSec: number;
  note?: string;
}

export interface PlanDay {
  name: string;
  items: PlanItem[];
}

export interface PlanVariant {
  daysPerWeek: number[]; // días/semana para los que sirve esta variante
  days: PlanDay[];
}

export type PlanLevel = 'Principiante' | 'Intermedio' | 'Regreso';
export type PlanEquipment = 'gym' | 'home';

export interface Plan {
  id: string;
  name: string;
  level: PlanLevel;
  equipment: PlanEquipment;
  equipmentLabel: string;
  durationWeeks: string;
  summary: string;
  rationale: string[];
  /** Pautas semana a semana (plan de regreso) u otras indicaciones. */
  guidelines?: string[];
  variants: PlanVariant[];
}

/** Principios que aplican a todos los planes (se muestran en el catálogo). */
export const PRINCIPLES = [
  'Frecuencia: entrenar cada músculo al menos 2 veces por semana produce más hipertrofia que 1 vez con el mismo volumen (metaanálisis de Schoenfeld, Ogborn y Krieger, 2016).',
  'Volumen: hay una relación dosis-respuesta entre series semanales y crecimiento muscular; ~10–20 series por músculo a la semana es un rango eficaz para la mayoría (Schoenfeld, Ogborn y Krieger, 2017).',
  'Intensidad: se gana músculo con cargas ligeras o pesadas siempre que se trabaje cerca del fallo; quedarse a 1–3 repeticiones en reserva (RIR) da casi todo el beneficio con menos fatiga (Refalo y cols., 2023).',
  'Sobrecarga progresiva (doble progresión): trabaja en un rango de reps (ej. 8–12). Cuando completes el tope del rango en todas las series con buena técnica, sube el peso al siguiente incremento y vuelve a la parte baja del rango.',
];

const MIN = 'Reps = minutos.';
const SEG = 'Reps = segundos.';

export const PLANS: Plan[] = [
  // ------------------------------------------------------------------
  {
    id: 'principiante-fullbody-gym',
    name: 'Full Body 3 días (gimnasio)',
    level: 'Principiante',
    equipment: 'gym',
    equipmentLabel: 'Gimnasio: barra, mancuernas, máquinas y poleas',
    durationWeeks: '12 semanas',
    summary:
      'Tres sesiones de cuerpo completo (A, B, C) con los ejercicios básicos. Ideal para aprender la técnica y progresar rápido.',
    rationale: [
      'Cada músculo se entrena 3 veces por semana con ~9–12 series semanales: el extremo bajo del rango eficaz, suficiente para un principiante y fácil de recuperar.',
      'Los multiarticulares (sentadilla, press, remo, peso muerto rumano) van primero, cuando estás más fresco.',
      'Rangos de 6–15 reps a 1–3 RIR. En las primeras 2 semanas deja 3 reps en reserva mientras aprendes la técnica.',
      'Si solo puedes 2 días, alterna A-B-C en rotación: cada músculo seguirá recibiendo ~2 estímulos por semana.',
    ],
    variants: [
      {
        daysPerWeek: [2, 3],
        days: [
          {
            name: 'Día A',
            items: [
              { exerciseId: 'Barbell_Squat', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Seated_Cable_Rows', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Lying_Leg_Curls', sets: 2, repsMin: 10, repsMax: 15, restSec: 75 },
              { exerciseId: 'Plank', sets: 2, repsMin: 30, repsMax: 45, restSec: 60, note: SEG },
            ],
          },
          {
            name: 'Día B',
            items: [
              { exerciseId: 'Romanian_Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Standing_Military_Press', sets: 3, repsMin: 6, repsMax: 10, restSec: 120 },
              { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Leg_Press', sets: 2, repsMin: 10, repsMax: 15, restSec: 120 },
              { exerciseId: 'Dumbbell_Bicep_Curl', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Triceps_Pushdown', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
          {
            name: 'Día C',
            items: [
              { exerciseId: 'Leg_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Incline_Dumbbell_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'One-Arm_Dumbbell_Row', sets: 3, repsMin: 8, repsMax: 12, restSec: 90, note: 'Series por lado.' },
              { exerciseId: 'Barbell_Hip_Thrust', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Side_Lateral_Raise', sets: 2, repsMin: 12, repsMax: 20, restSec: 60 },
              { exerciseId: 'Standing_Calf_Raises', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'principiante-casa-kettlebell',
    name: 'Full Body en casa (kettlebell + peso corporal)',
    level: 'Principiante',
    equipment: 'home',
    equipmentLabel: '1–2 kettlebells y peso corporal (opcional: mesa firme o anillas para remo invertido)',
    durationWeeks: '8–12 semanas',
    summary:
      'Dos rutinas (A y B) que se alternan 2 o 3 días por semana. Solo necesitas una kettlebell y espacio para moverte.',
    rationale: [
      'Con 3 días (A-B-A, B-A-B) cada músculo recibe 2–3 estímulos semanales y ~8–12 series: suficiente para progresar como principiante.',
      'Con 2 días se mantiene la frecuencia de 2x por semana para piernas, empuje y tracción.',
      'Con una sola kettlebell la progresión se hace sobre todo por repeticiones y control (tempo, pausas). Cuando llegues al tope del rango con facilidad, pasa a la siguiente kettlebell (+4 kg).',
      'El swing aporta trabajo de cadena posterior y algo de acondicionamiento cardiovascular.',
    ],
    guidelines: [
      'Flexiones: si no llegas a 6 reps, usa la versión inclinada (manos en una mesa o banco).',
      'Remo invertido: debajo de una mesa robusta o con anillas. Si no tienes dónde, sustitúyelo por remo con kettlebell.',
    ],
    variants: [
      {
        daysPerWeek: [2, 3],
        days: [
          {
            name: 'Día A',
            items: [
              { exerciseId: 'Goblet_Squat', sets: 3, repsMin: 8, repsMax: 15, restSec: 90 },
              { exerciseId: 'Pushups', sets: 3, repsMin: 6, repsMax: 15, restSec: 90 },
              { exerciseId: 'One-Arm_Kettlebell_Row', sets: 3, repsMin: 8, repsMax: 12, restSec: 60, note: 'Series por lado.' },
              { exerciseId: 'One-Arm_Kettlebell_Swings', sets: 3, repsMin: 10, repsMax: 15, restSec: 75, note: 'Por lado. Si prefieres, a dos manos.' },
              { exerciseId: 'Plank', sets: 2, repsMin: 20, repsMax: 45, restSec: 60, note: SEG },
            ],
          },
          {
            name: 'Día B',
            items: [
              { exerciseId: 'Split_Squats', sets: 3, repsMin: 8, repsMax: 12, restSec: 75, note: 'Por pierna. Sujeta la kettlebell en goblet para añadir carga.' },
              { exerciseId: 'Alternating_Kettlebell_Press', sets: 3, repsMin: 6, repsMax: 10, restSec: 90, note: 'Por brazo. Con una sola kettlebell, completa un lado y luego el otro.' },
              { exerciseId: 'Inverted_Row', sets: 3, repsMin: 6, repsMax: 12, restSec: 90 },
              { exerciseId: 'Kettlebell_One-Legged_Deadlift', sets: 2, repsMin: 8, repsMax: 12, restSec: 75, note: 'Por pierna.' },
              { exerciseId: 'Butt_Lift_Bridge', sets: 2, repsMin: 12, repsMax: 20, restSec: 60 },
              { exerciseId: 'Dead_Bug', sets: 2, repsMin: 6, repsMax: 10, restSec: 45, note: 'Por lado.' },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'intermedio-upper-lower',
    name: 'Upper/Lower 4 días',
    level: 'Intermedio',
    equipment: 'gym',
    equipmentLabel: 'Gimnasio completo',
    durationWeeks: '10–12 semanas',
    summary:
      'Torso y pierna dos veces por semana cada uno (A/B), con un día fuerte en básicos y otro de más repeticiones.',
    rationale: [
      'Frecuencia 2x por músculo y ~12–16 series semanales para los grupos grandes, dentro del rango de 10–20.',
      'Cada día empieza con un básico en rango bajo de reps (4–8) para fuerza, seguido de trabajo de 8–15 reps para hipertrofia.',
      'Organización típica: Lunes torso A, martes pierna A, jueves torso B, viernes pierna B.',
      'Cada 6–8 semanas, o si el rendimiento se estanca, haz una semana de descarga con la mitad de las series.',
    ],
    variants: [
      {
        daysPerWeek: [4],
        days: [
          {
            name: 'Torso A',
            items: [
              { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 4, repsMin: 5, repsMax: 8, restSec: 180 },
              { exerciseId: 'Bent_Over_Barbell_Row', sets: 4, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Dumbbell_Shoulder_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Dumbbell_Bicep_Curl', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Triceps_Pushdown', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
          {
            name: 'Pierna A',
            items: [
              { exerciseId: 'Barbell_Squat', sets: 4, repsMin: 5, repsMax: 8, restSec: 180 },
              { exerciseId: 'Romanian_Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Split_Squat_with_Dumbbells', sets: 3, repsMin: 8, repsMax: 12, restSec: 90, note: 'Por pierna.' },
              { exerciseId: 'Lying_Leg_Curls', sets: 3, repsMin: 10, repsMax: 15, restSec: 75 },
              { exerciseId: 'Standing_Calf_Raises', sets: 3, repsMin: 8, repsMax: 12, restSec: 60 },
              { exerciseId: 'Hanging_Leg_Raise', sets: 2, repsMin: 8, repsMax: 15, restSec: 60 },
            ],
          },
          {
            name: 'Torso B',
            items: [
              { exerciseId: 'Pullups', sets: 4, repsMin: 5, repsMax: 10, restSec: 150, note: 'Si no llegas a 5, usa jalón al pecho o dominadas asistidas.' },
              { exerciseId: 'Incline_Dumbbell_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Standing_Military_Press', sets: 3, repsMin: 6, repsMax: 10, restSec: 120 },
              { exerciseId: 'Seated_Cable_Rows', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Side_Lateral_Raise', sets: 3, repsMin: 12, repsMax: 20, restSec: 60 },
              { exerciseId: 'Face_Pull', sets: 2, repsMin: 12, repsMax: 20, restSec: 60 },
              { exerciseId: 'EZ-Bar_Skullcrusher', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
          {
            name: 'Pierna B',
            items: [
              { exerciseId: 'Barbell_Deadlift', sets: 3, repsMin: 4, repsMax: 6, restSec: 180 },
              { exerciseId: 'Leg_Press', sets: 3, repsMin: 10, repsMax: 15, restSec: 120 },
              { exerciseId: 'Barbell_Hip_Thrust', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Leg_Extensions', sets: 2, repsMin: 12, repsMax: 15, restSec: 60 },
              { exerciseId: 'Seated_Leg_Curl', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Seated_Calf_Raise', sets: 3, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Cable_Crunch', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'intermedio-ppl',
    name: 'Push/Pull/Legs (3 o 6 días)',
    level: 'Intermedio',
    equipment: 'gym',
    equipmentLabel: 'Gimnasio completo',
    durationWeeks: '10–12 semanas',
    summary:
      'Empuje, tracción y pierna. Con 6 días cada músculo se entrena 2 veces por semana; con 3 días, una vez.',
    rationale: [
      'Con 6 días (PPL × 2) cada músculo recibe 2 estímulos y ~12–20 series semanales: la versión recomendada.',
      'Con 5 días la rotación continúa de una semana a la siguiente (frecuencia media ~1,7x).',
      'Con 3 días la frecuencia baja a 1x por semana, menos eficiente según la evidencia. Si solo tienes 3 días, Full Body o Upper/Lower suelen rendir mejor.',
      'Al tener mucho volumen, controla la recuperación: si el rendimiento cae dos sesiones seguidas, quita 1 serie por ejercicio durante una semana.',
    ],
    variants: [
      {
        daysPerWeek: [3, 5, 6],
        days: [
          {
            name: 'Push (empuje)',
            items: [
              { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 4, repsMin: 6, repsMax: 10, restSec: 180 },
              { exerciseId: 'Incline_Dumbbell_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Dumbbell_Shoulder_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Side_Lateral_Raise', sets: 3, repsMin: 12, repsMax: 20, restSec: 60 },
              { exerciseId: 'Cable_Crossover', sets: 2, repsMin: 12, repsMax: 15, restSec: 60 },
              { exerciseId: 'Triceps_Pushdown_-_Rope_Attachment', sets: 3, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
          {
            name: 'Pull (tracción)',
            items: [
              { exerciseId: 'Pullups', sets: 4, repsMin: 6, repsMax: 10, restSec: 150, note: 'Si no llegas a 6, usa jalón al pecho.' },
              { exerciseId: 'Bent_Over_Barbell_Row', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Seated_Cable_Rows', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Face_Pull', sets: 3, repsMin: 12, repsMax: 20, restSec: 60 },
              { exerciseId: 'Barbell_Curl', sets: 3, repsMin: 8, repsMax: 12, restSec: 75 },
              { exerciseId: 'Hammer_Curls', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
            ],
          },
          {
            name: 'Legs (pierna)',
            items: [
              { exerciseId: 'Barbell_Squat', sets: 4, repsMin: 5, repsMax: 8, restSec: 180 },
              { exerciseId: 'Romanian_Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Leg_Press', sets: 3, repsMin: 10, repsMax: 15, restSec: 120 },
              { exerciseId: 'Lying_Leg_Curls', sets: 3, repsMin: 10, repsMax: 15, restSec: 75 },
              { exerciseId: 'Standing_Calf_Raises', sets: 4, repsMin: 8, repsMax: 12, restSec: 60 },
              { exerciseId: 'Hanging_Leg_Raise', sets: 3, repsMin: 8, repsMax: 15, restSec: 60 },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'regreso-al-entrenamiento',
    name: 'Regreso al entrenamiento',
    level: 'Regreso',
    equipment: 'gym',
    equipmentLabel: 'Gimnasio (mancuernas, máquinas y poleas; barra opcional)',
    durationWeeks: '8 semanas (luego pasa a Upper/Lower o PPL)',
    summary:
      'Para quien entrenó varios años pero lleva más de 5 sin hacerlo. Full Body A/B con volumen que sube poco a poco durante las primeras 4 semanas.',
    rationale: [
      'La "memoria muscular" existe: tras entrenar, el músculo conserva adaptaciones (mionúcleos, cambios epigenéticos) y se recupera más rápido de lo que costó ganarlo la primera vez (Bruusgaard y cols., 2010; Seaborne y cols., 2018). Aun así, tras 5 años conviene reintroducir la carga de forma gradual.',
      'Tendones y articulaciones se adaptan más lento que el músculo. Empezar con poco volumen y lejos del fallo reduce el riesgo de molestias y de agujetas severas, y aprovecha el "efecto de la carga repetida": las sesiones siguientes dañan menos.',
      'Se priorizan mancuernas y máquinas para recuperar control y técnica antes de volver a cargar la barra en los básicos.',
      'Frecuencia 2–3x por semana para cada músculo desde el primer día; lo que cambia es el número de series y el esfuerzo.',
    ],
    guidelines: [
      'Semanas 1–2: 2 series por ejercicio (así viene la rutina), con 3–4 reps en reserva (RIR 3–4). Pesos conservadores: elige un peso que podrías mover ~12–15 veces.',
      'Semanas 3–4: sube a 3 series por ejercicio, RIR 2–3. Edita la rutina o añade la serie en el modo entrenamiento.',
      'Semanas 5–8: 3–4 series en los básicos y RIR 1–3. Aplica la doble progresión. Puedes cambiar sentadilla goblet y prensa por sentadilla con barra.',
      'Si algo duele (dolor articular agudo, no agujetas), baja el peso o cambia el ejercicio. Si tienes lesiones previas, consulta a un profesional.',
    ],
    variants: [
      {
        daysPerWeek: [2, 3],
        days: [
          {
            name: 'Día A',
            items: [
              { exerciseId: 'Goblet_Squat', sets: 2, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Dumbbell_Bench_Press', sets: 2, repsMin: 8, repsMax: 12, restSec: 120 },
              { exerciseId: 'Seated_Cable_Rows', sets: 2, repsMin: 10, repsMax: 12, restSec: 90 },
              { exerciseId: 'Stiff-Legged_Dumbbell_Deadlift', sets: 2, repsMin: 10, repsMax: 12, restSec: 90 },
              { exerciseId: 'Side_Lateral_Raise', sets: 2, repsMin: 12, repsMax: 15, restSec: 60 },
              { exerciseId: 'Plank', sets: 2, repsMin: 20, repsMax: 40, restSec: 60, note: SEG },
            ],
          },
          {
            name: 'Día B',
            items: [
              { exerciseId: 'Leg_Press', sets: 2, repsMin: 10, repsMax: 15, restSec: 120 },
              { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Dumbbell_Shoulder_Press', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Lying_Leg_Curls', sets: 2, repsMin: 10, repsMax: 15, restSec: 75 },
              { exerciseId: 'Incline_Dumbbell_Press', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Dead_Bug', sets: 2, repsMin: 8, repsMax: 10, restSec: 45, note: 'Por lado.' },
            ],
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'recomposicion-fuerza-cardio',
    name: 'Recomposición: fuerza + trote',
    level: 'Principiante',
    equipment: 'gym',
    equipmentLabel: 'Gimnasio + calle o cinta para trotar',
    durationWeeks: '12–16 semanas',
    summary:
      'Bajar grasa manteniendo (o ganando) músculo: fuerza full body para conservar la masa muscular y trote para aumentar el gasto calórico.',
    rationale: [
      'La recomposición es posible, sobre todo en principiantes, personas que retoman y quienes tienen más grasa, si se combina entrenamiento de fuerza, proteína alta y un déficit moderado (Barakat y cols., 2020).',
      'La fuerza es la señal para mantener el músculo en déficit: se conserva la intensidad (pesos) aunque el volumen sea moderado (~10–12 series por músculo).',
      'El cardio en dosis moderadas apenas interfiere con las ganancias de fuerza. La interferencia aumenta con mucho volumen de carrera (Wilson y cols., 2012). Si puedes, separa trote y piernas pesadas por 6 horas o haz el trote después de la fuerza.',
      'Las guías de la OMS recomiendan 150–300 min/semana de actividad aeróbica moderada. Aquí suman ~90–150 min de trote, más los pasos diarios.',
    ],
    guidelines: [
      'Nutrición (lo que más pesa en bajar grasa): déficit moderado (~300–500 kcal/día), proteína ~1,6–2,2 g por kg de peso al día.',
      'Objetivo de pérdida: ~0,5–1 % del peso corporal por semana. Regístralo en Progreso para ver la tendencia.',
      'Trote zona 2: ritmo al que puedes hablar en frases cortas. Si estás empezando, alterna 2 min trotando y 1 min caminando.',
      'Pasos diarios: 7.000–10.000 ayudan al gasto calórico sin afectar la recuperación.',
    ],
    variants: [
      {
        daysPerWeek: [3],
        days: [
          {
            name: 'Fuerza A + trote',
            items: [
              { exerciseId: 'Barbell_Squat', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Bent_Over_Barbell_Row', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Lying_Leg_Curls', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Jogging_Treadmill', sets: 1, repsMin: 20, repsMax: 30, restSec: 0, note: `${MIN} Trote suave (zona 2) al terminar la fuerza.` },
            ],
          },
          {
            name: 'Fuerza B + trote',
            items: [
              { exerciseId: 'Romanian_Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Dumbbell_Shoulder_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Split_Squat_with_Dumbbells', sets: 2, repsMin: 8, repsMax: 12, restSec: 90, note: 'Por pierna.' },
              { exerciseId: 'Plank', sets: 2, repsMin: 30, repsMax: 45, restSec: 45, note: SEG },
              { exerciseId: 'Jogging_Treadmill', sets: 1, repsMin: 20, repsMax: 30, restSec: 0, note: `${MIN} Trote suave (zona 2) al terminar la fuerza.` },
            ],
          },
          {
            name: 'Fuerza C + trote',
            items: [
              { exerciseId: 'Leg_Press', sets: 3, repsMin: 10, repsMax: 15, restSec: 120 },
              { exerciseId: 'Incline_Dumbbell_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Seated_Cable_Rows', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Barbell_Hip_Thrust', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Dumbbell_Bicep_Curl', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Triceps_Pushdown', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Jogging_Treadmill', sets: 1, repsMin: 20, repsMax: 30, restSec: 0, note: `${MIN} Trote suave (zona 2) al terminar la fuerza.` },
            ],
          },
        ],
      },
      {
        daysPerWeek: [4, 5, 6],
        days: [
          {
            name: 'Fuerza A',
            items: [
              { exerciseId: 'Barbell_Squat', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Bent_Over_Barbell_Row', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Lying_Leg_Curls', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
              { exerciseId: 'Side_Lateral_Raise', sets: 2, repsMin: 12, repsMax: 20, restSec: 60 },
            ],
          },
          {
            name: 'Trote zona 2',
            items: [
              { exerciseId: 'Jogging_Treadmill', sets: 1, repsMin: 30, repsMax: 45, restSec: 0, note: `${MIN} Ritmo conversacional. Sube 5 min cada semana que te sientas bien.` },
            ],
          },
          {
            name: 'Fuerza B',
            items: [
              { exerciseId: 'Romanian_Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150 },
              { exerciseId: 'Dumbbell_Shoulder_Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Wide-Grip_Lat_Pulldown', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Split_Squat_with_Dumbbells', sets: 2, repsMin: 8, repsMax: 12, restSec: 90, note: 'Por pierna.' },
              { exerciseId: 'Incline_Dumbbell_Press', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
              { exerciseId: 'Plank', sets: 2, repsMin: 30, repsMax: 45, restSec: 45, note: SEG },
            ],
          },
          {
            name: 'Trote con intervalos',
            items: [
              { exerciseId: 'Running_Treadmill', sets: 6, repsMin: 1, repsMax: 2, restSec: 120, note: `${MIN} Tramos rápidos (esfuerzo 8/10) con 2 min caminando entre cada uno. Calienta 10 min trotando suave antes.` },
            ],
          },
        ],
      },
    ],
  },
];

export function getPlan(id: string | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Variante adecuada para N días/semana (o la más cercana si ninguna coincide). */
export function variantFor(plan: Plan, daysPerWeek: number): PlanVariant {
  return (
    plan.variants.find((v) => v.daysPerWeek.includes(daysPerWeek)) ??
    [...plan.variants].sort(
      (a, b) =>
        Math.min(...a.daysPerWeek.map((d) => Math.abs(d - daysPerWeek))) -
        Math.min(...b.daysPerWeek.map((d) => Math.abs(d - daysPerWeek))),
    )[0]
  );
}

/** Todos los días/semana que admite un plan, ordenados. */
export function planDayOptions(plan: Plan): number[] {
  return [...new Set(plan.variants.flatMap((v) => v.daysPerWeek))].sort((a, b) => a - b);
}
