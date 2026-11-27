/**
 * Traducciones al español (curadas a mano, sin traducción automática).
 * - Términos de músculos, equipamiento, categoría y nivel: completos.
 * - Ejercicios: nombre de los ~130 más comunes; instrucciones de los principales.
 *   Si un ejercicio no tiene traducción se muestra el texto original en inglés.
 */

export const MUSCLES_ES: Record<string, string> = {
  abdominals: 'Abdominales',
  abductors: 'Abductores',
  adductors: 'Aductores',
  biceps: 'Bíceps',
  calves: 'Pantorrillas',
  chest: 'Pecho',
  forearms: 'Antebrazos',
  glutes: 'Glúteos',
  hamstrings: 'Isquiotibiales',
  lats: 'Dorsales',
  'lower back': 'Zona lumbar',
  'middle back': 'Espalda media',
  neck: 'Cuello',
  quadriceps: 'Cuádriceps',
  shoulders: 'Hombros',
  traps: 'Trapecios',
  triceps: 'Tríceps',
};

export const EQUIPMENT_ES: Record<string, string> = {
  'body only': 'Peso corporal',
  kettlebells: 'Kettlebell',
  dumbbell: 'Mancuernas',
  barbell: 'Barra',
  'e-z curl bar': 'Barra Z',
  machine: 'Máquina',
  cable: 'Polea',
  bands: 'Bandas',
  'medicine ball': 'Balón medicinal',
  'exercise ball': 'Fitball',
  'foam roll': 'Rodillo',
  other: 'Otro',
};

/** Orden de los filtros de equipamiento (los principales primero). */
export const EQUIPMENT_ORDER = [
  'body only', 'kettlebells', 'dumbbell', 'barbell', 'machine', 'cable',
  'e-z curl bar', 'bands', 'medicine ball', 'exercise ball', 'foam roll', 'other',
];

export const CATEGORY_ES: Record<string, string> = {
  strength: 'Fuerza',
  cardio: 'Cardio',
  stretching: 'Estiramiento',
  plyometrics: 'Pliometría',
  powerlifting: 'Powerlifting',
  'olympic weightlifting': 'Halterofilia',
  strongman: 'Strongman',
};

export const LEVEL_ES: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  expert: 'Avanzado',
};

export const FORCE_ES: Record<string, string> = {
  push: 'Empuje',
  pull: 'Tracción',
  static: 'Isométrico',
};

export const MECHANIC_ES: Record<string, string> = {
  compound: 'Multiarticular',
  isolation: 'Aislamiento',
};

interface ExerciseEs {
  name: string;
  instructions?: string[];
}

export const EXERCISES_ES: Record<string, ExerciseEs> = {
  // ---------- Piernas ----------
  Barbell_Full_Squat: {
    name: 'Sentadilla con barra (profunda)',
    instructions: [
      'Coloca la barra sobre la parte alta de la espalda, pies a la anchura de los hombros y puntas ligeramente hacia fuera.',
      'Toma aire, aprieta el abdomen y baja flexionando caderas y rodillas a la vez, con el pecho erguido.',
      'Desciende hasta que la cadera quede por debajo de las rodillas manteniendo la espalda neutra.',
      'Empuja el suelo con todo el pie para subir y exhala al final del movimiento.',
    ],
  },
  Barbell_Squat: {
    name: 'Sentadilla con barra',
    instructions: [
      'Coloca la barra sobre los trapecios y sal del soporte con los pies a la anchura de los hombros.',
      'Con el abdomen firme, baja controlando hasta que los muslos queden al menos paralelos al suelo.',
      'Mantén las rodillas en la dirección de las puntas de los pies y el peso repartido en todo el pie.',
      'Sube empujando con las piernas hasta extender caderas y rodillas.',
    ],
  },
  Barbell_Squat_To_A_Bench: { name: 'Sentadilla con barra a banco' },
  Front_Squat_Clean_Grip: {
    name: 'Sentadilla frontal con barra',
    instructions: [
      'Apoya la barra sobre la parte delantera de los hombros con los codos altos.',
      'Baja con el torso lo más vertical posible hasta la profundidad que domines.',
      'Sube empujando el suelo sin dejar caer los codos.',
    ],
  },
  Goblet_Squat: {
    name: 'Sentadilla goblet',
    instructions: [
      'Sostén una kettlebell o mancuerna pegada al pecho con ambas manos.',
      'Pies algo más abiertos que los hombros. Baja entre las piernas manteniendo el pecho alto.',
      'Llega lo más abajo que puedas con la espalda neutra y los codos por dentro de las rodillas.',
      'Sube empujando con los talones y el medio pie.',
    ],
  },
  Front_Squats_With_Two_Kettlebells: { name: 'Sentadilla frontal con dos kettlebells' },
  Bodyweight_Squat: {
    name: 'Sentadilla sin peso',
    instructions: [
      'De pie con los pies a la anchura de los hombros y los brazos al frente.',
      'Baja llevando la cadera atrás y abajo, con el pecho erguido.',
      'Sube hasta extender completamente caderas y rodillas.',
    ],
  },
  Smith_Machine_Squat: { name: 'Sentadilla en máquina Smith' },
  Hack_Squat: { name: 'Sentadilla hack' },
  Leg_Press: {
    name: 'Prensa de piernas',
    instructions: [
      'Siéntate con la espalda bien apoyada y los pies en la plataforma a la anchura de las caderas.',
      'Quita los seguros y baja la plataforma flexionando las rodillas hacia el pecho sin despegar la zona lumbar.',
      'Empuja hasta casi extender las rodillas, sin bloquearlas.',
    ],
  },
  Leg_Extensions: {
    name: 'Extensión de cuádriceps en máquina',
    instructions: [
      'Ajusta la máquina para que la rodilla quede alineada con el eje y el rodillo sobre los tobillos.',
      'Extiende las piernas hasta arriba y aprieta el cuádriceps un instante.',
      'Baja de forma controlada.',
    ],
  },
  Lying_Leg_Curls: {
    name: 'Curl femoral tumbado',
    instructions: [
      'Túmbate boca abajo con el rodillo justo por encima de los talones.',
      'Flexiona las rodillas llevando los talones hacia los glúteos sin levantar la cadera.',
      'Baja lentamente hasta casi extender.',
    ],
  },
  Seated_Leg_Curl: { name: 'Curl femoral sentado' },
  Barbell_Deadlift: {
    name: 'Peso muerto con barra',
    instructions: [
      'Pies a la anchura de las caderas con la barra sobre el medio pie. Agárrala justo por fuera de las piernas.',
      'Baja la cadera hasta que las tibias toquen la barra, pecho alto y espalda neutra.',
      'Toma aire, aprieta el abdomen y empuja el suelo con las piernas manteniendo la barra pegada al cuerpo.',
      'Termina de pie con caderas extendidas, sin hiperextender la espalda. Baja con el mismo control.',
    ],
  },
  Sumo_Deadlift: { name: 'Peso muerto sumo' },
  Romanian_Deadlift: {
    name: 'Peso muerto rumano',
    instructions: [
      'De pie sosteniendo la barra a la altura de las caderas, rodillas ligeramente flexionadas.',
      'Lleva la cadera hacia atrás bajando la barra pegada a las piernas con la espalda neutra.',
      'Baja hasta notar estiramiento en los isquiotibiales (normalmente a media tibia).',
      'Vuelve a subir empujando la cadera hacia delante y apretando glúteos.',
    ],
  },
  'Stiff-Legged_Barbell_Deadlift': { name: 'Peso muerto piernas rígidas con barra' },
  'Stiff-Legged_Dumbbell_Deadlift': {
    name: 'Peso muerto rumano con mancuernas',
    instructions: [
      'De pie con una mancuerna en cada mano delante de los muslos.',
      'Lleva la cadera atrás deslizando las mancuernas por las piernas con la espalda neutra.',
      'Al notar estiramiento en los isquiotibiales, vuelve a subir apretando glúteos.',
    ],
  },
  'Kettlebell_One-Legged_Deadlift': { name: 'Peso muerto a una pierna con kettlebell' },
  Good_Morning: { name: 'Buenos días con barra' },
  Barbell_Lunge: { name: 'Zancada con barra' },
  Barbell_Walking_Lunge: { name: 'Zancada caminando con barra' },
  Bodyweight_Walking_Lunge: { name: 'Zancada caminando sin peso' },
  Dumbbell_Lunges: {
    name: 'Zancadas con mancuernas',
    instructions: [
      'De pie con una mancuerna en cada mano a los costados.',
      'Da un paso largo al frente y baja hasta que la rodilla de atrás casi toque el suelo.',
      'Empuja con el pie delantero para volver y alterna de pierna.',
    ],
  },
  Crossover_Reverse_Lunge: { name: 'Zancada inversa cruzada' },
  Split_Squats: { name: 'Sentadilla dividida' },
  Split_Squat_with_Dumbbells: {
    name: 'Sentadilla búlgara / dividida con mancuernas',
    instructions: [
      'Coloca un pie adelante y el otro atrás (puede ir apoyado en un banco).',
      'Baja en vertical flexionando ambas rodillas hasta que la de atrás casi toque el suelo.',
      'Sube empujando con la pierna delantera. Completa las reps y cambia de lado.',
    ],
  },
  Dumbbell_Step_Ups: {
    name: 'Subida al cajón con mancuernas',
    instructions: [
      'Con una mancuerna en cada mano, apoya un pie completo sobre un banco o cajón.',
      'Sube empujando con esa pierna sin impulsarte con la de abajo.',
      'Baja controlando y repite.',
    ],
  },
  Barbell_Hip_Thrust: {
    name: 'Hip thrust con barra',
    instructions: [
      'Siéntate en el suelo con la parte alta de la espalda apoyada en un banco y la barra sobre la cadera.',
      'Con los pies apoyados, empuja la cadera hacia arriba hasta que el torso quede paralelo al suelo.',
      'Aprieta glúteos arriba, con la barbilla metida, y baja controlando.',
    ],
  },
  Barbell_Glute_Bridge: { name: 'Puente de glúteos con barra' },
  Butt_Lift_Bridge: {
    name: 'Puente de glúteos',
    instructions: [
      'Túmbate boca arriba con rodillas flexionadas y pies apoyados.',
      'Eleva la cadera apretando glúteos hasta alinear hombros, cadera y rodillas.',
      'Mantén un segundo y baja lentamente.',
    ],
  },
  Single_Leg_Glute_Bridge: { name: 'Puente de glúteos a una pierna' },
  Standing_Calf_Raises: {
    name: 'Elevación de talones de pie',
    instructions: [
      'Coloca la parte delantera de los pies en el borde de la plataforma.',
      'Sube lo más alto posible sobre las puntas y mantén un instante.',
      'Baja hasta estirar bien la pantorrilla.',
    ],
  },
  Seated_Calf_Raise: { name: 'Elevación de talones sentado' },
  Standing_Dumbbell_Calf_Raise: { name: 'Elevación de talones con mancuernas' },
  Smith_Machine_Calf_Raise: { name: 'Elevación de talones en máquina Smith' },

  // ---------- Pecho ----------
  'Barbell_Bench_Press_-_Medium_Grip': {
    name: 'Press de banca con barra',
    instructions: [
      'Túmbate en el banco con los ojos bajo la barra, pies firmes en el suelo y escápulas juntas.',
      'Agarra la barra algo más abierto que los hombros y sácala del soporte.',
      'Baja controlando hasta tocar la parte media-baja del pecho con los codos a unos 45°.',
      'Empuja la barra hacia arriba hasta extender los brazos.',
    ],
  },
  'Barbell_Incline_Bench_Press_-_Medium_Grip': { name: 'Press inclinado con barra' },
  'Close-Grip_Barbell_Bench_Press': { name: 'Press de banca agarre cerrado' },
  Dumbbell_Bench_Press: {
    name: 'Press de banca con mancuernas',
    instructions: [
      'Túmbate en el banco con una mancuerna en cada mano a la altura del pecho.',
      'Empuja las mancuernas hacia arriba hasta extender los brazos.',
      'Baja controlando hasta notar estiramiento en el pecho.',
    ],
  },
  Dumbbell_Bench_Press_with_Neutral_Grip: { name: 'Press con mancuernas agarre neutro' },
  Incline_Dumbbell_Press: {
    name: 'Press inclinado con mancuernas',
    instructions: [
      'Ajusta el banco a 30–45° y siéntate con una mancuerna en cada mano.',
      'Empuja las mancuernas hacia arriba sobre la parte alta del pecho.',
      'Baja lentamente hasta la altura del pecho y repite.',
    ],
  },
  Dumbbell_Flyes: { name: 'Aperturas con mancuernas' },
  Cable_Crossover: { name: 'Cruce de poleas' },
  Butterfly: { name: 'Contractora de pecho (pec deck)' },
  Machine_Bench_Press: { name: 'Press de pecho en máquina' },
  Leverage_Chest_Press: { name: 'Press de pecho en máquina articulada' },
  Leverage_Incline_Chest_Press: { name: 'Press inclinado en máquina' },
  Cable_Chest_Press: { name: 'Press de pecho en polea' },
  Pushups: {
    name: 'Flexiones',
    instructions: [
      'Manos en el suelo algo más abiertas que los hombros, cuerpo recto de la cabeza a los talones.',
      'Baja el pecho hacia el suelo con los codos a unos 45° del cuerpo.',
      'Empuja hasta extender los brazos sin dejar caer la cadera.',
    ],
  },
  'Pushups_Close_and_Wide_Hand_Positions': { name: 'Flexiones (agarre cerrado y abierto)' },
  'Incline_Push-Up': {
    name: 'Flexiones inclinadas',
    instructions: [
      'Apoya las manos en un banco o superficie elevada, cuerpo recto.',
      'Baja el pecho hacia el borde y empuja de vuelta. Cuanto más alta la superficie, más fácil.',
    ],
  },
  'Push-Ups_With_Feet_Elevated': { name: 'Flexiones con pies elevados' },
  'Dips_-_Chest_Version': { name: 'Fondos en paralelas (pecho)' },
  'One-Arm_Kettlebell_Floor_Press': { name: 'Press en el suelo con kettlebell a una mano' },

  // ---------- Espalda ----------
  Pullups: {
    name: 'Dominadas',
    instructions: [
      'Cuélgate de la barra con agarre prono algo más abierto que los hombros.',
      'Tira llevando los codos hacia abajo hasta que la barbilla supere la barra.',
      'Baja controlando hasta extender los brazos.',
    ],
  },
  'Chin-Up': {
    name: 'Dominadas supinas (chin-up)',
    instructions: [
      'Cuélgate con las palmas hacia ti a la anchura de los hombros.',
      'Sube hasta que la barbilla supere la barra y baja con control.',
    ],
  },
  'Wide-Grip_Lat_Pulldown': {
    name: 'Jalón al pecho agarre ancho',
    instructions: [
      'Siéntate con los muslos bajo los rodillos y agarra la barra con agarre ancho.',
      'Tira de la barra hacia la parte alta del pecho llevando los codos hacia abajo y atrás.',
      'Sube controlando hasta estirar los brazos.',
    ],
  },
  'Close-Grip_Front_Lat_Pulldown': { name: 'Jalón al pecho agarre cerrado' },
  'Full_Range-Of-Motion_Lat_Pulldown': { name: 'Jalón al pecho recorrido completo' },
  One_Arm_Lat_Pulldown: { name: 'Jalón a una mano' },
  Bent_Over_Barbell_Row: {
    name: 'Remo con barra inclinado',
    instructions: [
      'Sostén la barra con agarre prono, flexiona ligeramente las rodillas e inclina el torso hacia delante con la espalda neutra.',
      'Tira de la barra hacia el abdomen juntando las escápulas.',
      'Baja controlando hasta extender los brazos.',
    ],
  },
  'Bent_Over_Two-Dumbbell_Row': { name: 'Remo inclinado con dos mancuernas' },
  'One-Arm_Dumbbell_Row': {
    name: 'Remo a una mano con mancuerna',
    instructions: [
      'Apoya una rodilla y una mano en un banco, espalda paralela al suelo.',
      'Con la otra mano, tira de la mancuerna hacia la cadera llevando el codo atrás.',
      'Baja controlando y completa las reps antes de cambiar de lado.',
    ],
  },
  'One-Arm_Kettlebell_Row': {
    name: 'Remo a una mano con kettlebell',
    instructions: [
      'Inclina el torso apoyando una mano en un banco o en la rodilla.',
      'Tira de la kettlebell hacia la cadera con el codo pegado al cuerpo.',
      'Baja controlando y cambia de lado.',
    ],
  },
  'Two-Arm_Kettlebell_Row': { name: 'Remo con dos kettlebells' },
  Alternating_Kettlebell_Row: { name: 'Remo alterno con kettlebells' },
  Seated_Cable_Rows: {
    name: 'Remo sentado en polea',
    instructions: [
      'Siéntate con los pies en la plataforma y rodillas ligeramente flexionadas.',
      'Con la espalda recta, tira del agarre hacia el abdomen juntando las escápulas.',
      'Vuelve controlando hasta estirar los brazos sin redondear la espalda.',
    ],
  },
  Elevated_Cable_Rows: { name: 'Remo en polea elevado' },
  Inverted_Row: {
    name: 'Remo invertido',
    instructions: [
      'Colócate bajo una barra baja (o anillas), cuerpo recto y talones en el suelo.',
      'Tira llevando el pecho hacia la barra y juntando las escápulas.',
      'Baja con control. Cuanto más horizontal el cuerpo, más difícil.',
    ],
  },
  Inverted_Row_with_Straps: { name: 'Remo invertido con correas (TRX)' },
  Face_Pull: { name: 'Face pull en polea' },
  Band_Pull_Apart: { name: 'Separación de banda (pull apart)' },
  Barbell_Shrug: { name: 'Encogimiento de hombros con barra' },
  Dumbbell_Shrug: { name: 'Encogimiento de hombros con mancuernas' },
  Superman: { name: 'Superman (extensión lumbar en suelo)' },

  // ---------- Hombros ----------
  Standing_Military_Press: {
    name: 'Press militar de pie',
    instructions: [
      'Sostén la barra a la altura de los hombros con agarre algo más abierto que ellos.',
      'Aprieta abdomen y glúteos y empuja la barra por encima de la cabeza.',
      'Termina con los brazos extendidos y la barra sobre el medio pie. Baja controlando.',
    ],
  },
  Barbell_Shoulder_Press: { name: 'Press de hombros con barra' },
  Dumbbell_Shoulder_Press: {
    name: 'Press de hombros con mancuernas',
    instructions: [
      'Sentado o de pie, sostén las mancuernas a la altura de los hombros.',
      'Empuja hacia arriba hasta extender los brazos sin arquear la espalda.',
      'Baja lentamente hasta la posición inicial.',
    ],
  },
  'Dumbbell_One-Arm_Shoulder_Press': { name: 'Press de hombro a una mano con mancuerna' },
  Arnold_Dumbbell_Press: { name: 'Press Arnold' },
  Leverage_Shoulder_Press: { name: 'Press de hombros en máquina' },
  'Two-Arm_Kettlebell_Military_Press': { name: 'Press militar con dos kettlebells' },
  Alternating_Kettlebell_Press: {
    name: 'Press alterno con kettlebells',
    instructions: [
      'Lleva dos kettlebells a la posición de rack (sobre los antebrazos, a la altura de los hombros).',
      'Empuja una por encima de la cabeza manteniendo el abdomen firme.',
      'Bájala de vuelta al rack y alterna.',
    ],
  },
  Kettlebell_Seated_Press: { name: 'Press sentado con kettlebell' },
  Kettlebell_Arnold_Press: { name: 'Press Arnold con kettlebell' },
  'One-Arm_Kettlebell_Push_Press': { name: 'Push press a una mano con kettlebell' },
  Push_Press: { name: 'Push press con barra' },
  Side_Lateral_Raise: {
    name: 'Elevaciones laterales',
    instructions: [
      'De pie con una mancuerna en cada mano a los costados y codos ligeramente flexionados.',
      'Eleva los brazos hacia los lados hasta la altura de los hombros.',
      'Baja lentamente sin balancear el cuerpo.',
    ],
  },
  Reverse_Flyes: { name: 'Pájaros (aperturas invertidas)' },
  Upright_Barbell_Row: { name: 'Remo al mentón con barra' },
  Kettlebell_Halo: { name: 'Halo con kettlebell' },

  // ---------- Brazos ----------
  Barbell_Curl: {
    name: 'Curl de bíceps con barra',
    instructions: [
      'De pie, sostén la barra con agarre supino a la anchura de los hombros.',
      'Flexiona los codos subiendo la barra sin mover los brazos ni balancear el torso.',
      'Baja controlando hasta extender los brazos.',
    ],
  },
  Dumbbell_Bicep_Curl: {
    name: 'Curl de bíceps con mancuernas',
    instructions: [
      'De pie con una mancuerna en cada mano y las palmas hacia delante.',
      'Flexiona los codos llevando las mancuernas hacia los hombros, codos pegados al cuerpo.',
      'Baja lentamente.',
    ],
  },
  Hammer_Curls: {
    name: 'Curl martillo',
    instructions: [
      'Sostén las mancuernas con las palmas mirándose entre sí.',
      'Flexiona los codos manteniendo ese agarre neutro y baja controlando.',
    ],
  },
  Preacher_Curl: { name: 'Curl predicador con barra' },
  Machine_Preacher_Curls: { name: 'Curl predicador en máquina' },
  Cable_Preacher_Curl: { name: 'Curl predicador en polea' },
  Triceps_Pushdown: {
    name: 'Extensión de tríceps en polea',
    instructions: [
      'De pie frente a la polea alta, agarra la barra con los codos pegados al cuerpo.',
      'Extiende los codos empujando hacia abajo hasta estirar los brazos.',
      'Vuelve lentamente sin separar los codos.',
    ],
  },
  'Triceps_Pushdown_-_Rope_Attachment': { name: 'Extensión de tríceps en polea con cuerda' },
  'Triceps_Pushdown_-_V-Bar_Attachment': { name: 'Extensión de tríceps en polea con barra V' },
  Cable_Rope_Overhead_Triceps_Extension: { name: 'Extensión de tríceps sobre la cabeza en polea' },
  Kettlebell_Overhead_Triceps_Extension: { name: 'Extensión de tríceps sobre la cabeza con kettlebell' },
  'EZ-Bar_Skullcrusher': { name: 'Press francés con barra Z' },
  Lying_Triceps_Press: { name: 'Press francés tumbado' },
  'Dips_-_Triceps_Version': {
    name: 'Fondos de tríceps',
    instructions: [
      'Sujétate en las paralelas con los brazos extendidos y el torso vertical.',
      'Baja flexionando los codos hasta unos 90°, codos hacia atrás.',
      'Empuja hasta extender los brazos.',
    ],
  },
  Farmers_Walk: { name: 'Paseo del granjero' },

  // ---------- Core ----------
  Plank: {
    name: 'Plancha',
    instructions: [
      'Apoya antebrazos y puntas de los pies, con los codos bajo los hombros.',
      'Mantén el cuerpo recto apretando abdomen y glúteos, sin hundir la cadera.',
      'Aguanta el tiempo indicado respirando con normalidad.',
    ],
  },
  Side_Bridge: { name: 'Plancha lateral' },
  Crunches: { name: 'Abdominales (crunch)' },
  Cable_Crunch: { name: 'Crunch en polea' },
  Hanging_Leg_Raise: { name: 'Elevación de piernas colgado' },
  Russian_Twist: { name: 'Giro ruso' },
  Dead_Bug: {
    name: 'Dead bug (bicho muerto)',
    instructions: [
      'Túmbate boca arriba con brazos hacia el techo y rodillas a 90°.',
      'Pega la zona lumbar al suelo y extiende brazo y pierna contrarios sin despegarla.',
      'Vuelve al centro y alterna.',
    ],
  },
  Pallof_Press: { name: 'Press Pallof' },
  Ab_Roller: { name: 'Rueda abdominal' },
  Mountain_Climbers: { name: 'Escaladores' },

  // ---------- Kettlebell (balísticos y otros) ----------
  'One-Arm_Kettlebell_Swings': {
    name: 'Swing con kettlebell a una mano',
    instructions: [
      'Pies algo más abiertos que los hombros, kettlebell delante en el suelo.',
      'Bisagra de cadera: lleva la kettlebell entre las piernas como un pase de fútbol americano.',
      'Extiende la cadera con fuerza (aprieta glúteos) para proyectar la kettlebell hasta la altura del pecho.',
      'Deja que caiga y vuelve a la bisagra. La fuerza sale de la cadera, no de los brazos.',
    ],
  },
  'One-Arm_Kettlebell_Clean': { name: 'Cargada a una mano con kettlebell' },
  'Two-Arm_Kettlebell_Clean': { name: 'Cargada con dos kettlebells' },
  'One-Arm_Kettlebell_Snatch': { name: 'Arrancada a una mano con kettlebell' },
  Kettlebell_Thruster: { name: 'Thruster con kettlebell' },
  Kettlebell_Sumo_High_Pull: { name: 'Tirón alto sumo con kettlebell' },
  Kettlebell_Windmill: { name: 'Molino con kettlebell' },
  'Kettlebell_Turkish_Get-Up_Lunge_style': {
    name: 'Levantamiento turco con kettlebell',
    instructions: [
      'Túmbate con la kettlebell en una mano, brazo extendido hacia el techo.',
      'Incorpórate apoyándote en el codo y luego en la mano contraria, sin dejar de mirar la kettlebell.',
      'Eleva la cadera, lleva la pierna de atrás a posición de zancada y ponte de pie.',
      'Invierte los pasos para volver al suelo. Hazlo lento y controlado.',
    ],
  },
  'Kettlebell_Turkish_Get-Up_Squat_style': { name: 'Levantamiento turco (estilo sentadilla)' },
  Kettlebell_Pistol_Squat: { name: 'Sentadilla pistol con kettlebell' },
  'One-Arm_Overhead_Kettlebell_Squats': { name: 'Sentadilla con kettlebell sobre la cabeza' },
  Lunge_Pass_Through: { name: 'Zancada pasando la kettlebell' },
  Kettlebell_Figure_8: { name: 'Ocho con kettlebell' },
  Kettlebell_Dead_Clean: { name: 'Cargada desde el suelo con kettlebell' },
  Double_Kettlebell_Push_Press: { name: 'Push press con dos kettlebells' },

  // ---------- Cardio ----------
  Jogging_Treadmill: { name: 'Trote en cinta' },
  Running_Treadmill: { name: 'Carrera en cinta' },
  Walking_Treadmill: { name: 'Caminata en cinta' },
  Air_Bike: { name: 'Bicicleta abdominal' },
  Rope_Jumping: { name: 'Saltar la cuerda' },
  Box_Jump_Multiple_Response: { name: 'Saltos al cajón' },
};
